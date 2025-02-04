/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import debugFactory from 'debug';
/**
 * Internal dependencies
 */
import { STORE_NAME } from '../store';
/**
 * Types
 */
import type { Selectors } from '../store/types';

const debug = debugFactory( 'jetpack-ai-calypso:use-checkout' );

export const useCheckout = () => {
	const { nextTier, siteDetails } = useSelect( ( select ) => {
		const selectors: Selectors = select( STORE_NAME );
		return {
			nextTier: selectors.getAiAssistantFeature().nextTier,
			siteDetails: selectors.getSiteDetails(),
		};
	}, [] );

	const upgradeURL = new URL(
		`${ location.origin }/checkout/${ siteDetails?.domain }/${ nextTier?.slug }`
	);
	upgradeURL.searchParams.set( 'redirect_to', location.href );

	debug( 'Next tier checkout URL: ', upgradeURL.toString() );

	return {
		nextTierCheckoutURL: upgradeURL.toString(),
		hasNextTier: !! nextTier,
	};
};
