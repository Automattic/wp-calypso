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

export function isMigrationEntryPoint( from?: string | null ): boolean {
	return (
		isStandardEntryPoint( from ) &&
		( from === 'wpcom_migration' || from?.startsWith( 'wpcom_migration_' ) === true )
	);
}

/**
 * The plugins the connection screens present for this entry point.
 */
export function getPluginsForEntryPoint(
	pluginSlugs: readonly string[] = [],
	from?: string | null
) {
	// Remove the migration plugin unless we came from the migration entry point.
	if ( ! isMigrationEntryPoint( from ) ) {
		return pluginSlugs.filter( ( slug ) => slug !== 'wpcom-migration' );
	}

	return [ ...pluginSlugs ];
}

/**
 * Whether `from` gets the unified connection flow: the plugin-aware logo,
 * title, subtitle and feature cards on the authorize, signup and login
 * screens. `jetpack-connector` (the Connectors card) and `jetpack-onboarding`
 * (My Jetpack's onboarding takeover) are matched exactly because they have
 * already shipped. New entry points get it by using a standard name.
 */
export function isUnifiedFlow( from?: string | null ): boolean {
	return (
		from === 'jetpack-connector' || from === 'jetpack-onboarding' || isStandardEntryPoint( from )
	);
}
