/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { hasRenewalItem } from './cart-items';
import {
	isCredits,
	isDomainRedemption,
	allowedProductAttributes,
} from '@automattic/calypso-products';

export function canRemoveFromCart( cart, cartItem ) {
	if ( isCredits( cartItem ) ) {
		return false;
	}

	if ( hasRenewalItem( cart ) && isDomainRedemption( cartItem ) ) {
		return false;
	}

	return true;
}

export function fillInSingleCartItemAttributes( cartItem, products ) {
	const product = products[ cartItem.product_slug ];
	if ( ! product ) {
		return cartItem;
	}
	const attributes = allowedProductAttributes( product );

	return { ...cartItem, ...attributes };
}

/**
 * Return a string that represents the User facing name for payment method
 *
 * @param {string} method - payment method
 * @returns {string} the title
 */
export function paymentMethodName( method ) {
	const paymentMethodsNames = {
		alipay: 'Alipay',
		bancontact: 'Bancontact',
		card: translate( 'Credit or debit card' ),
		eps: 'EPS',
		giropay: 'Giropay',
		id_wallet: 'OVO',
		ideal: 'iDEAL',
		netbanking: 'Net Banking',
		paypal: 'PayPal',
		p24: 'Przelewy24',
		'brazil-tef': 'Transferência bancária',
		'apple-pay': 'Apple Pay',
		wechat: translate( 'WeChat Pay', {
			comment: 'Name for WeChat Pay - https://pay.weixin.qq.com/',
		} ),
		sofort: 'Sofort',
	};

	return paymentMethodsNames[ method ] || method;
}

export function hasPendingPayment( cart ) {
	if ( cart && cart.has_pending_payment ) {
		return true;
	}

	return false;
}

export function shouldShowTax( cart ) {
	return cart?.tax?.display_taxes ?? false;
}
