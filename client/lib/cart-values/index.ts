import { isCredits, isDomainRedemption } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { hasRenewalItem } from './cart-items';
import type {
	ResponseCart,
	ResponseCartProduct,
	RequestCartProduct,
	MinimalRequestCartProduct,
} from '@automattic/shopping-cart';

export function canRemoveFromCart( cart: ResponseCart, cartItem: ResponseCartProduct ): boolean {
	if ( isCredits( cartItem ) ) {
		return false;
	}

	if ( hasRenewalItem( cart ) && isDomainRedemption( cartItem ) ) {
		return false;
	}

	return true;
}

export type RequestCartProductWithoutId = Partial< RequestCartProduct > &
	Pick< RequestCartProduct, 'product_slug' >;

/**
 * Add a product_id to a incomplete RequestCartProduct
 */
export function fillInSingleCartItemAttributes(
	cartItem: RequestCartProductWithoutId,
	products: Record< string, { product_id: number } >
): MinimalRequestCartProduct {
	if ( ( cartItem as RequestCartProduct ).product_id ) {
		return cartItem as RequestCartProduct;
	}
	const product = products[ cartItem.product_slug ];
	if ( ! product?.product_id ) {
		throw new Error( `Cannot fill in product ID for ${ cartItem.product_slug }` );
	}
	return { ...cartItem, product_id: product.product_id };
}

/**
 * Return a string that represents the User facing name for payment method
 *
 * Returns the original string if a known payment method cannot be found.
 */
export function paymentMethodName( method: string ): string {
	const paymentMethodsNames = {
		alipay: 'Alipay',
		bancontact: 'Bancontact',
		card: translate( 'Credit or debit card' ),
		eps: 'EPS',
		giropay: 'Giropay',
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

	return ( paymentMethodsNames as Record< string, string > )[ method ] || method;
}

export function hasPendingPayment( cart: ResponseCart ): boolean {
	return cart?.has_pending_payment ?? false;
}

export function shouldShowTax( cart: ResponseCart ): boolean {
	return cart?.tax?.display_taxes ?? false;
}
