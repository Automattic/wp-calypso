/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import TextField from 'woocommerce/woocommerce-services/components/text-field';
import {
	setCustomsItemDescription,
	setCustomsItemTariffNumber,
	setCustomsItemWeight,
	setCustomsItemValue,
	setCustomsItemOriginCountry,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import { getAllCountryNames } from 'woocommerce/state/sites/data/locations/selectors';
import Dropdown from 'woocommerce/woocommerce-services/components/dropdown';
import WeightField from 'woocommerce/woocommerce-services/components/weight-field';
import PriceField from 'woocommerce/woocommerce-services/components/price-field';
import { TariffCodeTitle, OriginCountryTitle } from './item-row-header';

const ItemRow = ( props ) => {
	const {
		errors,
		packageId,
		productId,
		translate,
		description,
		defaultDescription,
		weight,
		value,
		tariffNumber,
		originCountry,
		countryNames,
		weightUnit,
	} = props;

	return (
		<div className="customs-step__item-row">
			<TextField
				id={ packageId + '_' + productId + '_description' }
				className="customs-step__item-description-column"
				title={ translate( 'Description' ) }
				value={ description }
				placeholder={ defaultDescription }
				updateValue={ props.setCustomsItemDescription }
				error={ errors.description }
			/>
			<TextField
				id={ packageId + '_' + productId + '_tariffNumber' }
				className="customs-step__item-code-column"
				title={ <TariffCodeTitle /> }
				placeholder={ translate( 'Optional' ) }
				value={ tariffNumber }
				updateValue={ props.setCustomsItemTariffNumber }
				error={ errors.tariffNumber }
			/>
			<WeightField
				weightUnit={ weightUnit }
				id={ packageId + '_' + productId + '_weight' }
				className="customs-step__item-weight-column"
				title={ translate( 'Weight (per unit)' ) }
				value={ weight }
				updateValue={ props.setCustomsItemWeight }
				error={ errors.weight }
			/>
			<PriceField
				id={ packageId + '_' + productId + '_value' }
				className="customs-step__item-value-column"
				title={ translate( 'Value (per unit)' ) }
				value={ value }
				updateValue={ props.setCustomsItemValue }
				error={ errors.value }
			/>
			<Dropdown
				id={ packageId + '_' + productId + '_originCountry' }
				className="customs-step__item-country-column"
				title={ <OriginCountryTitle /> }
				value={ originCountry }
				updateValue={ props.setCustomsItemOriginCountry }
				valuesMap={ countryNames }
			/>
		</div>
	);
};

ItemRow.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	packageId: PropTypes.string.isRequired,
	productId: PropTypes.number.isRequired,
	description: PropTypes.string.isRequired,
	defaultDescription: PropTypes.string.isRequired,
	tariffNumber: PropTypes.string.isRequired,
	weight: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
	value: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
	originCountry: PropTypes.string.isRequired,
	errors: PropTypes.object,
	countryNames: PropTypes.object.isRequired,
	setCustomsItemDescription: PropTypes.func.isRequired,
	setCustomsItemTariffNumber: PropTypes.func.isRequired,
	setCustomsItemWeight: PropTypes.func.isRequired,
	setCustomsItemValue: PropTypes.func.isRequired,
	setCustomsItemOriginCountry: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId, productId } ) => {
	const isShippingLabelLoaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const {
		description,
		defaultDescription,
		tariffNumber,
		weight,
		value,
		originCountry,
	} = shippingLabel.form.customs.items[ productId ];

	return {
		description,
		defaultDescription,
		tariffNumber: tariffNumber || '',
		weight,
		value,
		originCountry,
		errors: isShippingLabelLoaded
			? getFormErrors( state, orderId, siteId ).customs.items[ productId ]
			: {},
		countryNames: getAllCountryNames( state, siteId ),
		weightUnit: shippingLabel.storeOptions.weight_unit,
	};
};

const mapDispatchToProps = ( dispatch, { orderId, siteId, productId } ) => ( {
	setCustomsItemDescription: ( value ) =>
		dispatch( setCustomsItemDescription( orderId, siteId, productId, value ) ),
	setCustomsItemTariffNumber: ( value ) =>
		dispatch( setCustomsItemTariffNumber( orderId, siteId, productId, value ) ),
	setCustomsItemWeight: ( value ) =>
		dispatch( setCustomsItemWeight( orderId, siteId, productId, value ) ),
	setCustomsItemValue: ( value ) =>
		dispatch( setCustomsItemValue( orderId, siteId, productId, value ) ),
	setCustomsItemOriginCountry: ( value ) =>
		dispatch( setCustomsItemOriginCountry( orderId, siteId, productId, value ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( ItemRow ) );
