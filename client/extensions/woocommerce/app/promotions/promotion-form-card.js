/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import PriceInput from 'woocommerce/components/price-input';
import promotionModels, { hasField, isRequiredField } from './promotion-models';
import PromotionFormAppliesTo from './promotion-form-applies-to';

function renderRequiredLabel( isRequired, translate ) {
	if ( ! isRequired ) {
		return null;
	}

	return (
		<span className="promotions__promotion-form-label-required">
			{ translate( 'Required' ) }
		</span>
	);
}

function renderCouponCode( siteId, model, promotion, editPromotion, translate ) {
	if ( ! hasField( model, 'couponCode' ) ) {
		return null;
	}

	const onCouponCodeChange = ( e ) => {
		const couponCode = e.target.value;
		editPromotion( siteId, promotion, { couponCode, type: promotion.type } );
	};

	const couponCode = promotion.couponCode || '';

	return (
		<FormFieldset>
			<FormLabel className="promotions__field-label">{ translate( 'Coupon code' ) }</FormLabel>
			{ renderRequiredLabel( isRequiredField( model, 'couponCode' ), translate ) }
			<FormTextInput
				value={ couponCode }
				onChange={ onCouponCodeChange }
				placeholder={ translate( 'Enter coupon code' ) }
			/>
			<div className="promotions__promotion-form-field-footnote">
				{ translate( 'Only apply this promotion when the customer supplies the coupon code' ) }
			</div>
		</FormFieldset>
	);
}

function renderAmount( siteId, model, promotion, editPromotion, translate, currency ) {
	if ( ! hasField( model, 'amount' ) ) {
		return null;
	}

	return (
		<FormFieldset>
			<FormLabel>{ translate( 'Discount', { context: 'noun' } ) }</FormLabel>
			<FormLabel className="promotions__field-label">
				{ translate( 'Discount', { context: 'noun' } ) }
			</FormLabel>
			{ renderRequiredLabel( isRequiredField( model, 'couponCode' ), translate ) }
			{ renderAmountField( siteId, model, promotion, editPromotion, translate, currency ) }
		</FormFieldset>
	);
}

function renderAmountField( siteId, model, promotion, editPromotion, translate, currency ) {
	const { type } = promotion;
	const renderedAmount = ( 'undefined' !== typeof promotion.amount ? promotion.amount : '' );

	if ( 'percent' === promotion.type ) {
		const onAmountChange = ( e ) => {
			const amount = e.target.value;
			if ( amount >= 0 && amount <= 100 ) {
				editPromotion( siteId, promotion, { amount, type } );
			}
		};

		// TODO: Consider making a FormPercentInput general purpose component.
		return (
			<FormTextInputWithAffixes
				type="number"
				min="0"
				max="100"
				suffix="%"
				placeholder="20"
				value={ renderedAmount }
				onChange={ onAmountChange }
			/>
		);
	}

	// Not a percent, so a currency amount.
	const onAmountChange = ( e ) => {
		const amount = e.target.value;
		if ( amount >= 0 ) {
			editPromotion( siteId, promotion, { amount, type } );
		}
	};

	return (
		<PriceInput
			currency={ currency }
			value={ renderedAmount }
			onChange={ onAmountChange }
		/>
	);
}

function renderSalePrice( siteId, model, promotion, editPromotion, translate, currency ) {
	if ( ! hasField( model, 'salePrice' ) ) {
		return null;
	}

	const { type } = promotion;
	const renderedSalePrice = ( 'undefined' !== typeof promotion.salePrice ? promotion.salePrice : '' );

	const onSalePriceChange = ( e ) => {
		const salePrice = e.target.value;
		if ( salePrice >= 0 ) {
			editPromotion( siteId, promotion, { salePrice, type } );
		}
	};

	return (
		<FormFieldset>
			<FormLabel className="promotions__field-label">{ translate( 'Sale Price' ) }</FormLabel>
			{ renderRequiredLabel( isRequiredField( model, 'salePrice' ), translate ) }
			<PriceInput
				currency={ currency }
				value={ renderedSalePrice }
				onChange={ onSalePriceChange }
			/>
		</FormFieldset>
	);
}

const PromotionFormCard = ( {
	siteId,
	currency,
	promotion,
	editPromotion,
	translate
} ) => {
	const model = promotionModels[ promotion.type ];

	return (
		<Card className="promotions__promotion-form-card">
			{ renderCouponCode( siteId, model, promotion, editPromotion, translate ) }
			{ renderAmount( siteId, model, promotion, editPromotion, translate, currency ) }
			{ renderSalePrice( siteId, model, promotion, editPromotion, translate, currency ) }

			<PromotionFormAppliesTo promotion={ promotion } />
		</Card>
	);
};

PromotionFormCard.PropTypes = {
	siteId: PropTypes.number.isRequired,
	currency: PropTypes.string.isRequired,
	promotion: PropTypes.shape( {
		id: PropTypes.isRequired,
		type: PropTypes.string.isRequired,
	} ),
	editPromotion: PropTypes.func.isRequired,
};

export default localize( PromotionFormCard );

