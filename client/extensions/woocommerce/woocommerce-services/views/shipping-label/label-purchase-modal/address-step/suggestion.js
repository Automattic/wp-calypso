/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';
import _ from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import ErrorNotice from 'components/error-notice';
import StepConfirmationButton from '../step-confirmation-button';

const RadioButton = ( props ) => {
	return (
		<FormLabel className={ classNames( 'address-step__suggestion', { 'is-selected': props.checked } ) }>
			<FormRadio { ..._.omit( props, 'children' ) } />
			{ props.children }
		</FormLabel>
	);
};

const AddressSummary = ( { values, originalValues, countriesData } ) => {
	originalValues = originalValues || {};
	const { state, country } = values;

	let stateStr = '';
	if ( state ) {
		const statesMap = ( countriesData[ country ] || {} ).states || {};
		stateStr = statesMap[ state ] || state;
	}
	const countryStr = countriesData[ country ].name;

	const getValue = ( fieldName ) => {
		const rawValue = values[ fieldName ];
		if ( ! rawValue ) {
			return '';
		}
		const originalValue = originalValues[ fieldName ];
		const highlight = originalValue && originalValue.toLowerCase() !== rawValue.toLowerCase();
		let value = rawValue;
		switch ( fieldName ) {
			case 'state':
				value = stateStr;
				break;
			case 'country':
				value = countryStr;
		}
		return <span className={ highlight ? 'highlight' : '' }>{ value }</span>;
	};

	return (
		<div className="address-step__suggestion-summary">
			<p>{ getValue( 'name' ) }</p>
			<p>{ getValue( 'address' ) } { getValue( 'address_2' ) }</p>
			<p>{ getValue( 'city' ) }, { getValue( 'postcode' ) } { getValue( 'state' ) }</p>
			<p>{ getValue( 'country' ) }</p>
		</div>
	);
};

const AddressSuggestion = ( {
		values,
		normalized,
		selectNormalized,
		selectNormalizedAddress,
		editAddress,
		confirmAddressSuggestion,
		countriesData,
	} ) => {
	const onToggleSelectNormalizedAddress = ( value ) => () => selectNormalizedAddress( value );
	return (
		<div>
			<ErrorNotice isWarning>
				{ __( 'We have slightly modified the address entered. ' +
					'If correct, please use the suggested address to ensure accurate delivery.' ) }
			</ErrorNotice>
			<div className="address-step__suggestion-container">
				<RadioButton
					checked={ ! selectNormalized }
					onChange={ onToggleSelectNormalizedAddress( false ) } >
					<span className="address-step__suggestion-title">{ __( 'Address entered' ) }</span>
					<AddressSummary
						values={ values }
						countriesData={ countriesData } />
					<a className="address-step__suggestion-edit" onClick={ editAddress } >
						{ __( 'Edit address' ) }
					</a>
				</RadioButton>
				<RadioButton
					checked={ selectNormalized }
					onChange={ onToggleSelectNormalizedAddress( true ) } >
					<span className="address-step__suggestion-title">{ __( 'Suggested address' ) }</span>
					<AddressSummary
						values={ normalized }
						originalValues={ values }
						countriesData={ countriesData } />
				</RadioButton>
			</div>
			<StepConfirmationButton onClick={ confirmAddressSuggestion } >
				{ __( 'Use selected address' ) }
			</StepConfirmationButton>
		</div>
	);
};

AddressSuggestion.propTypes = {
	values: PropTypes.object.isRequired,
	normalized: PropTypes.object,
	selectNormalized: PropTypes.bool.isRequired,
	selectNormalizedAddress: PropTypes.func.isRequired,
	confirmAddressSuggestion: PropTypes.func.isRequired,
	editAddress: PropTypes.func.isRequired,
	countriesData: PropTypes.object.isRequired,
};

export default AddressSuggestion;
