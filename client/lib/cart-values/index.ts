import { translate } from 'i18n-calypso';

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
		ideal: 'iDEAL',
		netbanking: 'Net Banking',
		paypal: 'PayPal',
		p24: 'Przelewy24',
		'apple-pay': 'Apple Pay',
		wechat: translate( 'WeChat Pay', {
			comment: 'Name for WeChat Pay - https://pay.weixin.qq.com/',
		} ),
		sofort: 'Sofort',
	};

	return ( paymentMethodsNames as Record< string, string > )[ method ] || method;
}
