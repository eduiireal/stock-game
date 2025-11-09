const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stock-trading-game';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB 연결 성공'))
.catch(err => console.error('MongoDB 연결 실패:', err));

// 스키마 정의
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  team: { type: String, required: true },
  cash: { type: Number, default: 5000000 },
  holdings: { type: Map, of: Number, default: {} },
  history: [{
    type: String,
    stock: String,
    code: String,
    qty: Number,
    price: Number,
    time: Number,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

userSchema.index({ name: 1, team: 1 }, { unique: true });

const marketSchema = new mongoose.Schema({
  open: { type: Boolean, default: false },
  stocks: [{
    id: Number,
    code: String,
    name: String,
    sector: String,
    price: Number,
    basePrice: Number,
    description: String
  }],
  activeIssues: [{
    id: Number,
    title: String,
    article: String,
    time: String,
    effects: { type: Map, of: Number }
  }],
  currentTime: { type: Number, default: 0 },
  lastUpdate: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Market = mongoose.model('Market', marketSchema);

// 초기 종목 데이터
const INITIAL_STOCKS = [
  { id: 1, code: 'TECH01', name: '삼성전자', sector: '반도체', price: 75000, basePrice: 75000, description: '글로벌 반도체 및 전자제품 리더' },
  { id: 2, code: 'AUTO01', name: '현대자동차', sector: '자동차', price: 180000, basePrice: 180000, description: '완성차 제조 및 전기차 개발' },
  { id: 3, code: 'BIO01', name: '삼성바이오', sector: '바이오', price: 850000, basePrice: 850000, description: '바이오의약품 위탁생산' },
  { id: 4, code: 'CHEM01', name: 'LG화학', sector: '화학', price: 450000, basePrice: 450000, description: '배터리 및 배터리 소재' },
  { id: 5, code: 'SHIP01', name: '한국조선해양', sector: '조선', price: 125000, basePrice: 125000, description: '선박 건조 및 해양플랜트' },
  { id: 6, code: 'STEEL01', name: '포스코', sector: '철강', price: 320000, basePrice: 320000, description: '철강 제조 및 신소재' },
  { id: 7, code: 'BANK01', name: 'KB금융', sector: '금융', price: 58000, basePrice: 58000, description: '종합 금융서비스' },
  { id: 8, code: 'RETAIL01', name: '신세계', sector: '유통', price: 240000, basePrice: 240000, description: '백화점 및 이마트 운영' },
  { id: 9, code: 'ENTER01', name: 'HYBE', sector: '엔터', price: 185000, basePrice: 185000, description: 'K-POP 및 엔터테인먼트' },
  { id: 10, code: 'FOOD01', name: 'CJ제일제당', sector: '식품', price: 380000, basePrice: 380000, description: '식품 및 외식사업' },
  { id: 11, code: 'CONST01', name: '삼성물산', sector: '건설', price: 135000, basePrice: 135000, description: '건설 및 인프라' },
  { id: 12, code: 'TELECOM01', name: 'SK텔레콤', sector: '통신', price: 52000, basePrice: 52000, description: '이동통신 및 5G' },
  { id: 13, code: 'ENERGY01', name: 'SK이노베이션', sector: '에너지', price: 165000, basePrice: 165000, description: '정유 및 배터리' },
  { id: 14, code: 'GAME01', name: '넷마블', sector: '게임', price: 68000, basePrice: 68000, description: '모바일 게임 개발' },
  { id: 15, code: 'PHARM01', name: '유한양행', sector: '제약', price: 72000, basePrice: 72000, description: '의약품 연구개발' },
  { id: 16, code: 'AIR01', name: '대한항공', sector: '항공', price: 28000, basePrice: 28000, description: '국제 항공 운송' },
  { id: 17, code: 'CHEM02', name: 'SK케미칼', sector: '화학', price: 95000, basePrice: 95000, description: '특수 화학제품 및 백신' },
  { id: 18, code: 'DEFENSE01', name: '한화에어로스페이스', sector: '방산', price: 155000, basePrice: 155000, description: '방위산업 및 항공우주' },
  { id: 19, code: 'SEMI01', name: 'SK하이닉스', sector: '반도체', price: 130000, basePrice: 130000, description: '메모리 반도체 제조' },
  { id: 20, code: 'AUTO02', name: '기아', sector: '자동차', price: 92000, basePrice: 92000, description: '완성차 및 전기차' },
  { id: 21, code: 'PLAT01', name: '카카오', sector: '플랫폼', price: 54000, basePrice: 54000, description: '모바일 플랫폼 및 콘텐츠' },
  { id: 22, code: 'ECOM01', name: '쿠팡', sector: '이커머스', price: 18000, basePrice: 18000, description: '온라인 쇼핑 및 배송' },
  { id: 23, code: 'SEMI02', name: '삼성전기', sector: '반도체', price: 145000, basePrice: 145000, description: '전자부품 제조' }
];

// API 엔드포인트

// 시장 상태 조회
app.get('/api/market', async (req, res) => {
  try {
    let market = await Market.findOne();
    if (!market) {
      market = new Market({
        open: false,
        stocks: INITIAL_STOCKS,
        activeIssues: [],
        currentTime: 0
      });
      await market.save();
    }
    res.json(market);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 시장 상태 업데이트 (교사 전용)
app.post('/api/market', async (req, res) => {
  try {
    const { password, open, stocks, activeIssues, currentTime } = req.body;
    
    if (password !== 'ot1907') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    let market = await Market.findOne();
    if (!market) {
      market = new Market();
    }

    if (open !== undefined) market.open = open;
    if (stocks) market.stocks = stocks;
    if (activeIssues) market.activeIssues = activeIssues;
    if (currentTime !== undefined) market.currentTime = currentTime;
    market.lastUpdate = new Date();

    await market.save();
    res.json(market);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 사용자 정보 조회/생성
app.post('/api/user/login', async (req, res) => {
  try {
    const { name, team } = req.body;
    
    if (!name || !team) {
      return res.status(400).json({ error: '이름과 팀을 입력해주세요' });
    }

    let user = await User.findOne({ name, team });
    if (!user) {
      user = new User({
        name,
        team,
        cash: 5000000,
        holdings: {},
        history: []
      });
      await user.save();
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 사용자 정보 업데이트
app.put('/api/user', async (req, res) => {
  try {
    const { name, team, cash, holdings, history } = req.body;

    const user = await User.findOneAndUpdate(
      { name, team },
      { cash, holdings, history, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 전체 사용자 목록 조회
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ updatedAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 초기화 (교사 전용)
app.post('/api/reset', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (password !== 'ot1907') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    await User.deleteMany({});
    await Market.deleteMany({});
    
    const market = new Market({
      open: false,
      stocks: INITIAL_STOCKS,
      activeIssues: [],
      currentTime: 0
    });
    await market.save();

    res.json({ 
      success: true, 
      message: '모든 데이터가 초기화되었습니다',
      market
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 이슈 적용 (교사 전용)
app.post('/api/market/apply-issue', async (req, res) => {
  try {
    const { password, issue } = req.body;
    
    if (password !== 'ot1907') {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    let market = await Market.findOne();
    if (!market) {
      return res.status(404).json({ error: '시장 데이터를 찾을 수 없습니다' });
    }

    market.stocks = market.stocks.map(stock => {
      const effect = issue.effects[stock.code] || 0;
      const newPrice = Math.round(stock.price * (1 + effect / 100));
      return { ...stock.toObject(), price: newPrice };
    });

    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');
    
    market.activeIssues.unshift({
      id: issue.id,
      title: issue.title,
      article: issue.article,
      time: timeString,
      effects: issue.effects
    });

    market.lastUpdate = new Date();
    await market.save();

    res.json(market);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`http://localhost:${PORT}`);
});
