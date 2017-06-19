/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getMethodSummary } from 'woocommerce/state/ui/shipping/zones/methods/utils';
import { getSelectedSite } from 'state/ui/selectors';
import { getShippingZoneMethods } from 'woocommerce/state/ui/shipping/zones/methods/selectors';

const ShippingZoneEntry = ( { translate, id, name, methods, site } ) => {
	const renderMethod = ( methodKey ) => {
		const method = methods[ methodKey ];

		return (
			<div key={ methodKey } className="shipping__zones-row-method">
				<p className="shipping__zones-row-method-name">{ method.title }</p>
				<p className="shipping__zones-row-method-description">{ getMethodSummary( method ) }</p>
			</div>
		);
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
			<div className="shipping__zones-row-methods" key={ 0 }>
				{ Object.keys( methods ).map( renderMethod ) }
			</div>
			<div className="shipping__zones-row-actions" key={ 1 }>
				<Button compact href={ getLink( `/store/settings/shipping/:site/zone/${ id }`, site ) }>{ translate( 'Edit' ) }</Button>
			</div>
		</div>
	);
};

ShippingZoneEntry.propTypes = {
	id: PropTypes.oneOfType( [ PropTypes.number, PropTypes.object ] ),
	name: PropTypes.string
};

export default connect(
	( state, ownProps ) => ( {
		site: getSelectedSite( state ),
		methods: getShippingZoneMethods( state, ownProps.id ),
	} )
)( localize( ShippingZoneEntry ) );
