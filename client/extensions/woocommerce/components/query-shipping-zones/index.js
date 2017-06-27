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
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import { areShippingZonesLoaded } from 'woocommerce/state/sites/shipping-zones/selectors';
import { areShippingMethodsLoaded } from 'woocommerce/state/sites/shipping-methods/selectors';
import { areSettingsGeneralLoaded } from 'woocommerce/state/sites/settings/general/selectors';

class QueryShippingZones extends Component {
	componentWillMount() {
		const { siteId, loaded, actions } = this.props;

		if ( siteId && ! loaded ) {
			actions.fetchShippingZones( siteId );
			actions.fetchShippingMethods( siteId );
			actions.fetchSettingsGeneral( siteId );
		}
	}

	componentWillReceiveProps( { siteId } ) {
		const { actions } = this.props;

		//site ID changed, fetch new zones
		if ( siteId !== this.props.siteId ) {
			actions.fetchShippingZones( siteId );
			actions.fetchShippingMethods( siteId );
			actions.fetchSettingsGeneral( siteId );
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
		areShippingZonesLoaded( state );
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
				fetchShippingMethods,
			}, dispatch
		)
	} ) )( QueryShippingZones );
