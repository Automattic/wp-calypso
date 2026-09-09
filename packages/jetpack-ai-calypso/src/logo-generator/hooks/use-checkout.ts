/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import debugFactory from 'debug';
/**
 * Internal dependencies
 */
import { getUpgradeURL } from '../lib/upgrade-url';
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

	const upgradeURL = getUpgradeURL( { siteDetails, nextTierSlug: nextTier?.slug } );

	debug( 'Next tier checkout URL: ', upgradeURL );

	return {
		nextTierCheckoutURL: upgradeURL,
		hasNextTier: !! nextTier,
	};
};
