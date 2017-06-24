/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { fetchShippingMethods } from 'woocommerce/state/sites/shipping-methods/actions';
import { fetchShippingZones } from 'woocommerce/state/sites/shipping-zones/actions';
import { fetchLocations } from 'woocommerce/state/sites/locations/actions';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import { areShippingZonesLoaded } from 'woocommerce/state/sites/shipping-zones/selectors';
import { areShippingMethodsLoaded } from 'woocommerce/state/sites/shipping-methods/selectors';
import { areLocationsLoaded } from 'woocommerce/state/sites/locations/selectors';
import { areSettingsGeneralLoaded } from 'woocommerce/state/sites/settings/general/selectors';

class QueryShippingZones extends Component {
	fetch( siteId ) {
		this.props.actions.fetchShippingZones( siteId );
		this.props.actions.fetchShippingMethods( siteId );
		this.props.actions.fetchSettingsGeneral( siteId );
		this.props.actions.fetchLocations( siteId );
	}

	componentWillMount() {
		const { siteId, loaded } = this.props;

		if ( siteId && ! loaded ) {
			this.fetch( siteId );
		}
	}

	componentWillReceiveProps( { siteId } ) {
		//site ID changed, fetch new zones
		if ( siteId !== this.props.siteId ) {
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
	return areSettingsGeneralLoaded( state ) &&
		areShippingMethodsLoaded( state ) &&
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
				fetchSettingsGeneral,
				fetchShippingZones,
				fetchLocations,
				fetchShippingMethods,
			}, dispatch
		)
	} ) )( QueryShippingZones );
