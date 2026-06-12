export const DASHBOARD_SECTION_PATHS = [
	'/',
	'/sites',
	'/domains',
	'/emails',
	'/plugins',
	'/me',
	'/oauth/token',
];

// A4A-only routes that aren't part of DASHBOARD_SECTION_PATHS.
// These must be registered server-side so refresh/direct hits work.
export const A4A_DASHBOARD_EXTRA_PATHS = [ '/overview', '/client', '/client/subscriptions' ];

export const A4A_SIGNUP_PATHS = [ '/signup', '/signup/finish', '/signup/oauth/token' ];
