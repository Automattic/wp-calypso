export const READER_SHELVES_ONBOARDING_SEEN_PREFERENCE_KEY = 'has_seen_reader_shelves_onboarding';

export const READER_SHELVES_ONBOARDING_TRACKS_EVENT_PREFIX = 'calypso_reader_shelves_onboarding_';

// Debug override: set this key to '1' in localStorage (e.g. from the browser
// console) to force the walkthrough to show on every "Create a shelf" click,
// regardless of the "seen" preference. Remove the key to restore normal gating.
export const READER_SHELVES_ONBOARDING_DEBUG_KEY = 'reader_shelves_onboarding_debug';
