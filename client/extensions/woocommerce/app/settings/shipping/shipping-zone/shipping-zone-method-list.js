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
import Spinner from 'components/spinner';
import { getMethodSummary } from '../shipping-method-utils';
import { getCurrentlyEditingShippingZoneMethods } from 'woocommerce/state/ui/shipping/zones/methods/selectors';

const ShippingZoneMethodList = ( { loaded, methods, translate } ) => {
	const renderMethod = ( method, index ) => (
		<div key={ index }>
			{ method.title }
			{ getMethodSummary( method ) }
			<Button compact>{ translate( 'Edit' ) }</Button>
		</div>
	);

	const renderContent = () => {
		if ( ! loaded ) {
			return (
				<div className="shipping-zone__loading-spinner">
					<Spinner size={ 24 } />
				</div>
			);
		}

		return (
			<div>
				{ methods.map( renderMethod ) }
				<Button compact>{ translate( 'Add method' ) }</Button>
			</div>
		);
	};

	return (
		<div>
			<ExtendedHeader
				label={ translate( 'Shipping methods' ) }
				description={ translate( 'Any customers that reside in the locations' +
					' defined above will have access to these shipping methods' ) } />
			<Card>
				{ renderContent() }
			</Card>
		</div>
	);
};

export default connect(
	( state ) => ( {
		methods: getCurrentlyEditingShippingZoneMethods( state )
	} )
)( localize( ShippingZoneMethodList ) );
