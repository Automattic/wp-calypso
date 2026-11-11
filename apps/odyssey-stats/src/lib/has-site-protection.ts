import config, { optionalConfig } from './config-api';

/**
 * Whether the widget shows its Site protection card. Shared by the card and by the loader's
 * skeleton, so the skeleton never draws a card that is not coming.
 *
 * Akismet and Protect modules are not available on Simple sites. Only the Jetpack plugin
 * registers the REST routes the card reads: the standalone Stats plugin prints an empty
 * `jetpack_version` when Jetpack is not active, and stats-admin releases older than that
 * key ship only with the Jetpack plugin.
 */
export default function hasSiteProtection(): boolean {
	return (
		config.isEnabled( 'is_running_in_jetpack_site' ) && optionalConfig( 'jetpack_version' ) !== ''
	);
}
