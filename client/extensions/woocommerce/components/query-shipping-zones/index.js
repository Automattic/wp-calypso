/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { fetchLocations } from 'woocommerce/state/sites/locations/actions';
import { areLocationsLoaded } from 'woocommerce/state/sites/locations/selectors';
import { fetchShippingMethods } from 'woocommerce/state/sites/shipping-methods/actions';
import { areShippingMethodsLoaded } from 'woocommerce/state/sites/shipping-methods/selectors';
import { fetchShippingZones } from 'woocommerce/state/sites/shipping-zones/actions';
import { areShippingZonesLoaded } from 'woocommerce/state/sites/shipping-zones/selectors';

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

export const areShippingZonesFullyLoaded = ( state ) => {
	return areShippingMethodsLoaded( state ) &&
		areShippingZonesLoaded( state ) &&
		areLocationsLoaded( state );
};

export default connect(
	( state ) => ( {
		loaded: areShippingZonesFullyLoaded( state ),
	} ),
	( dispatch ) => ( {
		actions: bindActionCreators(
			{
				fetchShippingZones,
				fetchLocations,
				fetchShippingMethods,
			}, dispatch
		)
	} ) )( QueryShippingZones );
