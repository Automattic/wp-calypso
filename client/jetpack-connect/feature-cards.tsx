import { paths as productIconPaths } from '@automattic/components/src/product-icon/config';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import WooLogo from 'calypso/assets/images/icons/Woo_logo_color.svg';
import JetpackLogo from 'calypso/components/jetpack-logo';
import {
	getFeatureCardData,
	getFeatureSelection,
	getPluginDisplayName,
} from './connection-content';
import type { FeatureCardKey } from './connection-content';
import type { FeatureCard } from 'calypso/components/connect-screen/features-section';
import type { ReactNode } from 'react';

/**
 * Render the brand-correct logo for a feature card key.
 *
 * The user-facing requirement is that each card uses the *full* brand mark
 * (not the lone-circle / single-letter variant) — so:
 *   - A4A: the "Automattic for Agencies" wordmark (`<A4ALogo fullA4A />`).
 *   - Woo: the full Woo color wordmark SVG.
 *   - Full Jetpack: the green-circle + "Jetpack" wordmark (`<JetpackLogo full />`).
 *   - Individual Jetpack plugins: their dedicated product icon (the
 *     official square brand asset for each plugin), with `jetpack-protect`
 *     reusing the `jetpack-scan` icon since Protect is the consumer-facing
 *     security/scan plugin and we don't ship a distinct asset for it.
 *   - `other`: no logo — the generic "Your active plugins" card title is
 *     the visual hook on its own.
 */
function getLogoForCardKey( key: FeatureCardKey ): ReactNode | string | undefined {
	switch ( key ) {
		case 'a4a':
			return <A4ALogo fullA4A size={ 28 } />;
		case 'woo':
			return WooLogo;
		case 'jetpack':
			return <JetpackLogo full size={ 28 } />;
		case 'jetpack-backup':
			return productIconPaths[ 'jetpack-backup' ];
		case 'jetpack-protect':
			return productIconPaths[ 'jetpack-scan' ];
		case 'jetpack-boost':
			return productIconPaths[ 'jetpack-boost' ];
		case 'jetpack-search':
			return productIconPaths[ 'jetpack-search' ];
		case 'jetpack-social':
			return productIconPaths[ 'jetpack-social' ];
		case 'jetpack-videopress':
			return productIconPaths[ 'jetpack-videopress' ];
		case 'other':
		default:
			return undefined;
	}
}

/**
 * Friendly alt text for the card logo.
 *
 * Card titles already render the plugin name as visible text, so this stays
 * empty by default ("decorative" image semantics) for everything except the
 * generic Jetpack family logo, which doesn't have its own visible title-row
 * brand mark beyond the wordmark itself.
 */
function getLogoAltForCardKey( key: FeatureCardKey ): string {
	if ( key === 'jetpack' ) {
		return 'Jetpack';
	}
	return '';
}

export interface ConnectorFeatureCards {
	cards: FeatureCard[];
	overflowItems: string[];
}

/**
 * Build the FeaturesSection props for the connector authorize page from the
 * `plugins` query parameter — picks at most two cards (per the family-priority
 * rules in `getFeatureSelection`) and resolves each one's logo, title, and
 * bullet copy. Overflow items are the friendly display names for any active
 * plugins whose family didn't earn a card slot.
 */
export function getConnectorFeatureCards(
	pluginSlugs: readonly string[] = []
): ConnectorFeatureCards {
	const { cardKeys, overflowSlugs } = getFeatureSelection( pluginSlugs );

	const cards: FeatureCard[] = cardKeys.map( ( key ) => {
		const data = getFeatureCardData( key );
		return {
			id: key,
			logo: getLogoForCardKey( key ),
			logoAlt: getLogoAltForCardKey( key ),
			title: data.title,
			bullets: data.bullets,
		};
	} );

	const overflowItems = overflowSlugs.map( ( slug ) => getPluginDisplayName( slug ) );

	return { cards, overflowItems };
}
