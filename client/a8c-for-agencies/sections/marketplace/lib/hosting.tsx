import { VIPLogo } from '@automattic/components';
import { translate } from 'i18n-calypso';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/pressable-logo.svg';
import WPCOMLogo from 'calypso/assets/images/a8c-for-agencies/wpcom-logo.svg';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

/**
 * Get the WPCOM Creator plan from a list of plans
 * @param {APIProductFamilyProduct[]} plans - List of plans
 * @returns {APIProductFamilyProduct} - WPCOM Creator plan
 */
export function getWPCOMCreatorPlan( plans: APIProductFamilyProduct[] ) {
	return plans.find( ( plan: APIProductFamilyProduct ) => {
		return plan.slug === 'wpcom-hosting-business';
	} );
}

/**
 * Get the logo for a hosting provider
 * @param {string} slug - Hosting provider slug
 * @returns {Element} - Hosting provider logo
 */
export function getHostingLogo( slug: string, showText = true ) {
	switch ( slug ) {
		case 'pressable-hosting':
			return <img src={ PressableLogo } alt="" />;
		case 'wpcom-hosting':
			return <img src={ WPCOMLogo } alt="" />;
		case 'vip':
			return (
				<div className="wordpress-vip-logo">
					<VIPLogo height={ 30 } width={ 67 } />
					{ showText && translate( '(Enterprise)' ) }
				</div>
			);
	}

	return null;
}

/**
 * Provided a license key or a product slug, can we trust that the product is a Pressable hosting product
 * @param keyOrSlug string
 * @returns boolean True if Pressable hosting product, false if not
 */
export function isPressableHostingProduct( keyOrSlug: string ) {
	return (
		keyOrSlug.startsWith( 'pressable-' ) ||
		keyOrSlug.startsWith( 'pressable-hosting' ) ||
		keyOrSlug.startsWith( 'jetpack-pressable' )
	);
}

/**
 * Determine if current slug is a WPCOM hosting product.
 * @param {string} keyOrSlug - Product slug
 * @returns {boolean} - True if WPCOM hosting product, false if not
 */
export function isWPCOMHostingProduct( keyOrSlug: string ) {
	return keyOrSlug.startsWith( 'wpcom-hosting' );
}

/*
 * Get valid hosting section. If not valid, default to 'wpcom'
 * @param {string} section - Hosting section
 * @returns {'wpcom' | 'pressable' | 'vip'} - Valid hosting section
 */
export function getValidHostingSection( section: string ) {
	return [ 'wpcom', 'pressable', 'vip' ].includes( section )
		? ( section as 'wpcom' | 'pressable' | 'vip' )
		: 'wpcom';
}
