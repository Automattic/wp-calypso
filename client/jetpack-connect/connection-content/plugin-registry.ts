import jetpackConnectA8cLogo from '../images/jetpack-connect-a8c.svg';
import jetpackConnectAllLogo from '../images/jetpack-connect-all.svg';
import jetpackConnectWooLogo from '../images/jetpack-connect-woo.svg';
import jetpackConnectLogo from '../images/jetpack-connect.svg';
import type { Family } from './families';

/**
 * Registry entry for a known plugin participating in the unified connection flow.
 *
 * PR 1 keeps each entry minimal — just the family classification and a flag
 * for the full Jetpack plugin. Future PRs extend this with display name,
 * card title/description, and feature bullets, which is why the entry is
 * its own typed shape rather than a bare value.
 */
export interface PluginEntry {
	slug: string;
	family: Family;
	/** True only for the full Jetpack plugin (not the individual sub-plugins). */
	isFullJetpack?: boolean;
}

/**
 * Slug → entry map for plugins we explicitly recognise.
 *
 * The registry is additive: callers should always treat unknown slugs as a
 * graceful fallback (resolve their family via `getFamilyFromSlug`) rather
 * than relying on the entry being present here.
 */
export const PLUGIN_REGISTRY: Record< string, PluginEntry > = {
	jetpack: { slug: 'jetpack', family: 'jetpack', isFullJetpack: true },
	'jetpack-backup': { slug: 'jetpack-backup', family: 'jetpack' },
	'jetpack-protect': { slug: 'jetpack-protect', family: 'jetpack' },
	'jetpack-boost': { slug: 'jetpack-boost', family: 'jetpack' },
	'jetpack-search': { slug: 'jetpack-search', family: 'jetpack' },
	'jetpack-social': { slug: 'jetpack-social', family: 'jetpack' },
	'jetpack-videopress': { slug: 'jetpack-videopress', family: 'jetpack' },
	woocommerce: { slug: 'woocommerce', family: 'woo' },
	'woocommerce-payments': { slug: 'woocommerce-payments', family: 'woo' },
	'automattic-for-agencies-client': {
		slug: 'automattic-for-agencies-client',
		family: 'a4a',
	},
};

/**
 * Look up a plugin's registry entry by slug. Returns `undefined` for slugs
 * that aren't explicitly registered — callers must handle the fallback.
 */
export function getPluginEntry( slug: string ): PluginEntry | undefined {
	return PLUGIN_REGISTRY[ slug ];
}

/**
 * Pick the composite connector logo SVG for a set of families present in
 * the active plugins.
 *
 * Mirrors the PHP `get_connector_logo_url()` logic in
 * `class-jetpack-connector.php` so Calypso and Jetpack stay aligned.
 */
export function getLogoForFamilies( families: readonly Family[] ): string {
	const hasWoo = families.includes( 'woo' );
	const hasA4a = families.includes( 'a4a' );

	if ( hasWoo && hasA4a ) {
		return jetpackConnectAllLogo;
	}
	if ( hasWoo ) {
		return jetpackConnectWooLogo;
	}
	if ( hasA4a ) {
		return jetpackConnectA8cLogo;
	}
	return jetpackConnectLogo;
}
