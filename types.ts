
export interface PendulumState {
  theta1: number;
  omega1: number;
  theta2: number;
  omega2: number;
  time: number;
}

export interface PendulumConfig {
  L1: number; // Length of first arm
  L2: number; // Length of second arm
  m1: number; // Mass of first bob
  m2: number; // Mass of second bob
  g: number;  // Gravity
  damping: number; // Damping factor (friction)
}

export interface HistoryPoint {
  time: number;
  theta1: number;
  theta2: number;
}
