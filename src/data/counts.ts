

export enum CounterKeys {
  Bullpen = 'Bullpen',
  RaceNumber = 'RaceNumber'
}

export enum LeftRightTap {
  Left,
  Right
}

class Counter {

  private monitoringFunctions = new Set<Function>();
  private monitoringInterval: null | ReturnType<typeof setInterval> = null;
  public getAllCounts() {
    return {
      raceNumber: this.getCount(CounterKeys.RaceNumber),
      bullpen: this.getCount(CounterKeys.Bullpen)
    }
  }
  private lastCounts: ReturnType<Counter['getAllCounts']> | null = null;
  public checkAndExecuteMonitoringFunctions() {
    const currentCounts = this.getAllCounts();
    const lastCounts = this.lastCounts;
    const countKeys = Object.keys(currentCounts) as (keyof typeof currentCounts)[];
    const somethingChanged = lastCounts != null && countKeys.some(key => currentCounts[key] !== lastCounts[key]);
    this.lastCounts = currentCounts;
    if (!somethingChanged) {
      return;
    }
    for (const fn of this.monitoringFunctions) {
      fn();
    }
  }
  public listenForCountChanges(fn: Function) {
    this.monitoringFunctions.add(fn)
    if (!this.monitoringInterval) {
      this.monitoringInterval = setInterval(() => {
        this.checkAndExecuteMonitoringFunctions();
      }, 250)
    }
  }
  public removeListener(fn: Function) {
    this.monitoringFunctions.delete(fn);
  }

  /* basic get/set */
  private getCount(key: CounterKeys) {
    const value = localStorage.getItem(key);
    if (!Number.isInteger(Number(value))) {
      return 0;
    }
    return Number(value)
  }
  private setCount(key: CounterKeys, value: number) {
    localStorage.setItem(key, String(value))
    this.checkAndExecuteMonitoringFunctions();
  }

  public incrementCount(key: CounterKeys) {
    const count = this.getCount(key);
    this.setCount(key, count + 1);
  }
  public decrementCount(key: CounterKeys) {
    const count = this.getCount(key);
    this.setCount(key, Math.max(count - 1, 0));
  }

  public taps: LeftRightTap[]  = [];
  private applyActionsDuringTimer() {
    if (this.taps.length >= 3 && this.taps.every(t => t === LeftRightTap.Left)) {
      this.decrementCount(CounterKeys.Bullpen)
      this.decrementCount(CounterKeys.RaceNumber)
    } else if (this.taps.length >= 3 && this.taps.every(t => t === LeftRightTap.Right)) {
      this.incrementCount(CounterKeys.Bullpen)
      this.incrementCount(CounterKeys.RaceNumber)
    } else if (this.taps.length == 2 && this.taps.every(t => t === LeftRightTap.Left)) {
      this.decrementCount(CounterKeys.RaceNumber)
    } else if (this.taps.length == 2 && this.taps.every(t => t === LeftRightTap.Right)) {
      this.incrementCount(CounterKeys.RaceNumber)
    } else if (this.taps.length == 1 && this.taps.every(t => t === LeftRightTap.Left)) {
      this.decrementCount(CounterKeys.Bullpen)
    } else if (this.taps.length == 1 && this.taps.every(t => t === LeftRightTap.Right)) {
      this.incrementCount(CounterKeys.Bullpen)
    }
    console.log('doing nothing, tap sequence made no sense');
    this.taps = [];
  }

  /* track counts */
  private timer: null | ReturnType<typeof setTimeout> = null
  private timerStarted: number | null = null
  private startTimer() {
    if (this.timer != null) {
      return;
    }
    this.timer = setTimeout(() => {
      this.applyActionsDuringTimer();
      this.timer = null;
      this.timerStarted = null;
    }, 3000 /* 3 seconds */)
    this.timerStarted = Date.now();
  }
  public getTimeRemainingOnCounterMs() {
    if (!this.timerStarted) {
      return null;
    }
    return this.timerStarted + 3000 - Date.now();
  }

  public registerTap(tap: LeftRightTap) {
    this.startTimer();
    this.taps.push(tap)
  }
}

export const ControllerCounter = new Counter();

export const FormatCount = (count: number) => {
  const s = String(count);
  if (s.length > 1) {
    return s;
  }
  return `0${s}`;
}