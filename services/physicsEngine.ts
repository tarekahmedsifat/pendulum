import type { PendulumState, PendulumConfig } from '../types';

/**
 * Equations of Motion for a Double Pendulum:
 * Mass 2 is attached to Mass 1.
 * State: [theta1, omega1, theta2, omega2]
 */
export class PhysicsEngine {
  static derivatives(state: number[], config: PendulumConfig): number[] {
    const [t1, w1, t2, w2] = state;
    const { L1, L2, m1, m2, g, damping } = config;

    const delta = t1 - t2;
    const den = 2 * m1 + m2 - m2 * Math.cos(2 * t1 - 2 * t2);

    const a1 = (
      -g * (2 * m1 + m2) * Math.sin(t1) 
      - m2 * g * Math.sin(t1 - 2 * t2) 
      - 2 * Math.sin(delta) * m2 * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(delta))
    ) / (L1 * den);

    const a2 = (
      2 * Math.sin(delta) * (
        w1 * w1 * L1 * (m1 + m2) 
        + g * (m1 + m2) * Math.cos(t1) 
        + w2 * w2 * L2 * m2 * Math.cos(delta)
      )
    ) / (L2 * den);

    const dampedA1 = a1 - damping * w1;
    const dampedA2 = a2 - damping * w2;

    return [w1, dampedA1, w2, dampedA2];
  }

  /**
   * Runge-Kutta 4th Order Integration
   */
  static rk4(state: PendulumState, config: PendulumConfig, dt: number): PendulumState {
    const y = [state.theta1, state.omega1, state.theta2, state.omega2];

    const k1 = this.derivatives(y, config);
    const k2 = this.derivatives(y.map((v, i) => v + k1[i] * dt / 2), config);
    const k3 = this.derivatives(y.map((v, i) => v + k2[i] * dt / 2), config);
    const k4 = this.derivatives(y.map((v, i) => v + k3[i] * dt), config);

    const nextY = y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));

    return {
      theta1: nextY[0],
      omega1: nextY[1],
      theta2: nextY[2],
      omega2: nextY[3],
      time: state.time + dt
    };
  }
}