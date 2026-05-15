import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import WooLogo from 'calypso/assets/images/icons/Woo_logo_color.svg';
import JetpackLogo from 'calypso/components/jetpack-logo';
import {
	getFeatureCardData,
	getFeatureSelection,
	getSecondaryFeatureCardData,
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

export interface ConnectorFeatureCards {
	cards: FeatureCard[];
}

/**
 * Build the FeaturesSection props for the connector authorize page from
 * the `plugins` query parameter — picks up to three cards (per the
 * family-priority rules in `getFeatureSelection`) and resolves each one's
 * logo, title, and bullet copy.
 */
export function getConnectorFeatureCards(
	pluginSlugs: readonly string[] = []
): ConnectorFeatureCards {
	const { cardKeys } = getFeatureSelection( pluginSlugs );

	// `logoAlt` is intentionally omitted: every Jetpack-family card and A4A
	// pass a React-element logo whose `alt` is rendered by the SVG's own
	// `<title>` and dropped by `FeaturesSection`'s `renderImage()` helper,
	// so the prop wouldn't reach the DOM. The Woo card's `<img>` falls back
	// to `card.title` ("WooCommerce") via the `card.logoAlt || card.title`
	// chain in the component, which is exactly the value an explicit
	// override would have supplied.
	const cards: FeatureCard[] = cardKeys.map( ( key ) => {
		const data = getFeatureCardData( key );
		return {
			id: key,
			logo: getLogoForCardKey( key ),
			title: data.title,
			bullets: data.bullets,
		};
	} );

	return { cards };
}

/**
 * Feature cards for secondary admin connections (not the connection owner).
 *
 * Secondary admin connections enable a narrower set of features than the
 * owner connection. The card selection reuses the same plugin-aware
 * family/priority system as first connections, but the bullet copy
 * reflects the narrower scope (SSO, cloud management, etc.).
 */
export function getSecondaryAdminFeatureCards(
	pluginSlugs: readonly string[] = []
): ConnectorFeatureCards {
	const { cardKeys } = getFeatureSelection( pluginSlugs );

	const cards: FeatureCard[] = cardKeys.map( ( key ) => {
		const data = getSecondaryFeatureCardData( key );
		return {
			id: key,
			logo: getLogoForCardKey( key ),
			title: data.title,
			bullets: data.bullets,
		};
	} );

	return { cards };
}
