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
 * Per the design ask, every card uses a *full* brand mark (not a lone-circle
 * variant). All Jetpack-family cards — the generic family card and every
 * per-plugin override — share the single full Jetpack logo so the section
 * stays visually consistent across plugin combinations; the bullet copy
 * carries the per-plugin specifics. A4A and Woo each use their own full
 * wordmark; the `other` fallback has no logo (the bullet copy is the
 * visual hook on its own).
 *
 * `size={ 32 }` aligns the inline SVG marks with the CSS-enforced
 * `height: 32px` on `<img>` logos in `features-section/style.scss`, so
 * every card's brand mark renders at the same visual height regardless
 * of source.
 */
function getLogoForCardKey( key: FeatureCardKey ): ReactNode | string | undefined {
	switch ( key ) {
		case 'a4a':
			return <A4ALogo fullA4A size={ 32 } />;
		case 'woo':
			return WooLogo;
		case 'jetpack':
		case 'jetpack-backup':
		case 'jetpack-protect':
		case 'jetpack-boost':
		case 'jetpack-search':
		case 'jetpack-social':
		case 'jetpack-videopress':
			return <JetpackLogo full size={ 32 } />;
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
 * Build the FeaturesSection props for the connector authorize page from
 * the `plugins` query parameter — picks up to three cards (per the
 * family-priority rules in `getFeatureSelection`) and resolves each one's
 * logo, title, and bullet copy.
 *
 * The Connected-plugins row mirrors `getFeatureSelection`'s overflow
 * contract verbatim: it repeats every active plugin's display name —
 * including the slugs whose family already earns a card — whenever more
 * than one plugin is connected. The redundancy is deliberate, so users
 * can still tell which Jetpack plugin(s) the connection covers even
 * though every Jetpack-family card shares the same brand mark.
 * Single-plugin connections skip the row entirely.
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
