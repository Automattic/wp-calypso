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
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import PriceInput from 'woocommerce/components/price-input';
import promotionModels, { hasField, isRequiredField } from './promotion-models';

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
			<FormLabel>{ translate( 'Coupon code' ) }</FormLabel>
			{ renderRequiredLabel( isRequiredField( model, 'couponCode' ), translate ) }
			<FormTextInput
				value={ couponCode }
				onChange={ onCouponCodeChange }
				placeholder={ translate( 'Enter coupon code' ) }
			/>
			<FormSettingExplanation>
				{ translate( 'Only apply this promotion when the customer supplies the coupon code' ) }
			</FormSettingExplanation>
		</FormFieldset>
	);
}

function renderFixedDiscount( labelText, siteId, model, promotion, editPromotion, translate, currency ) {
	if ( ! hasField( model, 'fixedDiscount' ) ) {
		return null;
	}

	const { fixedDiscount, type } = promotion;
	const renderedAmount = ( 'undefined' !== typeof fixedDiscount ? fixedDiscount : '' );
	const onChange = ( e ) => {
		const newDiscount = e.target.value;
		if ( newDiscount >= 0 ) {
			editPromotion( siteId, promotion, { fixedDiscount: newDiscount, type } );
		}
	};

	return (
		<FormFieldset>
			<FormLabel>{ labelText }</FormLabel>
			{ renderRequiredLabel( isRequiredField( model, 'fixedDiscount' ), translate ) }
			<PriceInput
				currency={ currency }
				value={ renderedAmount }
				onChange={ onChange }
			/>
		</FormFieldset>
	);
}

function renderPercentDiscount( labelText, siteId, model, promotion, editPromotion, translate ) {
	if ( ! hasField( model, 'percentDiscount' ) ) {
		return null;
	}

	const { percentDiscount, type } = promotion;
	const renderedAmount = ( 'undefined' !== typeof percentDiscount ? percentDiscount : '' );
	const onPercentChange = ( e ) => {
		const newDiscount = e.target.value;
		if ( newDiscount >= 0 && newDiscount <= 100 ) {
			editPromotion( siteId, promotion, { percentDiscount: newDiscount, type } );
		}
	};

	return (
		<FormFieldset>
			<FormLabel>{ labelText }</FormLabel>
			{ renderRequiredLabel( isRequiredField( model, 'percentDiscount' ), translate ) }
			<FormTextInputWithAffixes
				type="number"
				min="0"
				max="100"
				suffix="%"
				placeholder="20"
				value={ renderedAmount }
				onChange={ onPercentChange }
			/>
		</FormFieldset>
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
			<FormLabel>{ translate( 'Product Sale Price' ) }</FormLabel>
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
			{ 'fixed_product' === promotion.type && renderFixedDiscount(
				translate( 'Product Discount', { context: 'noun' } ),
				siteId,
				model,
				promotion,
				editPromotion,
				translate,
				currency
			) }
			{ 'fixed_cart' === promotion.type && renderFixedDiscount(
				translate( 'Cart Discount', { context: 'noun' } ),
				siteId,
				model,
				promotion,
				editPromotion,
				translate,
				currency
			) }
			{ renderPercentDiscount(
				translate( 'Cart Percent Discount', { context: 'noun' } ),
				siteId,
				model,
				promotion,
				editPromotion,
				translate
			) }
			{ renderSalePrice( siteId, model, promotion, editPromotion, translate, currency ) }
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

