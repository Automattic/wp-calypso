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
import ListItem from 'woocommerce/components/list/list-item';
import ListItemField from 'woocommerce/components/list/list-item-field';
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

		return (
			<ListItem>
				<ListItemField>
					<Button>{ translate( 'Add location' ) }</Button>
				</ListItemField>
			</ListItem> );
	};

	return (
		<div className="shipping-zone__locations">
			<ExtendedHeader
				label={ translate( 'Zone locations' ) }
				description={ translate( 'Add locations that you want to share shipping methods' ) } />
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
