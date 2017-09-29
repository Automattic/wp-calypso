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
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import PriceInput from 'woocommerce/components/price-input';

function renderDiscountTypeSelect( coupon, translate, onDiscountTypeSelect ) {
	return (
		<FormSelect value={ coupon.discountType } onChange={ onDiscountTypeSelect } >
			<option value="percent">{ translate( 'Percentage discount' ) }</option>
			<option value="fixed_cart">{ translate( 'Cart discount' ) }</option>
			<option value="fixed_product">{ translate( 'Product discount' ) }</option>
		</FormSelect>
	);
}

function renderAmountInput( coupon, currency, onAmountChange ) {
	if ( 'percent' === coupon.discount_type ) {
		// TODO: Consider making a FormPercentInput general-purpose component?
		return (
			<FormTextInputWithAffixes
				type="number"
				min="0"
				max="100"
				suffix="%"
				value={ coupon.amount }
				onChange={ onAmountChange }
			/>
		);
	}

	return (
		<PriceInput
			currency={ currency }
			value={ coupon.amount }
			onChange={ onAmountChange }
		/>
	);
}

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
	const coupon = ( promotion && promotion.coupon ) || { code: '', discount_type: 'percent', amount: '0' };

	const onCodeChange = ( e ) => {
		editCoupon( siteId, promotion, coupon, { code: e.target.value }, editPromotion );
	};

	const onDiscountTypeSelect = ( e ) => {
		// Clear out the amount whenever the type is changed.
		// This ensures a valid value when switching between currency and percent
		editCoupon( siteId, promotion, coupon, { discount_type: e.target.value, amount: 0 }, editPromotion );
	};

	const onAmountChange = ( e ) => {
		const value = Number( e.target.value );
		if ( 'percent' === coupon.discount_type ) {
			if ( value < 0 || value > 100 ) {
				// Don't make a change that would invalidate the field.
				return;
			}
		}

		editCoupon( siteId, promotion, coupon, { amount: value }, editPromotion );
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
			<div className="promotions__promotion-form-coupon-discount-type-amount">
				<FormFieldset className="promotions__promotion-form-coupon-discount-type">
					<FormLabel>{ translate( 'Discount type' ) }</FormLabel>
					{ renderDiscountTypeSelect( coupon, translate, onDiscountTypeSelect ) }
				</FormFieldset>
				<FormFieldset className="promotions__promotion-form-coupon-amount">
					<FormLabel>{ translate( 'Amount' ) }</FormLabel>
					{ renderAmountInput( coupon, currency, onAmountChange ) }
				</FormFieldset>
			</div>
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

