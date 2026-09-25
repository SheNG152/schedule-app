import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

vi.mock('../storage', () => ({
  loadTodos: () => [],
  addTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
  requestNotificationPermission: vi.fn(),
  sendNotification: vi.fn(),
  getNotifiedIds: () => [],
  addNotifiedId: vi.fn(),
}));

vi.mock('../data', async () => {
  const actual = await vi.importActual('../data');
  return {
    ...actual,
    getCurrentWeek: () => 3,
  };
});

describe('Week Navigation', () => {
  beforeEach(() => {
    render(<App />);
    fireEvent.click(screen.getByText(/周课表/));
  });

  it('should display current week by default', () => {
    const weekElements = screen.getAllByText(/第 3 周/);
    expect(weekElements.length).toBeGreaterThanOrEqual(2);
  });

  it('should have prev and next week buttons', () => {
    expect(screen.getByText('← 上一周')).toBeInTheDocument();
    expect(screen.getByText('下一周 →')).toBeInTheDocument();
  });

  it('should increment week when clicking next', () => {
    fireEvent.click(screen.getByText('下一周 →'));
    expect(screen.getByText(/第 4 周/)).toBeInTheDocument();
  });

  it('should decrement week when clicking prev', () => {
    fireEvent.click(screen.getByText('← 上一周'));
    expect(screen.getByText(/第 2 周/)).toBeInTheDocument();
  });

  it('should disable prev button at week 1', () => {
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByText('← 上一周'));
    }
    const prevBtn = screen.getByText('← 上一周');
    expect(prevBtn).toBeDisabled();
  });

  it('should disable next button at week 19', () => {
    for (let i = 0; i < 16; i++) {
      fireEvent.click(screen.getByText('下一周 →'));
    }
    const nextBtn = screen.getByText('下一周 →');
    expect(nextBtn).toBeDisabled();
  });
});
