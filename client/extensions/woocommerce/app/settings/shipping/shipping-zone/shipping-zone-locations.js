/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import Spinner from 'components/spinner';

const ShippingZoneLocations = ( { loaded, translate } ) => {
	const renderContent = () => {
		if ( ! loaded ) {
			return (
				<div className="shipping-zone__loading-spinner">
					<Spinner size={ 24 } />
				</div>
			);
		}

		return ( <Button>{ translate( 'Add location' ) }</Button> );
	};

	return (
		<div className="shipping-zone__locations">
			<ExtendedHeader
				label={ translate( 'Zone locations' ) }
				description={ translate( 'Add locations that you want to share shipping methods' ) } />
			<Card>
				{ renderContent() }
			</Card>
		</div>
	);
};

ShippingZoneLocations.PropTypes = {
	loaded: PropTypes.bool
};

export default localize( ShippingZoneLocations );
