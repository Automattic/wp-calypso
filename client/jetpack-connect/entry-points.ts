// No dependencies, so the login screens and the logged-out layout can import
// this module without pulling in the rest of Jetpack Connect.

const STANDARD_ENTRY_POINT_PATTERN = /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/;
const STANDARD_ENTRY_POINT_MAX_LENGTH = 64;

/**
 * Whether `from` is an entry-point name in the standard format: lowercase
 * letters, digits and underscores, with at least one underscore, e.g.
 * `jetpack_premium_analytics_onboarding`. Legacy values all contain a hyphen,
 * so they never match.
 */
export function isStandardEntryPoint( from?: string | null ): boolean {
	return (
		typeof from === 'string' &&
		from.length <= STANDARD_ENTRY_POINT_MAX_LENGTH &&
		STANDARD_ENTRY_POINT_PATTERN.test( from )
	);
}

/**
 * Whether `from` comes from Jetpack's onboarding in My Jetpack: the
 * single-screen takeover sends `jetpack-onboarding`, the setup wizard
 * `jetpack-onboarding-wizard`.
 */
export function isJetpackOnboarding( from?: string | null ): boolean {
	return typeof from === 'string' && from.startsWith( 'jetpack-onboarding' );
}

/**
 * Whether `from` gets the unified connection flow: the plugin-aware logo,
 * title, subtitle and feature cards on the authorize, signup and login
 * screens, first built for the Connectors card (`jetpack-connector`). New
 * entry points get it by using a standard name.
 */
export function isUnifiedFlow( from?: string | null ): boolean {
	return (
		from === 'jetpack-connector' || isJetpackOnboarding( from ) || isStandardEntryPoint( from )
	);
}
