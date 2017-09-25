/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import ExtendedHeader from 'woocommerce/components/extended-header';
import StoreAddress from 'woocommerce/components/store-address';

const ShippingOrigin = ( { translate } ) => {
	return (
		<div className="shipping__origin">
			<ExtendedHeader
				label={ translate( 'Shipping Origin' ) }
				description={ translate( 'The address of where you will be shipping from.' ) } />
			<StoreAddress showLabel={ false } />
		</div>
	);
};

export default localize( ShippingOrigin );
