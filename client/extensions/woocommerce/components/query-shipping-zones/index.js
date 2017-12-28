/** @format */

/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { fetchShippingMethods } from 'client/extensions/woocommerce/state/sites/shipping-methods/actions';
import { fetchShippingZones } from 'client/extensions/woocommerce/state/sites/shipping-zones/actions';
import { fetchLocations } from 'client/extensions/woocommerce/state/sites/locations/actions';
import { areShippingZonesLoaded } from 'client/extensions/woocommerce/state/sites/shipping-zones/selectors';
import { areShippingMethodsLoaded } from 'client/extensions/woocommerce/state/sites/shipping-methods/selectors';
import { areLocationsLoaded } from 'client/extensions/woocommerce/state/sites/locations/selectors';

class QueryShippingZones extends Component {
	fetch( siteId ) {
		this.props.actions.fetchShippingZones( siteId );
		this.props.actions.fetchShippingMethods( siteId );
		this.props.actions.fetchLocations( siteId );
	}

	componentWillMount() {
		const { siteId, loaded } = this.props;

		if ( siteId && ! loaded ) {
			this.fetch( siteId );
		}
	}

	componentWillReceiveProps( { siteId, loaded } ) {
		//site ID changed, fetch new settings
		if ( siteId !== this.props.siteId && ! loaded ) {
			this.fetch( siteId );
		}
	}

	render() {
		return null;
	}
}

QueryShippingZones.propTypes = {
	siteId: PropTypes.number,
};

export const areShippingZonesFullyLoaded = state => {
	return (
		areShippingMethodsLoaded( state ) &&
		areShippingZonesLoaded( state ) &&
		areLocationsLoaded( state )
	);
};

export default connect(
	state => ( {
		loaded: areShippingZonesFullyLoaded( state ),
	} ),
	dispatch => ( {
		actions: bindActionCreators(
			{
				fetchShippingZones,
				fetchLocations,
				fetchShippingMethods,
			},
			dispatch
		),
	} )
)( QueryShippingZones );
