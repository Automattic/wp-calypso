import { VIPLogo } from '@automattic/components';
import { translate } from 'i18n-calypso';
import {
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/pressable-logo.svg';
import WPCOMLogo from 'calypso/assets/images/a8c-for-agencies/wpcom-logo.svg';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

/**
 * Get the cheapest plan from a list of plans
 * @param {APIProductFamilyProduct[]} plans - List of plans
 * @returns {APIProductFamilyProduct} - Cheapest plan
 */
export function getCheapestPlan( plans: APIProductFamilyProduct[] ) {
	return plans.reduce( ( cheapestPlan: APIProductFamilyProduct, plan: APIProductFamilyProduct ) => {
		if ( Number( plan.amount ) < Number( cheapestPlan.amount ) ) {
			return plan;
		}
		return cheapestPlan;
	}, plans[ 0 ] );
}

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
 * Get the URL for a hosting provider
 * @param {string} slug - Hosting provider slug
 * @returns {string} - Hosting provider URL
 */
export function getHostingPageUrl( slug: string ) {
	switch ( slug ) {
		case 'pressable-hosting':
			return A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK;
		case 'wpcom-hosting':
			return A4A_MARKETPLACE_HOSTING_WPCOM_LINK;
		case 'vip':
			return 'https://wpvip.com/contact/';
	}

	return A4A_MARKETPLACE_HOSTING_LINK;
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
		keyOrSlug.startsWith( 'pressable-wp' ) ||
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
