/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { isEqual, isObject, size } from 'lodash';

/**
 * Internal dependencies
 */
import TextField from 'woocommerce/woocommerce-services/components/text-field';
import Notice from 'components/notice';
import StepConfirmationButton from '../step-confirmation-button';
import CountryDropdown from 'woocommerce/woocommerce-services/components/country-dropdown';
import StateDropdown from 'woocommerce/woocommerce-services/components/state-dropdown';
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';
import AddressSuggestion from './suggestion';
import { decodeEntities } from 'lib/formatting';
import {
	selectNormalizedAddress,
	confirmAddressSuggestion,
	editAddress,
	updateAddressValue,
	submitAddressForNormalization,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const AddressFields = ( props ) => {
	const {
		siteId,
		orderId,
		values,
		isNormalized,
		normalized,
		selectNormalized,
		normalizationInProgress,
		allowChangeCountry,
		group,
		storeOptions,
		errors,
		translate,
	} = props;

	if ( isNormalized && normalized && ! isEqual( normalized, values ) ) {
		const selectNormalizedAddressHandler = ( select ) => props.selectNormalizedAddress( orderId, siteId, group, select );
		const confirmAddressSuggestionHandler = () => props.confirmAddressSuggestion( orderId, siteId, group );
		const editAddressHandler = () => props.editAddress( orderId, siteId, group );
		return (
			<AddressSuggestion
				values={ values }
				normalized={ normalized }
				selectNormalized={ selectNormalized }
				selectNormalizedAddress={ selectNormalizedAddressHandler }
				confirmAddressSuggestion={ confirmAddressSuggestionHandler }
				editAddress={ editAddressHandler }
				countriesData={ storeOptions.countriesData } />
		);
	}

	const fieldErrors = isObject( errors ) ? errors : {};
	const generalErrorOnly = fieldErrors.general && size( fieldErrors ) === 1;
	const getId = ( fieldName ) => group + '_' + fieldName;
	const getValue = ( fieldName ) => values[ fieldName ] ? decodeEntities( values[ fieldName ] ) : '';
	const updateValue = ( fieldName ) => ( newValue ) => props.updateAddressValue( orderId, siteId, group, fieldName, newValue );
	const submitAddressForNormalizationHandler = () => props.submitAddressForNormalization( orderId, siteId, group );

	return (
		<div>
			<TextField
				id={ getId( 'name' ) }
				title={ translate( 'Name' ) }
				value={ getValue( 'name' ) }
				updateValue={ updateValue( 'name' ) }
				error={ fieldErrors.name } />
			<div className="address-step__company-phone">
				<TextField
					id={ getId( 'company' ) }
					title={ translate( 'Company' ) }
					value={ getValue( 'company' ) }
					updateValue={ updateValue( 'company' ) }
					className="address-step__company"
					error={ fieldErrors.company } />
				<TextField
					id={ getId( 'phone' ) }
					title={ translate( 'Phone' ) }
					value={ getValue( 'phone' ) }
					updateValue={ updateValue( 'phone' ) }
					className="address-step__phone" />
			</div>
			{ generalErrorOnly && <Notice status="is-error" showDismiss={ false }>
				{ translate( '%(message)s. Please modify the address and try again.', { args: { message: fieldErrors.general } } ) }
			</Notice> }
			<TextField
				id={ getId( 'address' ) }
				title={ translate( 'Address' ) }
				value={ getValue( 'address' ) }
				updateValue={ updateValue( 'address' ) }
				className="address-step__address-1"
				error={ fieldErrors.address || generalErrorOnly } />
			<TextField
				id={ getId( 'address_2' ) }
				value={ getValue( 'address_2' ) }
				updateValue={ updateValue( 'address_2' ) }
				error={ fieldErrors.address_2 || generalErrorOnly } />
			<div className="address-step__city-state-postal-code">
				<TextField
					id={ getId( 'city' ) }
					title={ translate( 'City' ) }
					value={ getValue( 'city' ) }
					updateValue={ updateValue( 'city' ) }
					className="address-step__city"
					error={ fieldErrors.city || generalErrorOnly } />
				<StateDropdown
					id={ getId( 'state' ) }
					title={ translate( 'State' ) }
					value={ getValue( 'state' ) }
					countryCode={ getValue( 'country' ) }
					countriesData={ storeOptions.countriesData }
					updateValue={ updateValue( 'state' ) }
					className="address-step__state"
					error={ fieldErrors.state || generalErrorOnly } />
				<TextField
					id={ getId( 'postcode' ) }
					title={ translate( 'Postal code' ) }
					value={ getValue( 'postcode' ) }
					updateValue={ updateValue( 'postcode' ) }
					className="address-step__postal-code"
					error={ fieldErrors.postcode || generalErrorOnly } />
			</div>
			<CountryDropdown
				id={ getId( 'country' ) }
				title={ translate( 'Country' ) }
				value={ getValue( 'country' ) }
				disabled={ ! allowChangeCountry }
				countriesData={ storeOptions.countriesData }
				updateValue={ updateValue( 'country' ) }
				error={ fieldErrors.country || generalErrorOnly } />
			<StepConfirmationButton
				disabled={ hasNonEmptyLeaves( errors ) || normalizationInProgress }
				onClick={ submitAddressForNormalizationHandler } >
				{ translate( 'Validate address' ) }
			</StepConfirmationButton>
		</div>
	);
};

AddressFields.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	values: PropTypes.object.isRequired,
	isNormalized: PropTypes.bool.isRequired,
	normalized: PropTypes.object,
	selectNormalized: PropTypes.bool.isRequired,
	allowChangeCountry: PropTypes.bool.isRequired,
	storeOptions: PropTypes.object.isRequired,
	errors: PropTypes.oneOfType( [
		PropTypes.object,
		PropTypes.bool,
	] ).isRequired,
	group: PropTypes.string.isRequired,
};

const mapStateToProps = ( state, { group, orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const storeOptions = loaded ? shippingLabel.storeOptions : {};
	return {
		...shippingLabel.form[ group ],
		errors: loaded && getFormErrors( state, orderId, siteId )[ group ],
		storeOptions,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( {
		selectNormalizedAddress,
		confirmAddressSuggestion,
		editAddress,
		updateAddressValue,
		submitAddressForNormalization,
	}, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( AddressFields ) );
