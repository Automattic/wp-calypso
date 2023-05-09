export const PREFERENCE_BASE_NAME = 'persistent-counter';

export interface SingleCounterType {
	count: number;
	lastUpdated: number | null;
}

export interface CounterType {
	[ counterName: string ]: SingleCounterType;
}

export const initialCount: SingleCounterType = {
	count: 0,
	lastUpdated: null,
};
