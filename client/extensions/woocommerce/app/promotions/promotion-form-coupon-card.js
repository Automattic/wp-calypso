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
import PromotionFormDiscountTypeAndAmount from './promotion-form-discount-type-and-amount';
import PromotionFormAppliesTo from './promotion-form-applies-to';

function editCoupon( siteId, promotion, coupon, data, editPromotion ) {
	const newCoupon = { ...coupon, ...data };
	editPromotion( siteId, promotion, { ...promotion, coupon: newCoupon } );
}

const PromotionFormCouponCard = ( {
	siteId,
	currency,
	promotion,
	editPromotion,
	products,
	productCategories,
	translate,
} ) => {
	const { coupon } = promotion;
	const discountTypesAvailable = [
		{ type: 'percent', value: 'percent', text: translate( 'Percentage discount' ) },
		{ type: 'price', value: 'fixed_cart', text: translate( 'Cart discount' ) },
		{ type: 'price', value: 'fixed_product', text: translate( 'Product discount' ) },
	];

	const onCodeChange = ( e ) => {
		editCoupon( siteId, promotion, coupon, { code: e.target.value }, editPromotion );
	};

	const onDiscountTypeSelect = ( discountTypeValue ) => {
		// Clear out the amount whenever the type is changed.
		// This ensures a valid value when switching between currency and percent
		editCoupon( siteId, promotion, coupon, { discount_type: discountTypeValue, amount: '' }, editPromotion );
	};

	const onAmountChange = ( amount ) => {
		editCoupon( siteId, promotion, coupon, { amount }, editPromotion );
	};

	return (
		<Card className="promotions__promotion-form-coupon">
			<FormFieldset className="promotions__promotion-form-coupon-code">
				<FormLabel>{ translate( 'Coupon code' ) }</FormLabel>
				<FormTextInput
					value={ coupon.code }
					onChange={ onCodeChange }
					placeholder={ translate( 'Enter coupon code' ) }
				/>
			</FormFieldset>
			<PromotionFormDiscountTypeAndAmount
				discountTypesAvailable={ discountTypesAvailable }
				discountTypeValue={ coupon.discount_type }
				amount={ coupon.amount }
				currency={ currency }
				onDiscountTypeSelect={ onDiscountTypeSelect }
				onAmountChange={ onAmountChange }
			/>
			<PromotionFormAppliesTo
				siteId={ siteId }
				promotion={ promotion }
				editPromotion={ editPromotion }
				products={ products }
				productCategories={ productCategories }
			/>
		</Card>
	);
};

PromotionFormCouponCard.PropTypes = {
	siteId: PropTypes.number,
	currency: PropTypes.string,
	promotion: PropTypes.shape( {
		id: PropTypes.isRequired,
		coupon: PropTypes.shape( {
			code: PropTypes.string,
			discount_type: PropTypes.string,
			amount: PropTypes.number,
		} ),
	} ),
	editPromotion: PropTypes.func.isRequired,
	products: PropTypes.array,
	productCategories: PropTypes.array,
};

export default localize( PromotionFormCouponCard );

