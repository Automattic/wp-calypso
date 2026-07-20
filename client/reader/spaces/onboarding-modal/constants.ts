export const READER_SPACES_ONBOARDING_SEEN_PREFERENCE_KEY = 'has_seen_reader_spaces_onboarding';

export const READER_SPACES_ONBOARDING_TRACKS_EVENT_PREFIX = 'calypso_reader_spaces_onboarding_';

// Debug override: set this key to '1' in localStorage (e.g. from the browser
// console) to force the walkthrough to show on every "Create a space" click,
// regardless of the "seen" preference. Remove the key to restore normal gating.
export const READER_SPACES_ONBOARDING_DEBUG_KEY = 'reader_spaces_onboarding_debug';
