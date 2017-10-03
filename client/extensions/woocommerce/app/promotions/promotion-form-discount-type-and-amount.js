/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { find, noop } from 'lodash';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import PriceInput from 'woocommerce/components/price-input';

function renderPercentInput( amount, onAmountChange ) {
	// TODO: Consider making a FormPercentInput general-purpose component?
	return (
		<FormTextInputWithAffixes
			type="number"
			min="0"
			max="100"
			suffix="%"
			placeholder="0"
			value={ amount }
			onChange={ onAmountChange }
		/>
	);
}

function renderPriceInput( amount, onAmountChange, currency ) {
	return (
		<PriceInput
			currency={ currency }
			value={ amount }
			onChange={ onAmountChange }
		/>
	);
}

const inputRenderers = {
	percent: renderPercentInput,
	price: renderPriceInput,
};

const inputValidators = {
	percent: ( amount ) => ( amount >= 0 && amount <= 100 ),
	price: ( amount ) => ( amount >= 0 ),
};

function renderDiscountTypeOption( { value, text } ) {
	return ( <option key={ value } value={ value }>{ text }</option> );
}

const PromotionFormDiscountTypeAndAmount = ( {
	discountTypesAvailable,
	discountTypeValue,
	amount,
	currency,
	onDiscountTypeSelect,
	onAmountChange,
	translate,
} ) => {
	const discountType = find( discountTypesAvailable, ( d ) => ( discountTypeValue === d.value ) );
	const type = discountType && discountType.type;
	const isAmountValid = inputValidators[ type ] || noop;
	const renderAmount = inputRenderers[ type ] || noop;

	const discountTypeSelect = ( e ) => {
		onDiscountTypeSelect( e.target.value );
	};

	const amountChange = ( e ) => {
		const value = e.target.value;
		if ( isAmountValid( value ) ) {
			onAmountChange( value );
		}
	};

	return (
		<div className="promotions__promotion-form-discount-type-and-amount">
			<FormFieldset className="promotions__promotion-form-discount-type">
				<FormLabel>{ translate( 'Discount type' ) }</FormLabel>
				<FormSelect value={ discountTypeValue } onChange={ discountTypeSelect } >
					{ discountTypesAvailable.map( renderDiscountTypeOption ) }
				</FormSelect>
			</FormFieldset>
			<FormFieldset className="promotions__promotion-form-amount">
				<FormLabel>{ translate( 'Amount' ) }</FormLabel>
				{ renderAmount && renderAmount( amount, amountChange, currency ) }
			</FormFieldset>
		</div>
	);
};

PromotionFormDiscountTypeAndAmount.PropTypes = {
	discountTypesAvailable: PropTypes.object,
	discountTypeValue: PropTypes.string,
	amount: PropTypes.number,
	currency: PropTypes.string,
	onDiscountTypeSelect: PropTypes.func,
	onAmountChange: PropTypes.func,
};

export default localize( PromotionFormDiscountTypeAndAmount );

