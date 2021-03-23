export const PREFERENCE_NAME = 'jetpack-review-prompt';

export interface PreferenceType {
	dismissCount: number;
	dismissedAt: number | null;
	reviewed: boolean;
}

export const emptyPreference: PreferenceType = {
	dismissCount: 0,
	dismissedAt: null,
	reviewed: false,
};

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export const TIME_BETWEEN_PROMPTS = 2 * WEEK_IN_MS;
export const MAX_DISMISS_COUNT = 2;
