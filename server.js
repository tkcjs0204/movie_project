const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3000;

// CORS 미들웨어 추가
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// TMDB API 설정
const TMDB_API_KEY = 'f57527b747698724041fc30aecf40a78';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// axios 기본 설정
const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY
  }
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 메인 페이지 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 인기 영화 목록 가져오기
app.get('/api/movies/popular', async (req, res) => {
  try {
    const response = await tmdb.get('/movie/popular', {
      params: {
        language: 'ko-KR'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ error: '영화 데이터를 가져오는데 실패했습니다.' });
  }
});

// 영화 상세 정보 가져오기
app.get('/api/movies/:id', async (req, res) => {
  try {
    const response = await tmdb.get(`/movie/${req.params.id}`, {
      params: {
        language: 'ko-KR'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ error: '영화 상세 정보를 가져오는데 실패했습니다.' });
  }
});

// 영화 검색
app.get('/api/movies/search/:query', async (req, res) => {
  try {
    const response = await tmdb.get('/search/movie', {
      params: {
        query: req.params.query,
        language: 'ko-KR'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({ error: '영화 검색에 실패했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});