export const READER_ONBOARDING_PREFERENCE_KEY = 'has_completed_reader_onboarding';
export const READER_ONBOARDING_SEEN_PREFERENCE_KEY = 'has_seen_reader_onboarding';
export const READER_ONBOARDING_TRACKS_EVENT_PREFIX = 'calypso_reader_onboarding_';

// Minimum followed counts that mark the interests/discover checklist tasks
// as "satisfied" and remove the user from initial-eligibility for onboarding.
// Shared so the checklist completion UI and the eligibility gate cannot drift.
export const READER_ONBOARDING_MIN_FOLLOWED_TAGS = 3;
export const READER_ONBOARDING_MIN_FOLLOWED_SITES = 4;
