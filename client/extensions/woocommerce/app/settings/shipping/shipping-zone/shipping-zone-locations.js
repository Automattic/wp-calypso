/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';

const ShippingZoneLocations = ( { translate } ) => {
	return (
		<div>
			<ExtendedHeader
				label={ translate( 'Zone locations' ) }
				description={ translate( 'Add locations that you want to share shipping methods' ) } />
			<Card>
				<Button compact>{ translate( 'Add location' ) }</Button>
			</Card>
		</div>
	);
};

export default localize( ShippingZoneLocations );
