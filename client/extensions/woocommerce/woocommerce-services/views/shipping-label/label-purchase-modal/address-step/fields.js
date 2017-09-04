/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
import getFormErrors from '../../../state/selectors/errors';
import {
	selectNormalizedAddress,
	confirmAddressSuggestion,
	editAddress,
	updateAddressValue,
	submitAddressForNormalization,
} from '../../../state/actions';

const AddressFields = ( props ) => {
	const {
		values,
		isNormalized,
		normalized,
		selectNormalized,
		normalizationInProgress,
		allowChangeCountry,
		group,
		storeOptions,
		errors,
	} = props;

	if ( isNormalized && normalized && ! _.isEqual( normalized, values ) ) {
		const selectNormalizedAddressHandler = ( select ) => props.selectNormalizedAddress( group, select );
		const confirmAddressSuggestionHandler = () => props.confirmAddressSuggestion( group );
		const editAddressHandler = () => props.editAddress( group );
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

	const fieldErrors = _.isObject( errors ) ? errors : {};
	const getId = ( fieldName ) => group + '_' + fieldName;
	const getValue = ( fieldName ) => values[ fieldName ] || '';
	const updateValue = ( fieldName ) => ( newValue ) => props.updateAddressValue( group, fieldName, newValue );
	const getPhoneNumber = ( value ) => getPlainPhoneNumber( value, getValue( 'country' ) );
	const updatePhoneValue = ( value ) => props.updateAddressValue( group, 'phone', getPhoneNumber( value ) );
	const submitAddressForNormalizationHandler = () => props.submitAddressForNormalization( group );

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
				onClick={ submitAddressForNormalizationHandler } >
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
	storeOptions: PropTypes.object.isRequired,
	errors: PropTypes.oneOfType( [
		PropTypes.object,
		PropTypes.bool,
	] ).isRequired,
	group: PropTypes.string.isRequired,
};

const mapStateToProps = ( state, ownProps ) => {
	const loaded = state.shippingLabel.loaded;
	const storeOptions = loaded ? state.shippingLabel.storeOptions : {};
	return {
		...state.shippingLabel.form[ ownProps.group ],
		errors: loaded && getFormErrors( state, storeOptions )[ ownProps.group ],
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

export default connect( mapStateToProps, mapDispatchToProps )( AddressFields );
