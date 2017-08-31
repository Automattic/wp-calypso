/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';
import _ from 'lodash';

/**
 * Internal dependencies
 */
import TextField from 'components/text-field';
import StepConfirmationButton from '../step-confirmation-button';
import CountryDropdown from 'components/country-dropdown';
import StateDropdown from 'components/state-dropdown';
import { hasNonEmptyLeaves } from 'lib/utils/tree';
import AddressSuggestion from './suggestion';
import { getPlainPhoneNumber, formatPhoneForDisplay } from 'lib/utils/phone-format';

const AddressFields = ( {
		values,
		isNormalized,
		normalized,
		selectNormalized,
		normalizationInProgress,
		allowChangeCountry,
		group,
		labelActions,
		storeOptions,
		errors,
	} ) => {
	if ( isNormalized && normalized && ! _.isEqual( normalized, values ) ) {
		const selectNormalizedAddress = ( select ) => labelActions.selectNormalizedAddress( group, select );
		const confirmAddressSuggestion = () => labelActions.confirmAddressSuggestion( group );
		const editAddress = () => labelActions.editAddress( group );
		return (
			<AddressSuggestion
				values={ values }
				normalized={ normalized }
				selectNormalized={ selectNormalized }
				selectNormalizedAddress={ selectNormalizedAddress }
				confirmAddressSuggestion={ confirmAddressSuggestion }
				editAddress={ editAddress }
				countriesData={ storeOptions.countriesData } />
		);
	}

	const fieldErrors = _.isObject( errors ) ? errors : {};
	const getId = ( fieldName ) => group + '_' + fieldName;
	const getValue = ( fieldName ) => values[ fieldName ] || '';
	const updateValue = ( fieldName ) => ( newValue ) => labelActions.updateAddressValue( group, fieldName, newValue );
	const getPhoneNumber = ( value ) => getPlainPhoneNumber( value, getValue( 'country' ) );
	const updatePhoneValue = ( value ) => labelActions.updateAddressValue( group, 'phone', getPhoneNumber( value ) );
	const submitAddressForNormalization = () => labelActions.submitAddressForNormalization( group );

	return (
		<div>
			<TextField
				id={ getId( 'name' ) }
				title={ __( 'Name' ) }
				value={ getValue( 'name' ) }
				updateValue={ updateValue( 'name' ) }
				error={ fieldErrors.name } />
			<div className="address-step__company-phone">
				<TextField
					id={ getId( 'company' ) }
					title={ __( 'Company' ) }
					value={ getValue( 'company' ) }
					updateValue={ updateValue( 'company' ) }
					className="address-step__company"
					error={ fieldErrors.company } />
				<TextField
					id={ getId( 'phone' ) }
					title={ __( 'Phone' ) }
					value={ formatPhoneForDisplay( getValue( 'phone' ), getValue( 'country' ) ) }
					updateValue={ updatePhoneValue }
					className="address-step__phone"
					error={ fieldErrors.phone } />
			</div>
			<TextField
				id={ getId( 'address' ) }
				title={ __( 'Address' ) }
				value={ getValue( 'address' ) }
				updateValue={ updateValue( 'address' ) }
				className="address-step__address-1"
				error={ fieldErrors.address } />
			<TextField
				id={ getId( 'address_2' ) }
				value={ getValue( 'address_2' ) }
				updateValue={ updateValue( 'address_2' ) }
				error={ fieldErrors.address_2 } />
			<div className="address-step__city-state-postal-code">
				<TextField
					id={ getId( 'city' ) }
					title={ __( 'City' ) }
					value={ getValue( 'city' ) }
					updateValue={ updateValue( 'city' ) }
					className="address-step__city"
					error={ fieldErrors.city } />
				<StateDropdown
					id={ getId( 'state' ) }
					title={ __( 'State' ) }
					value={ getValue( 'state' ) }
					countryCode={ getValue( 'country' ) }
					countriesData={ storeOptions.countriesData }
					updateValue={ updateValue( 'state' ) }
					className="address-step__state"
					error={ fieldErrors.state } />
				<TextField
					id={ getId( 'postcode' ) }
					title={ __( 'Postal code' ) }
					value={ getValue( 'postcode' ) }
					updateValue={ updateValue( 'postcode' ) }
					className="address-step__postal-code"
					error={ fieldErrors.postcode } />
			</div>
			<CountryDropdown
				id={ getId( 'country' ) }
				title={ __( 'Country' ) }
				value={ getValue( 'country' ) }
				disabled={ ! allowChangeCountry }
				countriesData={ storeOptions.countriesData }
				updateValue={ updateValue( 'country' ) }
				error={ fieldErrors.country } />
			<StepConfirmationButton
				disabled={ hasNonEmptyLeaves( errors ) || normalizationInProgress }
				onClick={ submitAddressForNormalization } >
					{ __( 'Use this address' ) }
			</StepConfirmationButton>
		</div>
	);
};

AddressFields.propTypes = {
	values: PropTypes.object.isRequired,
	isNormalized: PropTypes.bool.isRequired,
	normalized: PropTypes.object,
	selectNormalized: PropTypes.bool.isRequired,
	allowChangeCountry: PropTypes.bool.isRequired,
	labelActions: PropTypes.object.isRequired,
	storeOptions: PropTypes.object.isRequired,
	errors: PropTypes.oneOfType( [
		PropTypes.object,
		PropTypes.bool,
	] ).isRequired,
};

export default AddressFields;
