/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CheckboxField from './fields/checkbox-field';
import CurrencyField from './fields/currency-field';
import DateField from './fields/date-field';
import FormField from './fields/form-field';
import NumberField from './fields/number-field';
import PercentField from './fields/percent-field';
import TextField from './fields/text-field';
import PromotionAppliesToField from './fields/promotion-applies-to-field';

/**
 * "Coupon code" field reused for all coupon promotion types.
 */
const couponCodeField = (
	<TextField
		labelText={ translate( 'Coupon code' ) }
		explanationText={ translate(
			'Only apply this promotion when the customer supplies the coupon code'
		) }
		placeholderText={ translate( 'Enter coupon code' ) }
		isRequired
	/>
);

/**
 * "Free shipping" field, reused for all coupon prompotion types.
 */
const freeShippingField = (
	<CheckboxField
		labelText={ translate( 'Free shipping' ) }
		explanationText={ translate(
			'This coupon also provides free shipping'
		) }
	/>
);

/**
 * Coupon "Applies to" card.
 */
const appliesToCoupon = {
	labelText: translate( 'Applies to' ),
	cssClass: 'promotions__promotion-form-card-applies-to',
	fields: {
		appliesTo: (
			<PromotionAppliesToField
				selectionTypes={ [
					{ labelText: translate( 'All Products' ), type: 'all' },
					{ labelText: translate( 'Specific Products' ), type: 'productIds' },
					{ labelText: translate( 'Product Categories' ), type: 'productCategoryIds' },
				] }
				// TODO: Remove this text after variable products are supported.
				explanationText={ translate(
					'Note: Variable products cannot be selected directly, ' +
					'only via Product Categories or All Products.'
				) }
			/>
		),
	},
};

/**
 * Coupon "Applies when" card.
 */
const appliesWhenCoupon = {
	labelText: translate( 'Applies when' ),
	cssClass: 'promotions__promotion-form-card-applies-to',
	fields: {
		appliesTo: (
			<PromotionAppliesToField
				selectionTypes={ [
					{
						labelText: translate( 'Any product is in the cart' ),
						type: 'all',
					},
					{
						labelText: translate( 'A specific product is in the cart' ),
						type: 'productIds',
					},
					{
						labelText: translate( 'A product from a specific category is in the cart' ),
						type: 'productCategoryIds',
					},
				] }
				// TODO: Remove this text after variable products are supported.
				explanationText={ translate(
					'Note: Variable products cannot be selected directly, ' +
					'only via Product Categories or All Products.'
				) }
			/>
		),
	},
};

/**
 * Product sale "Applies to" card.
 */
const appliesToProductSale = {
	labelText: translate( 'Applies to product' ),
	cssClass: 'promotions__promotion-form-card-applies-to',
	fields: {
		appliesTo: (
			<PromotionAppliesToField
				selectionTypes={ [ { type: 'productIds' } ] }
				singular
				// TODO: Remove this text after variable products are supported.
				explanationText={ translate( 'Note: Variable products cannot be selected.' ) }
			/>
		),
	},
};

/**
 * End date condition field
 *
 * @param { Object } props Component properties
 * @param { Object } props.promotion Promotion API object
 * @param { string } props.value Current value for end date.
 * @return { Object } React component instance.
 */
const EndDateField = ( props ) => {
	const { promotion, value } = props;
	const startDate = promotion.startDate ? new Date( promotion.startDate ) : new Date();
	const endDate = value ? new Date( value ) : new Date();
	let validationError = null;

	// Clear the times, we only care about days.
	startDate.setHours( 0, 0, 0, 0 );
	endDate.setHours( 0, 0, 0, 0 );

	if ( endDate < startDate ) {
		validationError = translate( 'End date cannot be before start date.' );
	}

	return (
		<DateField
			labelText={ translate( 'End Date' ) }
			isEnableable
			validationErrorText={ validationError }
			disabledDays={ [ { before: new Date( startDate ) } ] }
			{ ...props }
		/>
	);
};

/**
 * Promotion Type: Product Sale (e.g. $5 off the "I <3 Robots" t-shirt)
 */
const productSaleModel = {
	appliesToProductSale,
	productAndSalePrice: {
		labelText: translate( 'Product & Sale Price' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			salePrice: (
				<CurrencyField
					labelText={ translate( 'Product Sale Price' ) }
					isRequired
				/>
			),
		},
	},
	conditions: {
		labelText: translate( 'Conditions', { context: 'noun' } ),
		cssClass: 'promotions__promotion-form-card-conditions',
		fields: {
			startDate: (
				<DateField
					labelText={ translate( 'Start Date' ) }
					isEnableable
					disabledDays={ [ { before: new Date() } ] }
				/>
			),
			endDate: <EndDateField />,
		},
	},
};

/**
 * Conditions for all coupon types.
 */
const couponConditions = {
	labelText: translate( 'Conditions', { context: 'noun' } ),
	cssClass: 'promotions__promotion-form-card-conditions',
	fields: {
		endDate: <EndDateField />,
		minimumAmount: (
			<CurrencyField
				labelText={ translate( 'This promotion requires a minimum purchase' ) }
				isEnableable
			/>
		),
		maximumAmount: (
			<CurrencyField
				labelText={ translate( 'Don\'t apply this promotion if the order value exceeds a specific amount' ) }
				isEnableable
			/>
		),
		usageLimit: (
			<NumberField
				labelText={ translate( 'Limit number of times this promotion can be used in total' ) }
				isEnableable
				minValue={ 0 }
			/>
		),
		usageLimitPerUser: (
			<NumberField
				labelText={ translate( 'Limit total times each customer can use this promotion' ) }
				isEnableable
				minValue={ 0 }
			/>
		),
		individualUse: (
			<FormField
				labelText={ translate( 'Cannot be combined with any other coupon' ) }
				isEnableable
				defaultValue={ true }
			/>
		),
	},
};

/**
 * Promotion Type: Fixed Product Discount (e.g. $5 off any t-shirt)
 */
const fixedProductModel = {
	appliesToCoupon,
	couponCodeAndDiscount: {
		labelText: translate( 'Coupon Code & Discount' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			couponCode: couponCodeField,
			fixedDiscount: (
				<CurrencyField
					labelText={ translate( 'Product Discount', { context: 'noun' } ) }
					isRequired
				/>
			),
			freeShipping: freeShippingField,
		},
	},
	conditions: couponConditions,
};

/**
 * Promotion Type: Fixed Cart Discount (e.g. $10 off my cart)
 */
const fixedCartModel = {
	appliesWhenCoupon,
	couponCodeAndDiscount: {
		labelText: translate( 'Coupon Code & Discount' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			couponCode: couponCodeField,
			fixedDiscount: (
				<CurrencyField
					labelText={ translate( 'Cart Discount', { context: 'noun' } ) }
					isRequired
				/>
			),
			freeShipping: freeShippingField,
		},
	},
	conditions: couponConditions,
};

/**
 * Promotion Type: Percentage Cart Discount (e.g. 10% off my cart)
 */
const percentCartModel = {
	appliesWhenCoupon,
	couponCodeAndDiscount: {
		labelText: translate( 'Coupon Code & Discount' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			couponCode: couponCodeField,
			percentDiscount: (
				<PercentField
					labelText={ translate( 'Percent Cart Discount', { context: 'noun' } ) }
					isRequired
				/>
			),
			freeShipping: freeShippingField,
		},
	},
	conditions: couponConditions,
};

const freeShippingModel = {
	appliesWhenCoupon,
	couponCode: {
		labelText: translate( 'Coupon' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			couponCode: couponCodeField,
		},
	},
	conditions: couponConditions,
};

/**
 * Master list of models by promotion type.
 *
 * Note: The keys of this object correspond with promotion.type
 */
export default {
	product_sale: productSaleModel,
	fixed_product: fixedProductModel,
	fixed_cart: fixedCartModel,
	percent: percentCartModel,
	free_shipping: freeShippingModel,
};
