/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ExtendedHeader from 'woocommerce/components/extended-header';
import List from 'woocommerce/components/list/list';

const ShippingZoneLocations = ( { translate } ) => {
	const renderContent = () => {
		return null;
	};

	return (
		<div className="shipping-zone__locations">
			<ExtendedHeader
				label={ translate( 'Zone locations' ) }
				description={ translate( 'Add locations that you want to share shipping methods' ) } >
				<Button>{ translate( 'Add location' ) }</Button>
			</ExtendedHeader>
			<List>
				{ renderContent() }
			</List>
		</div>
	);
};

ShippingZoneLocations.PropTypes = {
	loaded: PropTypes.bool.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default localize( ShippingZoneLocations );
