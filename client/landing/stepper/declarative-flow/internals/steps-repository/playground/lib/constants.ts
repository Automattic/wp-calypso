export const PLAYGROUND_HOST = 'https://playground.wordpress.net';

export const SESSION_KEY_FROM_PLAYGROUND_PUBLISH = 'entrepreneur_from_playground_publish';
export const SESSION_KEY_PLAYGROUND_ID = 'entrepreneur_playground_id';
export const BLUEPRINT_LIB_HOST = 'blueprintlibrary.wordpress.com';
export const FALLBACK_PHP_VERSION = '8.4';

// Check PR #108910 (https://github.com/Automattic/wp-calypso/pull/108910) on
// how we were dynamically calculating it earlier on hover of Launch button.
export const DEFAULT_PLAN_INTENT = 'plans-playground';

export const WOO_START_HOSTS_URL = 'https://woocommerce.com/start/#hosts';

// How long to wait after recording a Tracks event before a full page navigation,
// so the queued event has time to go out before the page unloads.
export const TRACKS_FLUSH_DELAY = 250;
