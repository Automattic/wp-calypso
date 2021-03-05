/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import ExtendedHeader from 'woocommerce/components/extended-header';
import StoreAddress from 'woocommerce/components/store-address';
import ShippingUnits from './shipping-units';

const ShippingOrigin = ( { translate, onChange } ) => {
	return (
		<div className="shipping__origin">
			<ExtendedHeader
				label={ translate( 'Shipping origin' ) }
				description={ translate( 'The address of where you will be shipping from.' ) }
			/>
			<Card className="shipping__origin-settings">
				<StoreAddress showLabel={ false } />
				<ShippingUnits onChange={ onChange } />
			</Card>
		</div>
	);
};

export default localize( ShippingOrigin );
