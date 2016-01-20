/**
 * External dependencies
 */
import React from 'react';
import Masterbar from './masterbar';

/**
 * Internal dependencies
 */
import Item from './item';
import { getExitCheckoutUrl } from 'lib/checkout';

function getMinimalLogoUrl( cart, selectedSite ) {
	if ( ! cart.hasLoadedFromServer || ! selectedSite ) {
		return '/';
	}

	return getExitCheckoutUrl( cart, selectedSite.slug );
}

const MasterbarCheckout = ( { cart, selectedSite } ) => (
	<Masterbar>
		<Item
			url={ getMinimalLogoUrl( cart, selectedSite ) }
			icon="my-sites"
			className="masterbar__item-logo">
			WordPress<span className="tld">.com</span>
		</Item>
	</Masterbar>
);

export default MasterbarCheckout;
