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
import DatePicker from 'components/date-picker';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormInputCheckbox from 'components/forms/form-checkbox';
import FormTextInput from 'components/forms/form-text-input';
import PromotionFormDiscountTypeAndAmount from './promotion-form-discount-type-and-amount';

function renderAppliesTo( coupon, translate, onAppliesToChange ) {
	// TODO: Add support for including/excluding products and product categories
	const appliesTo = 'all_products';

	return (
		<FormSelect value={ appliesTo } onChange={ onAppliesToChange } >
			<option value="all_products">{ translate( 'All Products' ) }</option>
		</FormSelect>
	);
}

function renderExpiration( coupon, translate, onEnable, onChange ) {
	const hasExpirationDate = Boolean( coupon.date_expires_gmt );

	const datePicker = hasExpirationDate && renderDatePicker( new Date( coupon.date_expires_gmt ), onChange );

	return (
		<FormFieldset className="promotions__promotion-form-coupon-expires">
			<FormInputCheckbox checked={ hasExpirationDate } onChange={ onEnable } />
			<FormLabel>{ translate( 'Expiration date' ) }</FormLabel>
			{ datePicker }
		</FormFieldset>
	);
}

function renderDatePicker( date, onChange ) {
	return (
		<DatePicker
			initialMonth={ date }
			selectedDay={ date }
			onSelectDay={ onChange }
		/>
	);
}

function editCoupon( siteId, promotion, coupon, data, editPromotion ) {
	const newCoupon = { ...coupon, ...data };
	editPromotion( siteId, promotion, { ...promotion, coupon: newCoupon } );
}

const PromotionFormCouponCard = ( {
	siteId,
	currency,
	promotion,
	editPromotion,
	translate,
} ) => {
	const coupon = ( promotion && promotion.coupon ) || { code: '', discount_type: 'percent', amount: '' };
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

	const onAppliesToChange = () => {
		// TODO: Add support for other "Applies to" selections.
	};

	const onExpirationEnable = () => {
		const checked = Boolean( coupon.date_expires_gmt );
		const expirationDate = ( ! checked ? coupon.date_expires_gmt || new Date().toISOString() : undefined );
		editCoupon( siteId, promotion, coupon, { date_expires_gmt: expirationDate }, editPromotion );
	};

	const onExpirationChange = ( date ) => {
		editCoupon( siteId, promotion, coupon, { date_expires_gmt: date.toISOString() }, editPromotion );
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
			<FormFieldset className="promotions__promotion-form-coupon-applies-to">
				<FormLabel>{ translate( 'Applies to' ) }</FormLabel>
				{ renderAppliesTo( coupon, translate, onAppliesToChange ) }
			</FormFieldset>
			{ renderExpiration( coupon, translate, onExpirationEnable, onExpirationChange ) }
		</Card>
	);
};

PromotionFormCouponCard.PropTypes = {
	siteId: PropTypes.number,
	promotion: PropTypes.shape( {
		id: PropTypes.isRequired,
		code: PropTypes.string,
		discount_type: PropTypes.string,
		amount: PropTypes.number,
	} ),
	editPromotion: PropTypes.func.isRequired,
};

export default localize( PromotionFormCouponCard );

