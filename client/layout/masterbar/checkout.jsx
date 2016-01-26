/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import MasterbarMinimal from './minimal';
import { getExitCheckoutUrl } from 'lib/checkout';

function getMinimalLogoUrl( cart, selectedSite ) {
	if ( ! cart.hasLoadedFromServer || ! selectedSite ) {
		return '/';
	}

	return getExitCheckoutUrl( cart, selectedSite.slug );
}

const MasterbarCheckout = ( { cart, selectedSite } ) => (
	<MasterbarMinimal url={ getMinimalLogoUrl( cart, selectedSite ) } />
);

export default MasterbarCheckout;
