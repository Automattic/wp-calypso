/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { isEmpty } from 'lodash';

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
import {
	validateAppliesToSingleProduct,
	validateCouponAppliesTo,
	validateCouponCode,
	validateDiscount,
	validateEndDate,
	validateMaximumAmount,
	validateMinimumAmount,
	validateSalePrice,
	validateStartEndDate,
	validateUsageLimit,
	validateUsageLimitPerUser,
} from './promotion-validations';

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
		explanationText={ translate( 'This coupon also provides free shipping' ) }
	/>
);

/**
 * Coupon "Applies to" card.
 */
const appliesToCoupon = {
	labelText: translate( 'Applies to' ),
	cssClass: 'promotions__promotion-form-card-applies-to',
	fields: {
		appliesTo: {
			component: (
				<PromotionAppliesToField
					selectionTypes={ [
						{ labelText: translate( 'All products' ), type: 'all' },
						{ labelText: translate( 'Specific products' ), type: 'productIds' },
						{ labelText: translate( 'Product categories' ), type: 'productCategoryIds' },
					] }
				/>
			),
			validate: validateCouponAppliesTo,
		},
	},
};

/**
 * Coupon "Applies when" card.
 */
const appliesWhenCoupon = {
	labelText: translate( 'Applies when' ),
	cssClass: 'promotions__promotion-form-card-applies-to',
	fields: {
		appliesTo: {
			component: (
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
				/>
			),
		},
	},
};

/**
 * Product sale "Applies to" card.
 */
const appliesToProductSale = {
	labelText: translate( 'Applies to product' ),
	cssClass: 'promotions__promotion-form-card-applies-to',
	fields: {
		appliesTo: {
			component: <PromotionAppliesToField selectionTypes={ [ { type: 'productIds' } ] } singular />,
			validate: validateAppliesToSingleProduct,
		},
	},
};

/**
 * Start date condition field
 *
 * @param {object} props Component properties
 * @param {object} props.promotion Promotion API object
 * @param { string } props.value Current value for end date.
 * @returns {object} React component instance.
 */
const StartDateField = ( props ) => {
	return (
		<DateField
			labelText={ translate( 'Start Date' ) }
			isEnableable
			disabledDays={ [ { before: new Date() } ] }
			{ ...props }
		/>
	);
};

/**
 * End date condition field
 *
 * @param {object} props Component properties
 * @param {object} props.promotion Promotion API object
 * @param { string } props.value Current value for end date.
 * @returns {object} React component instance.
 */
const EndDateField = ( props ) => {
	const { promotion } = props;
	const startDate = promotion.startDate ? new Date( promotion.startDate ) : new Date();

	return (
		<DateField
			labelText={ translate( 'End date' ) }
			isEnableable
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
		labelText: translate( 'Product & sale price' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			salePrice: {
				component: <CurrencyField labelText={ translate( 'Product sale price' ) } isRequired />,
				validate: validateSalePrice,
			},
		},
	},
	conditions: {
		labelText: translate( 'Conditions', { comment: 'must be met to use coupon' } ),
		cssClass: 'promotions__promotion-form-card-conditions',
		fields: {
			startDate: {
				component: <StartDateField />,
				validate: validateStartEndDate,
			},
			endDate: {
				component: <EndDateField />,
				validate: validateStartEndDate,
			},
		},
	},
};

/**
 * Conditions for all coupon types.
 */
const couponConditions = {
	labelText: translate( 'Conditions', { comment: 'must be met to use coupon' } ),
	cssClass: 'promotions__promotion-form-card-conditions',
	fields: {
		endDate: {
			component: <EndDateField />,
			validate: validateEndDate,
		},
		minimumAmount: {
			component: (
				<CurrencyField
					labelText={ translate( 'This promotion requires a minimum purchase' ) }
					isEnableable
				/>
			),
			validate: validateMinimumAmount,
		},
		maximumAmount: {
			component: (
				<CurrencyField
					labelText={ translate(
						"Don't apply this promotion if the order value exceeds a specific amount"
					) }
					isEnableable
				/>
			),
			validate: validateMaximumAmount,
		},
		usageLimit: {
			component: (
				<NumberField
					labelText={ translate( 'Limit number of times this promotion can be used in total' ) }
					isEnableable
					minValue={ 0 }
				/>
			),
			validate: validateUsageLimit,
		},
		usageLimitPerUser: {
			component: (
				<NumberField
					labelText={ translate( 'Limit total times each customer can use this promotion' ) }
					isEnableable
					minValue={ 0 }
				/>
			),
			validate: validateUsageLimitPerUser,
		},
		individualUse: {
			component: (
				<FormField
					labelText={ translate( 'Cannot be combined with any other coupon' ) }
					isEnableable
					defaultValue={ true }
				/>
			),
		},
	},
};

/**
 * Promotion Type: Fixed Product Discount (e.g. $5 off any t-shirt)
 */
const fixedProductModel = {
	appliesToCoupon,
	couponCodeAndDiscount: {
		labelText: translate( 'Coupon code & discount' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			couponCode: {
				component: couponCodeField,
				validate: validateCouponCode,
			},
			fixedDiscount: {
				component: (
					<CurrencyField
						labelText={ translate( 'Product discount', { comment: 'for coupon' } ) }
						isRequired
					/>
				),
				validate: validateDiscount,
			},
			freeShipping: {
				component: freeShippingField,
			},
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
		labelText: translate( 'Coupon code & discount' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			couponCode: {
				component: couponCodeField,
				validate: validateCouponCode,
			},
			fixedDiscount: {
				component: (
					<CurrencyField
						labelText={ translate( 'Cart discount', { comment: 'for coupon' } ) }
						isRequired
					/>
				),
				validate: validateDiscount,
			},
			freeShipping: {
				component: freeShippingField,
			},
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
		labelText: translate( 'Coupon code & discount' ),
		cssClass: 'promotions__promotion-form-card-primary',
		fields: {
			couponCode: {
				component: couponCodeField,
				validate: validateCouponCode,
			},
			percentDiscount: {
				component: (
					<PercentField
						labelText={ translate( 'Percent cart discount', { comment: 'for coupon' } ) }
						isRequired
					/>
				),
				validate: validateDiscount,
			},
			freeShipping: {
				component: freeShippingField,
			},
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
			couponCode: {
				component: couponCodeField,
				validate: validateCouponCode,
			},
		},
	},
	conditions: couponConditions,
};

/**
 * Master list of models by promotion type.
 *
 * Note: The keys of this object correspond with promotion.type
 */
const allModels = {
	product_sale: productSaleModel,
	fixed_product: fixedProductModel,
	fixed_cart: fixedCartModel,
	percent: percentCartModel,
	free_shipping: freeShippingModel,
};
export default allModels;

/**
 * Validate all fields for the given promotion model.
 *
 * @param {object} promotion The promotion to validate.
 * @param {string} currency The currency to use for validations.
 * @param { bool } showEmptyValidationErrors True if empty required fields should be errors.
 * @returns {object} Validation error strings keyed by their field names.
 */
export function validateAll( promotion, currency, showEmptyValidationErrors ) {
	const promotionModel = allModels[ promotion.type ];
	const errors = {};

	// Iterate all fields in the model and validate them.
	// Adding any errors by field name.
	for ( const cardName in promotionModel ) {
		const { fields } = promotionModel[ cardName ];
		for ( const fieldName in fields ) {
			const { validate } = fields[ fieldName ];
			const error =
				validate && validate( fieldName, promotion, currency, showEmptyValidationErrors );
			if ( error ) {
				errors[ fieldName ] = error;
			}
		}
	}

	return ! isEmpty( errors ) ? errors : null;
}
