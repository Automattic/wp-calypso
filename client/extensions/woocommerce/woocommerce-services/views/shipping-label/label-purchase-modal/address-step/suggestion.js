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
import FormButton from 'components/forms/form-button';
import Notice from 'components/notice';
import AddressSummary from './summary';

const RadioButton = ( props ) => {
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
	countryNames,
	translate,
} ) => {
	const onToggleSelectNormalizedAddress = ( value ) => () => selectNormalizedAddress( value );
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
					<AddressSummary values={ values } countryNames={ countryNames } />
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
						countryNames={ countryNames }
					/>
				</RadioButton>
			</div>

			<div className="address-step__actions">
				<FormButton type="button" onClick={ confirmAddressSuggestion }>
					{ translate( 'Use selected address' ) }
				</FormButton>
				<FormButton type="button" onClick={ editAddress } borderless>
					{ translate( 'Edit address' ) }
				</FormButton>
			</div>
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
	countryNames: PropTypes.object.isRequired,
};

export default localize( AddressSuggestion );
