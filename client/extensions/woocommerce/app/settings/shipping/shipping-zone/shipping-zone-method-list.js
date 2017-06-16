/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import { getMethodSummary } from '../shipping-method-utils';
import { getCurrentlyEditingShippingZoneMethods } from 'woocommerce/state/ui/shipping/zones/methods/selectors';

const ShippingZoneMethodList = ( { methods, translate } ) => {
	const renderMethod = ( method, index ) => (
		<div key={ index }>
			{ method.title }
			{ getMethodSummary( method, translate ) }
			<Button compact>{ translate( 'Edit' ) }</Button>
		</div>
	);

	return (
		<div>
			<ExtendedHeader
				label={ translate( 'Shipping methods' ) }
				description={ translate( 'Any customers that reside in the locations' +
					' defined above will have access to these shipping methods' ) } />
			<Card>
				{ methods.map( renderMethod ) }
				<Button compact>{ translate( 'Add method' ) }</Button>
			</Card>
		</div>
	);
};

export default connect(
	( state ) => ( {
		methods: getCurrentlyEditingShippingZoneMethods( state )
	} )
)( localize( ShippingZoneMethodList ) );
