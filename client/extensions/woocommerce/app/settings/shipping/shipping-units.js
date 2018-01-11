/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import QuerySettingsProducts from 'woocommerce/components/query-settings-products';
import {
	areSettingsProductsLoaded,
	getWeightUnitSetting,
	getDimensionsUnitSetting,
} from 'woocommerce/state/sites/settings/products/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';

const ShippingUnits = ( { siteId, loaded, weight, dimensions, translate } ) => {
	const renderOption = option => {
		return (
			<option key={ option } value={ option }>
				{ option }
			</option>
		);
	};

	const onChange = something => {
		//console.log( something );
		something;
	};

	return (
		<div className="shipping__units">
			<QuerySettingsProducts siteId={ siteId } />
			<div className="shipping__weight-select">
				<FormLabel>{ translate( 'Weight unit' ) }</FormLabel>
				<FormSelect onChange={ onChange } value={ weight.value } disabled={ ! loaded }>
					{ loaded && map( weight.options, renderOption ) }
				</FormSelect>
			</div>
			<div className="shipping__weight-select">
				<FormLabel>{ translate( 'Dimension unit' ) }</FormLabel>
				<FormSelect onChange={ onChange } value={ dimensions.value } disabled={ ! loaded }>
					{ loaded && map( dimensions.options, renderOption ) }
				</FormSelect>
			</div>
		</div>
	);
};

ShippingUnits.propTypes = {
	siteId: PropTypes.number,
};

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = site && site.ID;
	return {
		siteId,
		loaded: areSettingsProductsLoaded( state, siteId ),
		weight: getWeightUnitSetting( state, siteId ),
		dimensions: getDimensionsUnitSetting( state, siteId ),
	};
}

export default connect( mapStateToProps )( localize( ShippingUnits ) );
