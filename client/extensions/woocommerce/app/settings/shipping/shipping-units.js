/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
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
import { changeSettingsProductsSetting } from 'woocommerce/state/sites/settings/products/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';

const ShippingUnits = ( {
	siteId,
	loaded,
	weight,
	dimensions,
	translate,
	changeSetting,
	onChange,
} ) => {
	const weightLabels = ( unit ) => {
		const labels = {
			oz: translate( 'Ounces' ),
			lbs: translate( 'Pounds' ),
			kg: translate( 'Kilograms' ),
			g: translate( 'Grams' ),
		};
		return labels[ unit ] || '';
	};

	const renderWeightOption = ( option ) => {
		return (
			<option key={ option } value={ option }>
				{ `${ option } - ${ weightLabels( option ) }` }
			</option>
		);
	};

	const dimensionsLabels = ( unit ) => {
		const labels = {
			m: translate( 'Meters' ),
			cm: translate( 'Centimeters' ),
			mm: translate( 'Millimeters' ),
			in: translate( 'Inches' ),
			yd: translate( 'Yards' ),
		};
		return labels[ unit ] || '';
	};

	const renderDimensionsOption = ( option ) => {
		return (
			<option key={ option } value={ option }>
				{ `${ option } - ${ dimensionsLabels( option ) }` }
			</option>
		);
	};

	const onChangeWeight = ( e ) => {
		const setting = Object.assign( {}, weight, { value: e.target.value } );
		onChange();
		changeSetting( siteId, setting );
	};

	const onChangeDimensions = ( e ) => {
		const setting = Object.assign( {}, dimensions, { value: e.target.value } );
		onChange();
		changeSetting( siteId, setting );
	};

	return (
		<div className="shipping__units">
			<QuerySettingsProducts siteId={ siteId } />
			<div className="shipping__weight-select">
				<FormLabel>{ translate( 'Weight unit' ) }</FormLabel>
				<FormSelect onChange={ onChangeWeight } value={ weight.value } disabled={ ! loaded }>
					{ loaded && map( weight.options, renderWeightOption ) }
				</FormSelect>
			</div>
			<div className="shipping__dimension-select">
				<FormLabel>{ translate( 'Dimension unit' ) }</FormLabel>
				<FormSelect
					onChange={ onChangeDimensions }
					value={ dimensions.value }
					disabled={ ! loaded }
				>
					{ loaded && map( dimensions.options, renderDimensionsOption ) }
				</FormSelect>
			</div>
		</div>
	);
};

ShippingUnits.propTypes = {
	siteId: PropTypes.number,
	loaded: PropTypes.bool,
	weight: PropTypes.object,
	dimensions: PropTypes.object,
	onChange: PropTypes.func.isRequired,
	changeSetting: PropTypes.func.isRequired,
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
function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			changeSetting: changeSettingsProductsSetting,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ShippingUnits ) );
