export const READER_ONBOARDING_PREFERENCE_KEY = 'has_completed_reader_onboarding';
export const READER_ONBOARDING_SEEN_PREFERENCE_KEY = 'has_seen_reader_onboarding';
export const READER_ONBOARDING_DISMISSED_PREFERENCE_KEY = 'has_dismissed_reader_onboarding';
export const READER_ONBOARDING_TRACKS_EVENT_PREFIX = 'calypso_reader_onboarding_';

// Minimum followed counts that mark the interests/discover checklist tasks
// as "satisfied" and remove the user from initial-eligibility for onboarding.
// Shared so the checklist completion UI and the eligibility gate cannot drift.
export const READER_ONBOARDING_MIN_FOLLOWED_TAGS = 3;
export const READER_ONBOARDING_MIN_FOLLOWED_SITES = 4;

// Users who registered on or after this ISO date are considered eligible for
// onboarding regardless of their current follow counts — they are new enough
// that we want to walk them through the experience even if they happen to
// have already collected enough subscriptions/tags from elsewhere.
export const READER_ONBOARDING_ELIGIBLE_REGISTRATION_DATE = '2026-05-22T00:00:00Z';
