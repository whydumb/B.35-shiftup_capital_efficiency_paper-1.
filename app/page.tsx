'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, TrendingUp, TrendingDown, PieChart, BarChart3, Target, AlertTriangle, Calendar, Eye, FileText, Edit3, Lightbulb } from 'lucide-react';

interface Transaction {
  id: number;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface Memo {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
  createdAt: string;
}

interface Budget {
  [category: string]: number;
}

interface BudgetComparison {
  [category: string]: {
    spent: number;
    budget: number;
    remaining: number;
    percentage: number;
  };
}

const MoneyManagementApp: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'expense' | 'income',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [budget, setBudget] = useState<Budget>({});
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
  const [activeView, setActiveView] = useState('overview');
  const [memos, setMemos] = useState<Memo[]>([]);
  const [newMemo, setNewMemo] = useState({
    title: '',
    content: '',
    category: 'general',
    date: new Date().toISOString().split('T')[0]
  });

  // 기본 카테고리
  const expenseCategories = ['식비', '교통비', '쇼핑', '의료비', '문화생활', '교육', '주거비', '기타'];
  const incomeCategories = ['급여', '부업', '투자수익', '기타수입'];

  // 색상 팔레트
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#87d068', '#ffb347'];

  // 거래 추가
  const addTransaction = () => {
    if (newTransaction.amount && newTransaction.category) {
      const transaction: Transaction = {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        id: Date.now(),
        date: newTransaction.date
      };
      setTransactions([...transactions, transaction]);
      setNewTransaction({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  // 거래 삭제
  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // 메모 추가
  const addMemo = () => {
    if (newMemo.title && newMemo.content) {
      const memo: Memo = {
        ...newMemo,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      setMemos([memo, ...memos]);
      setNewMemo({
        title: '',
        content: '',
        category: 'general',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  // 메모 삭제
  const deleteMemo = (id: number) => {
    setMemos(memos.filter(m => m.id !== id));
  };

  const addBudget = () => {
    if (newBudget.category && newBudget.amount) {
      setBudget({
        ...budget,
        [newBudget.category]: parseFloat(newBudget.amount)
      });
      setNewBudget({ category: '', amount: '' });
    }
  };

  // 통계 계산
  const calculateStats = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    // 카테고리별 지출
    const expensesByCategory: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    // 예산 대비 지출
    const budgetComparison: BudgetComparison = {};
    Object.keys(budget).forEach(category => {
      const spent = expensesByCategory[category] || 0;
      const budgetAmount = budget[category];
      budgetComparison[category] = {
        spent,
        budget: budgetAmount,
        remaining: budgetAmount - spent,
        percentage: Math.round((spent / budgetAmount) * 100)
      };
    });

    // 일별 지출 추이 (최근 30일)
    const dailyExpenses: { [key: string]: number } = {};
    const last30Days = Array.from({length: 30}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    last30Days.forEach(date => {
      dailyExpenses[date] = 0;
    });

    transactions
      .filter(t => t.type === 'expense' && last30Days.includes(t.date))
      .forEach(t => {
        dailyExpenses[t.date] = (dailyExpenses[t.date] || 0) + t.amount;
      });

    const dailyTrend = Object.entries(dailyExpenses).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      amount
    }));

    return {
      income,
      expenses,
      balance,
      expensesByCategory,
      budgetComparison,
      dailyTrend
    };
  };

  const stats = calculateStats();

  // 최근 거래 (최신 10개)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="text-blue-600" />
            스마트 가계부 - 시각화 대시보드
          </h1>
          
          {/* 네비게이션 */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="inline mr-2" size={16} />
              대시보드
            </button>
            <button
              onClick={() => setActiveView('analysis')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'analysis' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="inline mr-2" size={16} />
              나의 분석
            </button>
            <button
              onClick={() => setActiveView('input')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'input' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <PlusCircle className="inline mr-2" size={16} />
              거래 입력
            </button>
          </div>
        </div>

        {/* 대시보드 개요 */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* 재정 요약 카드들 */}
            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">총 수입</p>
                  <p className="text-2xl font-bold">{stats.income.toLocaleString()}원</p>
                </div>
                <TrendingUp size={32} className="text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">총 지출</p>
                  <p className="text-2xl font-bold">{stats.expenses.toLocaleString()}원</p>
                </div>
                <TrendingDown size={32} className="text-red-200" />
              </div>
            </div>

            <div className={`bg-gradient-to-r ${stats.balance >= 0 ? 'from-blue-400 to-blue-600' : 'from-orange-400 to-orange-600'} rounded-xl shadow-lg p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={stats.balance >= 0 ? 'text-blue-100' : 'text-orange-100'}>잔액</p>
                  <p className="text-2xl font-bold">{stats.balance.toLocaleString()}원</p>
                </div>
                <Target size={32} className={stats.balance >= 0 ? 'text-blue-200' : 'text-orange-200'} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">거래 건수</p>
                  <p className="text-2xl font-bold">{transactions.length}건</p>
                </div>
                <Calendar size={32} className="text-purple-200" />
              </div>
            </div>
          </div>
        )}

        {/* 나의 분석 뷰 */}
        {activeView === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 분석 메모 작성 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Edit3 className="text-purple-600" />
                분석 메모 작성
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">제목</label>
                  <input
                    type="text"
                    value={newMemo.title}
                    onChange={(e) => setNewMemo({...newMemo, title: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="분석 제목을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">카테고리</label>
                  <select
                    value={newMemo.category}
                    onChange={(e) => setNewMemo({...newMemo, category: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="general">일반 분석</option>
                    <option value="expense">지출 분석</option>
                    <option value="income">수입 분석</option>
                    <option value="budget">예산 분석</option>
                    <option value="goal">목표 설정</option>
                    <option value="insight">깨달음/인사이트</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">분석 내용</label>
                  <textarea
                    value={newMemo.content}
                    onChange={(e) => setNewMemo({...newMemo, content: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-32"
                    placeholder="예) 이번 달 식비가 많이 나간 이유: 회식이 많았고, 배달음식을 자주 시켜먹었다. 다음 달에는 도시락을 준비해서 식비를 20% 줄여보자."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">날짜</label>
                  <input
                    type="date"
                    value={newMemo.date}
                    onChange={(e) => setNewMemo({...newMemo, date: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  onClick={addMemo}
                  className="w-full bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  분석 메모 저장
                </button>
              </div>
            </div>

            {/* 데이터 요약 (분석 도우미) */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="text-yellow-600" />
                분석 도우미
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">💰 재정 현황</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• 총 수입: {stats.income.toLocaleString()}원</p>
                    <p>• 총 지출: {stats.expenses.toLocaleString()}원</p>
                    <p>• 저축률: {stats.income > 0 ? ((stats.balance / stats.income) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">📊 지출 TOP 3</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    {Object.entries(stats.expensesByCategory)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([category, amount], index) => (
                        <p key={category}>
                          {index + 1}. {category}: {amount.toLocaleString()}원 
                          ({((amount / stats.expenses) * 100).toFixed(1)}%)
                        </p>
                      ))}
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-medium text-orange-800 mb-2">⚠️ 예산 주의사항</h3>
                  <div className="text-sm text-orange-700 space-y-1">
                    {Object.entries(stats.budgetComparison)
                      .filter(([, data]) => data.percentage > 80)
                      .map(([category, data]) => (
                        <p key={category}>
                          • {category}: {data.percentage}% 사용
                          {data.percentage > 100 && " (초과!)"}
                        </p>
                      ))}
                    {Object.keys(stats.budgetComparison).length === 0 && (
                      <p>예산이 설정되지 않았습니다.</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-800 mb-2">💡 분석 힌트</h3>
                  <div className="text-sm text-purple-700 space-y-1">
                    <p>• 일평균 지출: {stats.expenses > 0 ? (stats.expenses / Math.max(transactions.filter(t => t.type === 'expense').length, 1)).toLocaleString() : 0}원</p>
                    <p>• 거래 빈도: {transactions.length}건</p>
                    <p>• 가장 활발한 카테고리: {Object.keys(stats.expensesByCategory)[0] || '없음'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 저장된 분석 메모들 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">나의 분석 기록</h2>
              
              {memos.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {memos.map(memo => (
                    <div key={memo.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-800">{memo.title}</h3>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                            memo.category === 'expense' ? 'bg-red-100 text-red-700' :
                            memo.category === 'income' ? 'bg-green-100 text-green-700' :
                            memo.category === 'budget' ? 'bg-orange-100 text-orange-700' :
                            memo.category === 'goal' ? 'bg-blue-100 text-blue-700' :
                            memo.category === 'insight' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {memo.category === 'expense' ? '지출분석' :
                             memo.category === 'income' ? '수입분석' :
                             memo.category === 'budget' ? '예산분석' :
                             memo.category === 'goal' ? '목표설정' :
                             memo.category === 'insight' ? '인사이트' : '일반'}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteMemo(memo.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{memo.content}</p>
                      <p className="text-xs text-gray-400">{memo.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>아직 분석 메모가 없습니다.</p>
                  <p className="text-sm">왼쪽에서 첫 번째 분석을 작성해보세요!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 거래 입력 뷰 */}
        {activeView === 'input' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 거래 입력 폼 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PlusCircle className="text-green-600" />
                거래 입력
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">거래 유형</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as 'expense' | 'income'})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="expense">지출</option>
                    <option value="income">수입</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">금액</label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="금액을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">카테고리</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">카테고리 선택</option>
                    {(newTransaction.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">설명</label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="거래 내용을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">날짜</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={addTransaction}
                  className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  거래 추가
                </button>
              </div>
            </div>

            {/* 예산 설정 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="text-orange-600" />
                예산 설정
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <select
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">카테고리 선택</option>
                    {expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="예산 금액"
                  />
                  <button
                    onClick={addBudget}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                  >
                    추가
                  </button>
                </div>

                {Object.keys(stats.budgetComparison).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">예산 현황</h3>
                    {Object.entries(stats.budgetComparison).map(([category, data]) => (
                      <div key={category} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{category}</span>
                          <span className={`text-sm font-bold ${
                            data.percentage > 100 ? 'text-red-600' : 
                            data.percentage > 80 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {data.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              data.percentage > 100 ? 'bg-red-500' : 
                              data.percentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(data.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {data.spent.toLocaleString()}원 / {data.budget.toLocaleString()}원
                          {data.percentage > 100 && (
                            <span className="text-red-600 ml-2 flex items-center gap-1">
                              <AlertTriangle size={12} />
                              예산 초과!
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 최근 거래 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">최근 거래</h2>
              
              {recentTransactions.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentTransactions.map(transaction => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{transaction.category}</div>
                        <div className="text-sm text-gray-500">{transaction.description}</div>
                        <div className="text-xs text-gray-400">{transaction.date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()}원
                        </span>
                        <button
                          onClick={() => deleteTransaction(transaction.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">거래 내역이 없습니다</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoneyManagementApp;
