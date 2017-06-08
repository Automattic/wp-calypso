/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Spinner from 'components/spinner';
import { areShippingZoneMethodsLoaded } from 'woocommerce/state/sites/shipping-zone-methods/selectors';
import { getShippingZoneMethods } from 'woocommerce/state/ui/shipping/zones/methods/selectors';
import { openShippingZoneForEdit } from 'woocommerce/state/ui/shipping/zones/actions';

const ShippingZone = ( { translate, id, name, methods, methodsLoaded, siteId, actions } ) => {
	const loaded = methodsLoaded || ! isNumber( id );

	const renderMethod = ( methodKey ) => {
		const method = methods[ methodKey ];

		return (
			<div key={ methodKey } className="shipping__zones-row-method">
				<p className="shipping__zones-row-method-name">{ method.title }</p>
				{ /*<p className="shipping__zones-row-method-description">{ method.method_description }</p>*/ }
			</div>
		);
	};

	const onEditClick = () => ( actions.openShippingZoneForEdit( siteId, id ) );

	const renderDetails = () => {
		if ( ! loaded ) {
			return (
				<div className="shipping__loading-spinner">
					<Spinner size={ 24 } />
				</div>
			);
		}

		return [
			(
			<div className="shipping__zones-row-methods" key={ 0 }>
				{ Object.keys( methods ).map( renderMethod ) }
			</div>
			),
			(
			<div className="shipping__zones-row-actions" key={ 1 }>
				<Button compact onClick={ onEditClick }>{ translate( 'Edit' ) }</Button>
			</div>
			)
		];
	};

	const icon = 0 === id ? 'globe' : 'location';

	return (
		<div className="shipping__zones-row">
			<div className="shipping__zones-row-icon">
				<Gridicon icon={ icon } size={ 36 } />
			</div>
			<div className="shipping__zones-row-location">
				<p className="shipping__zones-row-location-name">{ name }</p>
				{ /*<p className="shipping__zones-row-location-description">{ locationDescription }</p>*/ }
			</div>
			{ renderDetails() }
		</div>
	);
};

ShippingZone.propTypes = {
	siteId: PropTypes.number,
	id: PropTypes.oneOfType( [ PropTypes.number, PropTypes.object ] ),
	name: PropTypes.string
};

export default connect(
	( state, ownProps ) => ( {
		methods: getShippingZoneMethods( state, ownProps.id ),
		methodsLoaded: areShippingZoneMethodsLoaded( state, ownProps.id )
	} ),
	( dispatch ) => ( {
		actions: bindActionCreators(
			{
				openShippingZoneForEdit
			}, dispatch
		)
	} )
)( localize( ShippingZone ) );
