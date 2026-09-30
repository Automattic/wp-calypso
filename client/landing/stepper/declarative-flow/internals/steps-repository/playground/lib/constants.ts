export const PLAYGROUND_HOST = 'https://playground.wordpress.net';

export const SESSION_KEY_FROM_PLAYGROUND_PUBLISH = 'entrepreneur_from_playground_publish';
export const SESSION_KEY_PLAYGROUND_ID = 'entrepreneur_playground_id';
export const SESSION_KEY_PLAYGROUND_WOO_INTENT = 'entrepreneur_playground_woo_intent';
export const BLUEPRINT_LIB_HOST = 'blueprintlibrary.wordpress.com';
// A WordPress.com static site import preview is shared as a blueprint at
// STATIC_SITE_IMPORT_SHARE_BASE + <share token> + '/blueprint'. The token is
// kept for the tab so a launch can be recorded against the import it came from.
export const STATIC_SITE_IMPORT_SHARE_BASE =
	'https://public-api.wordpress.com/wpcom/v2/static-site-import-session/share/';
export const SESSION_KEY_STATIC_SITE_IMPORT_SHARE = 'playground_static_site_import_share';
export const FALLBACK_PHP_VERSION = '8.4';

// Check PR #108910 (https://github.com/Automattic/wp-calypso/pull/108910) on
// how we were dynamically calculating it earlier on hover of Launch button.
export const DEFAULT_PLAN_INTENT = 'plans-playground';
