import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Award, Clock } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';
const TEACHER_PASSWORD = 'ot1907';
const INITIAL_CASH = 5000000;

export default function StockTradingGame() {
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [teamNumber, setTeamNumber] = useState('');
  const [marketOpen, setMarketOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [activeIssues, setActiveIssues] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState({ cash: INITIAL_CASH, holdings: {}, history: [] });
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const issues = [
    {
      id: 1,
      title: '미국 반도체 지원법 통과',
      article: '미국 정부가 520억 달러 규모의 반도체 지원법을 통과시켰습니다. 이로 인해 글로벌 반도체 기업들의 미국 내 생산 확대가 예상되며, 한국 반도체 기업들도 수혜를 받을 전망입니다.',
      effects: { TECH01: 8, SEMI01: 9, AUTO01: 3, CHEM01: 4, GAME01: 2 },
      teacherNote: '반도체 지원으로 삼성전자 8%, SK하이닉스 9% 급등. 자동차는 반도체 수급 개선으로 3% 상승, LG화학은 반도체 소재 수요로 4% 상승'
    },
    {
      id: 2,
      title: '전기차 배터리 화재 사고',
      article: '유럽에서 대형 전기차 배터리 화재 사고가 발생했습니다. 조사 결과 특정 배터리 제조사의 안전성 문제가 지적되면서 전기차 산업 전반에 우려가 확산되고 있습니다.',
      effects: { AUTO01: -6, AUTO02: -7, CHEM01: -8, ENERGY01: -5, TECH01: -2 },
      teacherNote: '배터리 화재로 LG화학 8% 급락, 현대차 6%, 기아 7% 하락. SK이노베이션도 5% 타격'
    },
    {
      id: 3,
      title: '한류 콘텐츠 글로벌 흥행',
      article: 'K-POP과 K-드라마가 글로벌 스트리밍 차트를 석권하며 한류 열풍이 계속되고 있습니다. 주요 엔터테인먼트 기업들의 해외 매출이 급증하고 있습니다.',
      effects: { ENTER01: 12, GAME01: 5, RETAIL01: 3, TELECOM01: 2, AIR01: 4 },
      teacherNote: 'HYBE 한류 효과로 12% 급등, 게임도 K-콘텐츠 수혜로 5% 상승. 유통은 한류 관광객 증가 기대로 3%, 항공도 4% 상승'
    },
    {
      id: 4,
      title: '글로벌 철광석 가격 급등',
      article: '세계 최대 철광석 생산국인 브라질의 광산 사고로 공급 차질이 발생했습니다. 철광석 가격이 톤당 20% 급등하면서 철강 및 관련 산업에 원자재 부담이 가중되고 있습니다.',
      effects: { STEEL01: -7, SHIP01: -5, CONST01: -6, AUTO01: -3, AUTO02: -3 },
      teacherNote: '원자재 급등으로 포스코 7% 하락, 건설 6% 하락, 조선 5% 타격. 자동차들도 철강 원가 상승으로 3% 하락'
    },
    {
      id: 5,
      title: '중앙은행 금리 인하',
      article: '한국은행이 기준금리를 0.25%p 인하했습니다. 경기 부양을 위한 통화정책 완화로 시장 유동성이 증가할 전망입니다.',
      effects: { BANK01: 7, CONST01: 8, RETAIL01: 5, AUTO01: 4, AUTO02: 4, STEEL01: 3 },
      teacherNote: '금리 인하로 은행 7%, 건설 8% 상승. 소비 증가 기대로 유통 5%, 자동차 4% 호재'
    },
    {
      id: 6,
      title: '신종 바이러스 발생 우려',
      article: '아시아 지역에서 신종 바이러스 감염 사례가 보고되면서 WHO가 긴급회의를 소집했습니다. 제약·바이오 기업들은 백신 개발에 착수했습니다.',
      effects: { BIO01: 15, PHARM01: 12, CHEM02: 10, RETAIL01: -8, ENTER01: -6, FOOD01: -4, AIR01: -9 },
      teacherNote: '바이오 15%, 제약 12%, SK케미칼 백신 사업으로 10% 급등. 유통 8%, 엔터 6%, 항공 9% 급락'
    },
    {
      id: 7,
      title: '글로벌 해운 운임 폭등',
      article: '수에즈 운하 통행 지연과 컨테이너 부족으로 해운 운임이 2배 이상 급등했습니다. 조선업계는 신규 선박 수주가 증가하고 있습니다.',
      effects: { SHIP01: 10, STEEL01: 4, RETAIL01: -5, FOOD01: -4, AUTO01: -3, AUTO02: -3 },
      teacherNote: '조선 수주 증가로 10% 급등, 철강도 4% 수혜. 유통과 식품은 물류비 부담으로 각각 5%, 4% 하락'
    },
    {
      id: 8,
      title: '메타버스 시장 급성장',
      article: '글로벌 빅테크 기업들의 메타버스 투자가 본격화되면서 관련 시장이 폭발적으로 성장하고 있습니다.',
      effects: { GAME01: 11, TELECOM01: 8, ENTER01: 6, TECH01: 5, SEMI01: 5 },
      teacherNote: '메타버스 수혜로 게임 11%, 통신 8% 급등. 엔터 6%, 반도체들 5% 상승'
    },
    {
      id: 9,
      title: '친환경 규제 강화',
      article: 'EU가 2030년까지 탄소배출 50% 감축을 의무화하는 법안을 통과시켰습니다. 자동차, 철강, 에너지 업종은 대규모 설비투자가 불가피합니다.',
      effects: { AUTO01: -5, AUTO02: -5, STEEL01: -6, ENERGY01: -7, CHEM01: 6, BIO01: 4 },
      teacherNote: '탄소규제로 자동차들 5%, 철강 6%, 에너지 7% 타격. LG화학은 친환경 배터리로 6% 수혜'
    },
    {
      id: 10,
      title: '반도체 공급 과잉',
      article: '중국의 대규모 반도체 증산과 글로벌 수요 둔화로 반도체 가격 하락 우려가 제기되고 있습니다.',
      effects: { TECH01: -9, SEMI01: -10, CHEM01: -4, GAME01: 3, AUTO01: 2, AUTO02: 2 },
      teacherNote: '반도체 과잉으로 삼성전자 9%, SK하이닉스 10% 하락. 게임과 자동차는 반도체 가격 하락 수혜로 상승'
    },
    {
      id: 11,
      title: '부동산 경기 회복',
      article: '주요 도시 아파트 거래량이 3개월 연속 증가하며 부동산 시장 회복 신호가 감지되고 있습니다.',
      effects: { CONST01: 10, STEEL01: 6, BANK01: 5, RETAIL01: 4 },
      teacherNote: '건설 10%, 철강 6% 급등. 은행도 대출 증가로 5% 상승'
    },
    {
      id: 12,
      title: '식량 안보 위기',
      article: '이상기후로 주요 곡물 생산국의 농작물 수확량이 급감했습니다. 밀과 옥수수 가격이 30% 이상 급등하고 있습니다.',
      effects: { FOOD01: -8, RETAIL01: -5, BIO01: 5, CHEM01: 3 },
      teacherNote: '원자재 급등으로 식품 8%, 유통 5% 하락. 바이오 작물 5%, 화학 비료 3% 수혜'
    },
    {
      id: 13,
      title: '국제 유가 급등',
      article: '중동 지역의 지정학적 긴장이 고조되면서 국제 유가가 배럴당 100달러를 돌파했습니다. 정유 및 에너지 기업들의 수익성은 개선되지만 항공과 운송업은 타격을 받고 있습니다.',
      effects: { ENERGY01: 9, AIR01: -10, AUTO01: -4, AUTO02: -4, FOOD01: -3, RETAIL01: -3 },
      teacherNote: '유가 급등으로 SK이노베이션 9% 상승. 항공 10%, 자동차 4%, 식품·유통 3% 하락'
    },
    {
      id: 14,
      title: '방위산업 수출 호조',
      article: '한국 방산기업들이 유럽과 중동 국가들로부터 대규모 수주를 받으며 수출이 급증하고 있습니다. 방위산업이 새로운 수출 효자 산업으로 부상하고 있습니다.',
      effects: { DEFENSE01: 14, STEEL01: 5, SHIP01: 4, TECH01: 3 },
      teacherNote: '방산 수출로 한화에어로스페이스 14% 급등. 철강 5%, 조선 4%, 반도체 3% 동반 상승'
    },
    {
      id: 15,
      title: '항공 여행 수요 폭증',
      article: '여행 제한이 완전히 해제되면서 항공 여행 수요가 팬데믹 이전 수준을 넘어섰습니다. 항공사들은 증편과 신규 노선 개설을 서두르고 있습니다.',
      effects: { AIR01: 12, RETAIL01: 5, ENTER01: 4, FOOD01: 3, ENERGY01: -3 },
      teacherNote: '항공 수요 증가로 대한항공 12% 급등. 유통 5%, 엔터 4% 수혜. 유가 부담으로 에너지 3% 하락'
    },
    {
      id: 16,
      title: 'AI 기술 혁신 가속화',
      article: '인공지능 기술의 급격한 발전으로 관련 산업이 폭발적으로 성장하고 있습니다. 반도체, 통신, 게임 등 AI 활용 기업들이 혜택을 받고 있습니다.',
      effects: { TECH01: 10, SEMI01: 11, SEMI02: 9, TELECOM01: 7, GAME01: 8, CHEM01: 4, PLAT01: 6 },
      teacherNote: 'AI 열풍으로 SK하이닉스 11%, 삼성전자 10%, 삼성전기 9%, 게임 8%, 통신 7% 급등'
    },
    {
      id: 17,
      title: '이커머스 시장 경쟁 심화',
      article: '온라인 쇼핑 시장에서 과당 경쟁이 벌어지면서 배송비 인상과 할인 경쟁으로 수익성이 악화되고 있습니다. 전통 유통업체들도 타격을 받고 있습니다.',
      effects: { ECOM01: -7, RETAIL01: -5, PLAT01: -4, FOOD01: -3 },
      teacherNote: '이커머스 경쟁 심화로 쿠팡 7%, 신세계 5%, 카카오 4% 하락. 배송비 부담으로 식품도 3% 하락'
    },
    {
      id: 18,
      title: '모빌리티 혁신 가속',
      article: '자율주행과 전기차 기술이 급속도로 발전하면서 완성차 업체들의 기술 경쟁이 치열해지고 있습니다. 관련 부품 및 소프트웨어 기업들도 수혜를 받고 있습니다.',
      effects: { AUTO01: 8, AUTO02: 9, SEMI01: 5, SEMI02: 4, CHEM01: 6, PLAT01: 3 },
      teacherNote: '모빌리티 혁신으로 기아 9%, 현대차 8% 급등. 반도체와 배터리 업체들도 수혜'
    }
  ];

  // 시장 데이터 로드
  async function loadMarketData() {
    try {
      const response = await fetch(`${API_URL}/market`);
      const data = await response.json();
      setMarketOpen(data.open);
      setStocks(data.stocks);
      setActiveIssues(data.activeIssues || []);
      setCurrentTime(data.currentTime || 0);
    } catch (error) {
      console.error('시장 데이터 로드 실패:', error);
    }
  }

  // 사용자 데이터 로드
  async function loadUserData() {
    if (!studentName || !teamNumber) return;
    
    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: studentName, team: teamNumber })
      });
      const data = await response.json();
      
      setPortfolio({
        cash: data.cash,
        holdings: data.holdings || {},
        history: data.history || []
      });
    } catch (error) {
      console.error('사용자 데이터 로드 실패:', error);
    }
  }

  // 모든 사용자 로드
  async function loadAllUsers() {
    try {
      const response = await fetch(`${API_URL}/users`);
      const users = await response.json();
      setAllUsers(users);
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    }
  }

  // 사용자 데이터 저장
  async function saveUserData(newPortfolio) {
    try {
      await fetch(`${API_URL}/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentName,
          team: teamNumber,
          ...newPortfolio
        })
      });
      setPortfolio(newPortfolio);
      await loadAllUsers();
    } catch (error) {
      console.error('저장 실패:', error);
    }
  }

  // 장 개장/마감
  async function toggleMarket() {
    try {
      const newState = !marketOpen;
      await fetch(`${API_URL}/market`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: TEACHER_PASSWORD,
          open: newState,
          currentTime: newState ? 0 : currentTime
        })
      });
      setMarketOpen(newState);
      if (newState) setCurrentTime(0);
    } catch (error) {
      console.error('시장 상태 변경 실패:', error);
    }
  }

  // 이슈 적용
  async function applyIssue(issue) {
    try {
      await fetch(`${API_URL}/market/apply-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: TEACHER_PASSWORD,
          issue: issue
        })
      });
      await loadMarketData();
    } catch (error) {
      console.error('이슈 적용 실패:', error);
    }
  }

  // 초기화
  async function handleReset() {
    const confirmed = window.confirm(
      '정말로 모든 데이터를 초기화하시겠습니까?\n\n' +
      '- 모든 학생의 포트폴리오\n' +
      '- 발행된 모든 이슈\n' +
      '- 주가 변동\n' +
      '- 장 상태\n\n' +
      '모든 것이 처음으로 돌아갑니다.'
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: TEACHER_PASSWORD })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('초기화가 완료되었습니다!\n\n- 종목: 23개\n- 모든 학생 데이터 삭제\n- 모든 이슈 삭제\n- 장 마감 상태');
        await loadMarketData();
        await loadAllUsers();
      }
    } catch (error) {
      console.error('초기화 실패:', error);
      alert('초기화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // 매수
  async function buyStock(stock) {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) return;
    
    const totalCost = stock.price * qty;
    if (totalCost > portfolio.cash) {
      alert('현금이 부족합니다.');
      return;
    }

    const newHoldings = { ...portfolio.holdings };
    newHoldings[stock.code] = (newHoldings[stock.code] || 0) + qty;

    const newPortfolio = {
      ...portfolio,
      cash: portfolio.cash - totalCost,
      holdings: newHoldings,
      history: [...portfolio.history, { 
        type: 'buy', 
        stock: stock.name, 
        code: stock.code,
        qty: qty, 
        price: stock.price, 
        time: currentTime 
      }]
    };

    await saveUserData(newPortfolio);
    setQuantity('');
  }

  // 매도
  async function sellStock(stock) {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) return;
    
    const holding = portfolio.holdings[stock.code] || 0;
    if (qty > holding) {
      alert('보유 수량이 부족합니다.');
      return;
    }

    const totalRevenue = stock.price * qty;
    const newHoldings = { ...portfolio.holdings };
    newHoldings[stock.code] = holding - qty;

    const newPortfolio = {
      ...portfolio,
      cash: portfolio.cash + totalRevenue,
      holdings: newHoldings,
      history: [...portfolio.history, { 
        type: 'sell', 
        stock: stock.name, 
        code: stock.code,
        qty: qty, 
        price: stock.price, 
        time: currentTime 
      }]
    };

    await saveUserData(newPortfolio);
    setQuantity('');
  }

  function calculatePortfolioValue(userPortfolio) {
    let totalValue = userPortfolio.cash;
    Object.keys(userPortfolio.holdings || {}).forEach(code => {
      const qty = userPortfolio.holdings[code];
      const stock = stocks.find(s => s.code === code);
      if (stock) {
        totalValue += stock.price * qty;
      }
    });
    return totalValue;
  }

  function handleLogin() {
    if (userType === 'teacher' && password === TEACHER_PASSWORD) {
      setIsAuthenticated(true);
    } else if (userType === 'student' && studentName && teamNumber) {
      setIsAuthenticated(true);
    }
  }

  function handleLogout() {
    setUserType(null);
    setIsAuthenticated(false);
    setPassword('');
    setStudentName('');
    setTeamNumber('');
    setSelectedStock(null);
    setQuantity('');
    setPortfolio({ cash: INITIAL_CASH, holdings: {}, history: [] });
  }

  function getIndividualRankings() {
    return allUsers
      .map(user => ({
        ...user,
        totalValue: calculatePortfolioValue(user)
      }))
      .sort((a, b) => b.totalValue - a.totalValue);
  }

  function getTeamRankings() {
    const teamData = {};
    allUsers.forEach(user => {
      if (!teamData[user.team]) {
        teamData[user.team] = { team: user.team, totalValue: 0, members: 0 };
      }
      teamData[user.team].totalValue += calculatePortfolioValue(user);
      teamData[user.team].members += 1;
    });
    return Object.values(teamData).sort((a, b) => b.totalValue - a.totalValue);
  }

  // 초기 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadMarketData();
      const interval = setInterval(loadMarketData, 2000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && userType === 'student') {
      loadUserData();
      loadAllUsers();
    } else if (isAuthenticated && userType === 'teacher') {
      loadAllUsers();
    }
  }, [isAuthenticated, userType, studentName, teamNumber]);

  useEffect(() => {
    if (marketOpen) {
      const timer = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [marketOpen]);

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2 text-indigo-900">Social Inquiry through Investment</h1>
          <p className="text-center text-indigo-900 font-semibold mb-6 text-lg">(SII, 투자를 통한 사회탐구 프로그램)</p>
          <div className="space-y-4">
            <button
              onClick={() => setUserType('teacher')}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              교사 로그인
            </button>
            <button
              onClick={() => setUserType('student')}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              학생 입장
            </button>
          </div>
          <div className="mt-6 text-center text-gray-500 text-sm">
            <div>Created by OSAN High. SEMIN</div>
            <div className="mt-1">case0310@naver.com</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <button 
            onClick={() => setUserType(null)}
            className="mb-4 text-indigo-600 hover:text-indigo-800"
          >
            ← 뒤로가기
          </button>
          <h2 className="text-2xl font-bold mb-6 text-center">
            {userType === 'teacher' ? '교사 로그인' : '학생 정보 입력'}
          </h2>
          {userType === 'teacher' ? (
            <div className="space-y-4">
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                onClick={handleLogin}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
              >
                로그인
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="이름"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
              <select
                value={teamNumber}
                onChange={(e) => setTeamNumber(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">팀 선택</option>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                  <option key={num} value={num}>팀 {num}</option>
                ))}
              </select>
              <button
                onClick={handleLogin}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                입장하기
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const myValue = calculatePortfolioValue(portfolio);
  const individualRankings = getIndividualRankings();
  const teamRankings = getTeamRankings();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-indigo-900">모의 주식투자 게임</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className={marketOpen ? 'px-4 py-2 rounded-lg font-bold bg-green-500 text-white' : 'px-4 py-2 rounded-lg font-bold bg-red-500 text-white'}>
                {marketOpen ? '장 개장' : '장 마감'}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                로그아웃
              </button>
            </div>
          </div>

          {userType === 'teacher' ? (
            <div className="text-lg">교사 모드</div>
          ) : (
            <div className="text-lg">
              <span className="font-semibold">{studentName}</span> (팀 {teamNumber}) | 
              <span className="ml-2 text-green-600 font-bold">
                {myValue.toLocaleString()}원
              </span>
            </div>
          )}
        </div>

        {userType === 'teacher' && (
          <div className="bg-yellow-100 border-4 border-yellow-500 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-red-600">교사 전용 컨트롤</h2>
            <div className="flex gap-3 items-center flex-wrap">
              <button
                onClick={toggleMarket}
                className={marketOpen ? 'px-6 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700' : 'px-6 py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700'}
              >
                {marketOpen ? '장 마감' : '장 개장'}
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 rounded-lg font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400"
              >
                {loading ? '초기화 중...' : '🔄 전체 초기화'}
              </button>
            </div>
          </div>
        )}

        {userType === 'teacher' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">이슈 발행</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {issues.map(issue => (
                <div key={issue.id} className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2 text-sm">{issue.title}</h3>
                  <button
                    onClick={() => applyIssue(issue)}
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 text-sm mb-2"
                  >
                    이슈 발행
                  </button>
                  {activeIssues.find(ai => ai.id === issue.id) && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                      <p className="font-semibold text-yellow-800">교사용 해설:</p>
                      <p className="text-gray-700">{issue.teacherNote}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {userType === 'student' && activeIssues.length > 0 && (
          <div className="space-y-4 mb-6">
            {activeIssues.map((issue, index) => (
              <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-yellow-800">📰 속보</h2>
                  <span className="text-sm text-gray-600">{issue.time}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{issue.title}</h3>
                <p className="text-gray-700">{issue.article}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">종목 리스트</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-2">종목명</th>
                    <th className="text-left py-2">섹터</th>
                    <th className="text-right py-2">현재가</th>
                    <th className="text-right py-2">등락률</th>
                    {userType === 'student' && <th className="text-center py-2">거래</th>}
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(stock => {
                    const change = ((stock.price - stock.basePrice) / stock.basePrice * 100).toFixed(2);
                    return (
                      <tr key={stock.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          <div>
                            <div className="font-semibold">{stock.name}</div>
                            <div className="text-xs text-gray-500">{stock.code}</div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">{stock.sector}</span>
                        </td>
                        <td className="text-right py-3 font-semibold">{stock.price.toLocaleString()}원</td>
                        <td className="text-right py-3">
                          <span className={
                            change > 0 
                              ? 'flex items-center justify-end gap-1 text-red-600' 
                              : change < 0 
                                ? 'flex items-center justify-end gap-1 text-blue-600'
                                : 'flex items-center justify-end gap-1 text-gray-800'
                          }>
                            {change > 0 ? <TrendingUp className="w-4 h-4" /> : change < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                            {change > 0 ? '+' : ''}{change}%
                          </span>
                        </td>
                        {userType === 'student' && (
                          <td className="py-3 text-center">
                            <button
                              onClick={() => setSelectedStock(stock)}
                              disabled={!marketOpen}
                              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                              거래
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {userType === 'student' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">내 포트폴리오</h2>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-green-50 rounded">
                    <span className="font-semibold">보유 현금</span>
                    <span className="font-bold text-green-600">{portfolio.cash.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-50 rounded">
                    <span className="font-semibold">총 평가액</span>
                    <span className="font-bold text-blue-600">{myValue.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between p-3 bg-purple-50 rounded">
                    <span className="font-semibold">수익률</span>
                    <span className={myValue >= INITIAL_CASH ? 'font-bold text-red-600' : 'font-bold text-blue-600'}>
                      {((myValue - INITIAL_CASH) / INITIAL_CASH * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-bold mb-2">보유 종목</h3>
                  {Object.keys(portfolio.holdings).filter(code => portfolio.holdings[code] > 0).length === 0 ? (
                    <p className="text-gray-500 text-sm">보유 종목이 없습니다</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.keys(portfolio.holdings).filter(code => portfolio.holdings[code] > 0).map(code => {
                        const qty = portfolio.holdings[code];
                        const stock = stocks.find(s => s.code === code);
                        if (!stock) return null;
                        const value = stock.price * qty;
                        return (
                          <div 
                            key={code} 
                            className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100"
                            onClick={() => setSelectedStock(stock)}
                          >
                            <div className="flex justify-between font-semibold">
                              <span>{stock.name}</span>
                              <span>{qty}주</span>
                            </div>
                            <div className="text-gray-600 text-xs">
                              평가액: {value.toLocaleString()}원
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {selectedStock && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4">{selectedStock.name} 거래</h2>
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">{selectedStock.description}</div>
                    <div className="mt-2 font-bold text-lg">{selectedStock.price.toLocaleString()}원</div>
                    <div className="text-xs text-gray-500 mt-1">
                      보유: {portfolio.holdings[selectedStock.code] || 0}주
                    </div>
                  </div>
                  <input
                    type="number"
                    placeholder="수량"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-3 border rounded mb-3"
                    min="1"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => buyStock(selectedStock)}
                      disabled={!marketOpen}
                      className="flex-1 bg-red-600 text-white py-3 rounded font-semibold hover:bg-red-700 disabled:bg-gray-400"
                    >
                      매수
                    </button>
                    <button
                      onClick={() => sellStock(selectedStock)}
                      disabled={!marketOpen}
                      className="flex-1 bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      매도
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStock(null);
                      setQuantity('');
                    }}
                    className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                  >
                    닫기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-500" />
              개인 순위
            </h2>
            <div className="overflow-y-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b-2">
                    <th className="text-left py-2">순위</th>
                    <th className="text-left py-2">이름</th>
                    <th className="text-center py-2">팀</th>
                    <th className="text-right py-2">평가액</th>
                  </tr>
                </thead>
                <tbody>
                  {individualRankings.map((user, index) => {
                    const isMe = userType === 'student' && user.name === studentName && user.team === teamNumber;
                    return (
                      <tr key={user._id} className={isMe ? 'border-b bg-yellow-50' : 'border-b'}>
                        <td className="py-2 font-bold">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1) + '위'}
                        </td>
                        <td className="py-2">{user.name}</td>
                        <td className="py-2 text-center">{user.team}팀</td>
                        <td className="py-2 text-right font-semibold">{user.totalValue.toLocaleString()}원</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              팀 순위
            </h2>
            <div className="overflow-y-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b-2">
                    <th className="text-left py-2">순위</th>
                    <th className="text-center py-2">팀</th>
                    <th className="text-center py-2">인원</th>
                    <th className="text-right py-2">총 평가액</th>
                  </tr>
                </thead>
                <tbody>
                  {teamRankings.map((team, index) => {
                    const isMyTeam = userType === 'student' && team.team === teamNumber;
                    return (
                      <tr key={team.team} className={isMyTeam ? 'border-b bg-blue-50' : 'border-b'}>
                        <td className="py-2 font-bold">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1) + '위'}
                        </td>
                        <td className="py-2 text-center font-semibold">{team.team}팀</td>
                        <td className="py-2 text-center">{team.members}명</td>
                        <td className="py-2 text-right font-semibold">{team.totalValue.toLocaleString()}원</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {userType === 'student' && portfolio.history.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-2xl font-bold mb-4">거래 내역</h2>
            <div className="overflow-y-auto max-h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">시간</th>
                    <th className="text-left py-2">구분</th>
                    <th className="text-left py-2">종목</th>
                    <th className="text-right py-2">수량</th>
                    <th className="text-right py-2">가격</th>
                  </tr>
                </thead>
                <tbody>
                  {[...portfolio.history].reverse().map((trade, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{Math.floor(trade.time / 60)}:{(trade.time % 60).toString().padStart(2, '0')}</td>
                      <td className="py-2">
                        <span className={trade.type === 'buy' ? 'px-2 py-1 rounded text-xs bg-red-100 text-red-700' : 'px-2 py-1 rounded text-xs bg-blue-100 text-blue-700'}>
                          {trade.type === 'buy' ? '매수' : '매도'}
                        </span>
                      </td>
                      <td className="py-2">{trade.stock}</td>
                      <td className="py-2 text-right">{trade.qty}주</td>
                      <td className="py-2 text-right">{trade.price.toLocaleString()}원</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 pb-4 text-center text-gray-500 text-sm">
          Created by Seoul Osan High. Semin
        </div>
      </div>
    </div>
  );
}
