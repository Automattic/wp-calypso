import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import WooLogo from 'calypso/assets/images/icons/Woo_logo_color.svg';
import JetpackLogo from 'calypso/components/jetpack-logo';
import {
	getFamilyFromSlug,
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
 */
function getLogoForCardKey( key: FeatureCardKey ): ReactNode | string | undefined {
	switch ( key ) {
		case 'a4a':
			return <A4ALogo fullA4A size={ 28 } />;
		case 'woo':
			return WooLogo;
		case 'jetpack':
		case 'jetpack-backup':
		case 'jetpack-protect':
		case 'jetpack-boost':
		case 'jetpack-search':
		case 'jetpack-social':
		case 'jetpack-videopress':
			return <JetpackLogo full size={ 28 } />;
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
	overflowLogo?: ReactNode;
	overflowItems: string[];
}

/**
 * Build the FeaturesSection props for the connector authorize page from the
 * `plugins` query parameter — picks at most two cards (per the family-priority
 * rules in `getFeatureSelection`) and resolves each one's logo, title, and
 * bullet copy. The Used-by row lists every active plugin's display name
 * whenever more than one is connected (single-plugin connections skip it),
 * giving users a textual fallback for the brand-shared Jetpack cards.
 *
 * Above the list, the section surfaces the full Jetpack logo when at least
 * one Jetpack-family plugin is active *and* no Jetpack card is on screen —
 * the canonical case is the all-three-families scenario where A4A and Woo
 * take both card slots. When a Jetpack card is already featured its brand
 * mark is on the card itself, so the leading overflow logo is omitted.
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
	const hasFeaturedJetpackCard = cardKeys.some( ( key ) => getFamilyFromSlug( key ) === 'jetpack' );
	const hasJetpackOverflow = overflowSlugs.some(
		( slug ) => getFamilyFromSlug( slug ) === 'jetpack'
	);
	const overflowLogo =
		! hasFeaturedJetpackCard && hasJetpackOverflow ? <JetpackLogo full size={ 24 } /> : undefined;

	return { cards, overflowLogo, overflowItems };
}
