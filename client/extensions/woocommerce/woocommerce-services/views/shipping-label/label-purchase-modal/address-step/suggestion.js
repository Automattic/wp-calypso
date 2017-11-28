/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import Notice from 'components/notice';
import StepConfirmationButton from '../step-confirmation-button';

const RadioButton = ( props ) => {
	return (
		<FormLabel className={ classNames( 'address-step__suggestion', { 'is-selected': props.checked } ) }>
			<FormRadio { ...omit( props, 'children' ) } />
			{ props.children }
		</FormLabel>
	);
};

const AddressSummary = ( { values, originalValues, countriesData, expandStateName = false } ) => {
	originalValues = originalValues || {};
	const { state, country } = values;

	let stateStr = '';
	if ( state ) {
		const statesMap = ( expandStateName && ( countriesData[ country ] || {} ).states ) || {};
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
			<p>{ getValue( 'city' ) }, { getValue( 'state' ) }&nbsp; { getValue( 'postcode' ) }</p>
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
		translate,
	} ) => {
	const onToggleSelectNormalizedAddress = ( value ) => () => selectNormalizedAddress( value );
	const errorClass = 'error-notice';
	return (
		<div>
			<Notice
				className={ errorClass }
				status="is-info"
				showDismiss={ false } >
				{ translate( 'We have slightly modified the address entered. ' +
					'If correct, please use the suggested address to ensure accurate delivery.' ) }
			</Notice>
			<div className="address-step__suggestion-container">
				<RadioButton
					checked={ ! selectNormalized }
					onChange={ onToggleSelectNormalizedAddress( false ) } >
					<span className="address-step__suggestion-title">{ translate( 'Address entered' ) }</span>
					<AddressSummary
						values={ values }
						countriesData={ countriesData } />
					<a className="address-step__suggestion-edit" onClick={ editAddress } >
						{ translate( 'Edit address' ) }
					</a>
				</RadioButton>
				<RadioButton
					checked={ selectNormalized }
					onChange={ onToggleSelectNormalizedAddress( true ) } >
					<span className="address-step__suggestion-title">{ translate( 'Suggested address' ) }</span>
					<AddressSummary
						values={ normalized }
						originalValues={ values }
						countriesData={ countriesData } />
				</RadioButton>
			</div>
			<StepConfirmationButton onClick={ confirmAddressSuggestion } >
				{ translate( 'Use selected address' ) }
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

export default localize( AddressSuggestion );
