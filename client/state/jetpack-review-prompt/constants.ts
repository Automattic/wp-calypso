export const PREFERENCE_NAME = 'jetpack-review-prompt';

export interface SinglePreferenceType {
	dismissCount: number;
	dismissedAt: number | null;
	reviewed: boolean;
	validFrom: number | null;
}

export interface PreferenceType {
	scan?: SinglePreferenceType;
	restore?: SinglePreferenceType;
}

export const emptyPreference: SinglePreferenceType = {
	dismissCount: 0,
	dismissedAt: null,
	reviewed: false,
	validFrom: null,
};

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export const TIME_BETWEEN_PROMPTS = 2 * WEEK_IN_MS;
export const MAX_DISMISS_COUNT = 2;
