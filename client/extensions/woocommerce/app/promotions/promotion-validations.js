// TODO: Add unit tests for the following functions.

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { isEmpty, isUndefined } from 'lodash';

/**
 * Validates a coupon code.
 *
 * @param { String } fieldName The field name to be validated.
 * @param { Object } promotion The promotion to be validated.
 * @param { String } currency The currency to be used for validation.
 * @param { bool } showEmpty True if empty fields should result in a validation error.
 * @returns { string } Returns a validation error, or undefined if none.
 */
export function validateCouponCode( fieldName, promotion, currency, showEmpty ) {
	const couponCode = promotion.couponCode || '';
	if ( showEmpty && isEmpty( couponCode.trim() ) ) {
		return translate( 'Enter a coupon code so your customers can access this promotion.' );
	}
}

/**
 * Validates a numeric discount.
 *
 * @param { String } fieldName The field name to be validated.
 * @param { Object } promotion The promotion to be validated.
 * @param { String } currency The currency to be used for validation.
 * @param { bool } showEmpty True if empty fields should result in a validation error.
 * @returns { string } Returns a validation error, or undefined if none.
 */
export function validateDiscount( fieldName, promotion, currency, showEmpty ) {
	const discount = promotion[ fieldName ];
	if ( showEmpty && isEmpty( discount ) ) {
		return translate( 'Discount cannot be blank.' );
	}
	if ( 0 >= discount ) {
		return translate( 'Discount must be greater than zero.' );
	}
}

/**
 * Validates a sale price.
 *
 * @param { String } fieldName The field name to be validated.
 * @param { Object } promotion The promotion to be validated.
 * @param { String } currency The currency to be used for validation.
 * @param { bool } showEmpty True if empty fields should result in a validation error.
 * @returns { string } Returns a validation error, or undefined if none.
 */
export function validateSalePrice( fieldName, promotion, currency, showEmpty ) {
	if ( showEmpty && isEmpty( promotion.salePrice ) ) {
		return translate( 'Define a sale price.' );
	}
	if ( 0 >= promotion.salePrice ) {
		return translate( 'Sale price must be greater than zero.' );
	}
}

/**
 * Checks validition of start date and end date.
 *
 * @param { string } startDateString String form of end date, or null/undefined.
 * @param { string } endDateString String form of end date, or null/undefined.
 * @returns { boolean } True if the end date is before the start date, false if not.
 */
export function isEndDateBeforeStartDate( startDateString, endDateString ) {
	const startDate = startDateString ? new Date( startDateString ) : new Date();
	const endDate = endDateString ? new Date( endDateString ) : null;

	if ( ! endDate ) {
		return false;
	}

	// Clear the times, we only care about days.
	startDate.setHours( 0, 0, 0, 0 );
	endDate.setHours( 0, 0, 0, 0 );

	return endDate < startDate;
}

/**
 * Validates a promotion start date.
 *
 * @param { String } fieldName The field name to be validated.
 * @param { Object } promotion The promotion to be validated.
 * @param { String } currency The currency to be used for validation.
 * @param { bool } showEmpty True if empty fields should result in a validation error.
 * @returns { string } Returns a validation error, or undefined if none.
 */
export function validateStartEndDate( fieldName, promotion ) {
	if ( isEndDateBeforeStartDate( promotion.startDate, promotion.endDate ) ) {
		switch ( fieldName ) {
			case 'startDate':
				return ! isUndefined( promotion.startDate )
					? translate( 'Start date cannot be after end date.' )
					: null;
			case 'endDate':
				return ! isUndefined( promotion.endDate )
					? translate( 'End date cannot be before start date.' )
					: null;
		}
	}
}

/**
 * Validates a promotion end date.
 *
 * @param { String } fieldName The field name to be validated.
 * @param { Object } promotion The promotion to be validated.
 * @param { String } currency The currency to be used for validation.
 * @param { bool } showEmpty True if empty fields should result in a validation error.
 * @returns { string } Returns a validation error, or undefined if none.
 */
export function validateEndDate( fieldName, promotion ) {
	if ( isUndefined( promotion.endDate ) ) {
		// Field is not enabled.
		return;
	}
	if ( isEndDateBeforeStartDate( null, promotion.endDate ) ) {
		return translate( 'End date cannot be in the past.' );
	}
}

/**
 * Validates a minimum amount.
 *
 * @param { String } fieldName The field name to be validated.
 * @param { Object } promotion The promotion to be validated.
 * @param { String } currency The currency to be used for validation.
 * @param { bool } showEmpty True if empty fields should result in a validation error.
 * @returns { string } Returns a validation error, or undefined if none.
 */
export function validateMinimumAmount( fieldName, promotion, currency, showEmpty ) {
	const { minimumAmount, maximumAmount } = promotion;

	if ( isUndefined( minimumAmount ) ) {
		// Field is not enabled.
		return;
	}
	if ( showEmpty && isEmpty( minimumAmount ) ) {
		return translate( 'Define a minimum amount.' );
	}
	if ( null !== minimumAmount ) {
		if ( 0 >= minimumAmount ) {
			return translate( 'Amount must be greater than zero.' );
		}

		if ( null !== maximumAmount && Number( maximumAmount ) < Number( minimumAmount ) ) {
			return translate( 'Amount must be less than maximum amount.' );
		}
	}
}

/**
 * Validates a maximum amount.
 *
 * @param { String } fieldName The field name to be validated.
 * @param { Object } promotion The promotion to be validated.
 * @param { String } currency The currency to be used for validation.
 * @param { bool } showEmpty True if empty fields should result in a validation error.
 * @returns { string } Returns a validation error, or undefined if none.
 */
export function validateMaximumAmount( fieldName, promotion, currency, showEmpty ) {
	const { minimumAmount, maximumAmount } = promotion;

	if ( isUndefined( maximumAmount ) ) {
		// Field is not enabled.
		return;
	}
	if ( showEmpty && isEmpty( maximumAmount ) ) {
		return translate( 'Amount cannot be blank.' );
	}
	if ( null !== maximumAmount ) {
		if ( 0 >= maximumAmount ) {
			return translate( 'Amount must be greater than zero.' );
		}

		if ( null !== minimumAmount && Number( minimumAmount ) > Number( maximumAmount ) ) {
			return translate( 'Amount must be greater than minimum amount.' );
		}
	}
}

/**
 * Validates an overall usage limit.
 *
 * @param { String } fieldName The field name to be validated.
 * @param { Object } promotion The promotion to be validated.
 * @param { String } currency The currency to be used for validation.
 * @param { bool } showEmpty True if empty fields should result in a validation error.
 * @returns { string } Returns a validation error, or undefined if none.
 */
export function validateUsageLimit( fieldName, promotion, currency, showEmpty ) {
	const { usageLimit, usageLimitPerUser } = promotion;

	if ( isUndefined( usageLimit ) ) {
		// Field is not enabled.
		return;
	}
	if ( showEmpty && isEmpty( String( usageLimit ) ) ) {
		return translate( 'Number cannot be blank.' );
	}
	if ( null !== usageLimit ) {
		if ( 0 >= usageLimit ) {
			return translate( 'Number must be greater than zero.' );
		}

		if ( usageLimitPerUser && Number( usageLimitPerUser ) > Number( usageLimit ) ) {
			return translate( 'Total usage limit must not be less than per user limit.' );
		}
	}
}

/**
 * Validates an individual usage limit per user.
 *
 * @param { String } fieldName The field name to be validated.
 * @param { Object } promotion The promotion to be validated.
 * @param { String } currency The currency to be used for validation.
 * @param { bool } showEmpty True if empty fields should result in a validation error.
 * @returns { string } Returns a validation error, or undefined if none.
 */
export function validateUsageLimitPerUser( fieldName, promotion, currency, showEmpty ) {
	const { usageLimit, usageLimitPerUser } = promotion;

	if ( isUndefined( usageLimitPerUser ) ) {
		// Field is not enabled.
		return;
	}
	if ( showEmpty && isEmpty( String( usageLimitPerUser ) ) ) {
		return translate( 'Number cannot be blank.' );
	}
	if ( null !== usageLimitPerUser ) {
		if ( 0 >= usageLimitPerUser ) {
			return translate( 'Number must be greater than zero.' );
		}

		if ( usageLimit && Number( usageLimitPerUser ) > Number( usageLimit ) ) {
			return translate( 'Per user limit must not be greater than total usage limit.' );
		}
	}
}

/**
 * Validates a coupons "Applies To" list.
 *
 * @param { String } fieldName The field name to be validated.
 * @param { Object } promotion The promotion to be validated.
 * @param { String } currency The currency to be used for validation.
 * @param { bool } showEmpty True if empty fields should result in a validation error.
 * @returns { string } Returns a validation error, or undefined if none.
 */
export function validateCouponAppliesTo( fieldName, promotion, currency, showEmpty ) {
	const { appliesTo } = promotion;
	const { productIds, productCategoryIds } = appliesTo || {};

	if ( showEmpty ) {
		if ( productIds && 0 === productIds.length ) {
			return translate( 'At least one product must be selected.' );
		}
		if ( productCategoryIds && 0 === productCategoryIds.length ) {
			return translate( 'At least one product category must be selected.' );
		}
	}
}

/**
 * Validates an "Applies To" field for a single product.
 *
 * @param { String } fieldName The field name to be validated.
 * @param { Object } promotion The promotion to be validated.
 * @param { String } currency The currency to be used for validation.
 * @param { bool } showEmpty True if empty fields should result in a validation error.
 * @returns { string } Returns a validation error, or undefined if none.
 */
export function validateAppliesToSingleProduct( fieldName, promotion, currency, showEmpty ) {
	const { appliesTo } = promotion;
	const { productIds } = appliesTo || {};

	if ( showEmpty && isEmpty( productIds ) ) {
		return translate( 'A product must be selected.' );
	}
}
