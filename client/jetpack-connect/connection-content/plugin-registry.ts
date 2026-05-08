import jetpackConnectA8cLogo from '../images/jetpack-connect-a8c.svg';
import jetpackConnectAllLogo from '../images/jetpack-connect-all.svg';
import jetpackConnectWooLogo from '../images/jetpack-connect-woo.svg';
import jetpackConnectLogo from '../images/jetpack-connect.svg';
import type { Family } from './families';

/**
 * Registry entry for a known plugin participating in the unified connection flow.
 *
 * `displayName` is the human-readable plugin label used by any surface that
 * needs to refer to a specific plugin by name. It is left as a plain string
 * in this registry because the plugin name itself is a brand — translators
 * don't translate "WooCommerce" or "Jetpack VaultPress Backup". Surrounding
 * sentences that reference these names are translated in `copy.ts` and
 * elsewhere.
 */
export interface PluginEntry {
	slug: string;
	family: Family;
	displayName: string;
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
	jetpack: {
		slug: 'jetpack',
		family: 'jetpack',
		displayName: 'Jetpack',
		isFullJetpack: true,
	},
	'jetpack-backup': {
		slug: 'jetpack-backup',
		family: 'jetpack',
		displayName: 'Jetpack VaultPress Backup',
	},
	'jetpack-protect': {
		slug: 'jetpack-protect',
		family: 'jetpack',
		displayName: 'Jetpack Protect',
	},
	'jetpack-boost': {
		slug: 'jetpack-boost',
		family: 'jetpack',
		displayName: 'Jetpack Boost',
	},
	'jetpack-search': {
		slug: 'jetpack-search',
		family: 'jetpack',
		displayName: 'Jetpack Search',
	},
	'jetpack-social': {
		slug: 'jetpack-social',
		family: 'jetpack',
		displayName: 'Jetpack Social',
	},
	'jetpack-videopress': {
		slug: 'jetpack-videopress',
		family: 'jetpack',
		displayName: 'Jetpack VideoPress',
	},
	woocommerce: {
		slug: 'woocommerce',
		family: 'woo',
		displayName: 'WooCommerce',
	},
	'woocommerce-payments': {
		slug: 'woocommerce-payments',
		family: 'woo',
		displayName: 'WooPayments',
	},
	'automattic-for-agencies-client': {
		slug: 'automattic-for-agencies-client',
		family: 'a4a',
		displayName: 'Automattic for Agencies',
	},
};

/**
 * Friendly display name for a plugin slug.
 *
 * Falls back to the raw slug when the plugin isn't in the registry — unknown
 * plugins never block the flow, they keep their slug as the displayed label
 * for any caller that surfaces them by name.
 */
export function getPluginDisplayName( slug: string ): string {
	return PLUGIN_REGISTRY[ slug ]?.displayName ?? slug;
}

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
