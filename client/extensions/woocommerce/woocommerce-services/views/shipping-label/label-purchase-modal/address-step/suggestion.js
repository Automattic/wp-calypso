/** @format */

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
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import Notice from 'components/notice';
import AddressSummary from './summary';
import StepConfirmationButton from '../step-confirmation-button';

const RadioButton = props => {
	return (
		<FormLabel
			className={ classNames( 'address-step__suggestion', { 'is-selected': props.checked } ) }
		>
			<FormRadio { ...omit( props, 'children' ) } />
			{ props.children }
		</FormLabel>
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
	const onToggleSelectNormalizedAddress = value => () => selectNormalizedAddress( value );
	const errorClass = 'error-notice';
	return (
		<div>
			<Notice className={ errorClass } status="is-info" showDismiss={ false }>
				{ translate(
					'We have slightly modified the address entered. ' +
						'If correct, please use the suggested address to ensure accurate delivery.'
				) }
			</Notice>
			<div className="address-step__suggestion-container">
				<RadioButton
					checked={ ! selectNormalized }
					onChange={ onToggleSelectNormalizedAddress( false ) }
				>
					<span className="address-step__suggestion-title">{ translate( 'Address entered' ) }</span>
					<AddressSummary values={ values } countriesData={ countriesData } />
					<Button borderless className="address-step__suggestion-edit" onClick={ editAddress }>
						{ translate( 'Edit address' ) }
					</Button>
				</RadioButton>
				<RadioButton
					checked={ selectNormalized }
					onChange={ onToggleSelectNormalizedAddress( true ) }
				>
					<span className="address-step__suggestion-title">
						{ translate( 'Suggested address' ) }
					</span>
					<AddressSummary
						values={ normalized }
						originalValues={ values }
						countriesData={ countriesData }
					/>
				</RadioButton>
			</div>
			<StepConfirmationButton onClick={ confirmAddressSuggestion }>
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
