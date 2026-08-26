export const READER_ONBOARDING_PREFERENCE_KEY = 'has_completed_reader_onboarding';
export const READER_EARLY_READERS_EXPERIMENT_NAME = 'calypso_reader_early_readers_v0';

// Deliberately outside the `calypso_reader_onboarding_` prefix: these measure
// the Early Readers program's own funnel, not onboarding step navigation.
export const READER_EARLY_READERS_OPT_IN_EVENT = 'calypso_reader_early_readers_opt_in';
export const READER_EARLY_READERS_DECLINED_EVENT = 'calypso_reader_early_readers_declined';

// Identifies which onboarding step hosted the opt-in screen, so v1 can move the
// placement without making the v0 numbers ambiguous.
export const READER_EARLY_READERS_SOURCE_STEP = 'onboarding_final';

export const READER_ONBOARDING_SEEN_PREFERENCE_KEY = 'has_seen_reader_onboarding';
export const READER_ONBOARDING_DISMISSED_PREFERENCE_KEY = 'has_dismissed_reader_onboarding';
export const READER_ONBOARDING_TRACKS_EVENT_PREFIX = 'calypso_reader_onboarding_';
export const READER_ONBOARDING_FOLLOW_SOURCE = 'reader-onboarding';

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
