// 인기 영화 로드
async function loadPopularMovies() {
    try {
        const response = await fetch('http://localhost:3000/api/movies/popular');
        const data = await response.json();
        displayMovies(data.results, 'popularMovies');
        
        // CSS 클래스를 사용하여 섹션 표시/숨김 처리
        document.querySelector('.popular-movies').classList.remove('hidden');
        document.querySelector('.search-results').classList.add('hidden');
    } catch (error) {
        console.error('인기 영화를 불러오는데 실패했습니다:', error);
    }
}

// 영화 검색
async function searchMovies() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    const searchResultsSection = document.querySelector('.search-results');
    const popularMoviesSection = document.querySelector('.popular-movies');
    const searchResultsContainer = document.querySelector('.search-results .movie-grid');
    const loadingElement = document.querySelector('.loading');

    if (query === '') {
        searchResultsSection.classList.add('hidden');
        popularMoviesSection.classList.remove('hidden');
        return;
    }

    try {
        // 검색 시작 시 UI 상태 업데이트
        searchResultsSection.classList.remove('hidden');
        popularMoviesSection.classList.add('hidden');
        searchResultsContainer.innerHTML = '';
        loadingElement.style.display = 'flex';

        const movies = await fetchSearchResults(query);
        
        loadingElement.style.display = 'none';
        
        if (movies.length === 0) {
            searchResultsContainer.innerHTML = `
                <div class="no-results">
                    <p>"${query}" 검색 결과가 없습니다</p>
                    <p>다른 검색어로 시도해보세요</p>
                </div>
            `;
            return;
        }

        displaySearchResults(movies);
    } catch (error) {
        console.error('Error searching movies:', error);
        loadingElement.style.display = 'none';
        searchResultsContainer.innerHTML = `
            <div class="no-results">
                <p>검색 중 오류가 발생했습니다</p>
                <p>잠시 후 다시 시도해주세요</p>
            </div>
        `;
    }
}

// 영화 상세 정보 로드
async function loadMovieDetails(movieId) {
    try {
        const response = await fetch(`http://localhost:3000/api/movies/${movieId}`);
        const movie = await response.json();
        showMovieModal(movie);
    } catch (error) {
        console.error('영화 상세 정보를 불러오는데 실패했습니다:', error);
    }
}

// 영화 목록 표시
function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.onclick = () => loadMovieDetails(movie.id);

        const posterPath = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Image';

        movieCard.innerHTML = `
            <img src="${posterPath}" alt="${movie.title}">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-rating">★ ${movie.vote_average.toFixed(1)}</div>
            </div>
        `;

        container.appendChild(movieCard);
    });
}

// 댓글 추가
function addComment(movieId) {
    const commentInput = document.getElementById('commentInput');
    const comment = commentInput.value.trim();
    
    if (!comment) return;

    // 현재 시간 가져오기
    const now = new Date();
    const dateStr = now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // 댓글 객체 생성
    const commentObj = {
        id: Date.now(),
        content: comment,
        date: dateStr,
        movieId: movieId
    };

    // 로컬 스토리지에서 기존 댓글 가져오기
    let comments = JSON.parse(localStorage.getItem('movieComments') || '{}');
    
    // 해당 영화의 댓글 배열이 없으면 생성
    if (!comments[movieId]) {
        comments[movieId] = [];
    }

    // 새 댓글 추가
    comments[movieId].unshift(commentObj);

    // 로컬 스토리지에 저장
    localStorage.setItem('movieComments', JSON.stringify(comments));

    // 댓글 목록 업데이트
    displayComments(movieId);

    // 입력 필드 초기화
    commentInput.value = '';
}

// 댓글 목록 표시
function displayComments(movieId) {
    const commentsList = document.getElementById('commentsList');
    const comments = JSON.parse(localStorage.getItem('movieComments') || '{}');
    const movieComments = comments[movieId] || [];

    if (movieComments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>';
        return;
    }

    commentsList.innerHTML = movieComments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span>${comment.date}</span>
                <button onclick="deleteComment(${comment.id}, ${movieId})" class="delete-comment">삭제</button>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');
}

// 댓글 삭제
function deleteComment(commentId, movieId) {
    let comments = JSON.parse(localStorage.getItem('movieComments') || '{}');
    
    if (comments[movieId]) {
        comments[movieId] = comments[movieId].filter(comment => comment.id !== commentId);
        localStorage.setItem('movieComments', JSON.stringify(comments));
        displayComments(movieId);
    }
}

// 모달 표시
function showMovieModal(movie) {
    const modal = document.getElementById('movieModal');
    const modalContent = document.getElementById('movieDetails');
    
    const posterPath = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image';
    
    const backdropPath = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : posterPath;

    modalContent.innerHTML = `
        <img class="movie-backdrop" src="${backdropPath}" alt="${movie.title}">
        <div class="movie-details-content">
            <div class="movie-details-info">
                <h2>${movie.title}</h2>
                <div class="movie-meta">
                    <p class="movie-rating">★ ${movie.vote_average.toFixed(1)}</p>
                    <p>${movie.release_date.split('-')[0]}</p>
                </div>
                <p class="movie-overview">${movie.overview}</p>
                <div class="genre-list">
                    ${movie.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('')}
                </div>
            </div>
            <div class="comments-section">
                <h3>댓글</h3>
                <div class="comment-form">
                    <input type="text" id="commentInput" placeholder="댓글을 입력하세요...">
                    <button onclick="addComment(${movie.id})">댓글 작성</button>
                </div>
                <div class="comments-list" id="commentsList"></div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
    displayComments(movie.id);
}

// 모달 닫기
document.querySelector('.close').onclick = function() {
    document.getElementById('movieModal').style.display = 'none';
}

// 모달 외부 클릭시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('movieModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Enter 키로 검색
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

// 페이지 로드시 인기 영화 로드
document.addEventListener('DOMContentLoaded', loadPopularMovies);

// 스크롤 이벤트 처리
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// 검색 결과 가져오기
async function fetchSearchResults(query) {
    const response = await fetch(`http://localhost:3000/api/movies/search/${encodeURIComponent(query)}`);
    const data = await response.json();
    
    // 검색 결과 헤더 업데이트
    const searchHeader = document.querySelector('.search-results h2');
    searchHeader.textContent = `"${query}" 검색 결과 (${data.results.length}건)`;
    
    return data.results;
}

// 검색 결과 표시
function displaySearchResults(movies) {
    const container = document.querySelector('.search-results .movie-grid');
    container.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.onclick = () => loadMovieDetails(movie.id);

        const posterPath = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Image';

        movieCard.innerHTML = `
            <img src="${posterPath}" alt="${movie.title}">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-rating">★ ${movie.vote_average.toFixed(1)}</div>
            </div>
        `;

        container.appendChild(movieCard);
    });
} 