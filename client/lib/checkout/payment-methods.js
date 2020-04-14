export const PARTNER_PAYPAL_EXPRESS = 'paypal_express';
export const PAYMENT_AGREEMENTS_PARTNERS = [ PARTNER_PAYPAL_EXPRESS ];

export const isPaymentAgreement = method =>
	PAYMENT_AGREEMENTS_PARTNERS.includes( method.payment_partner );

export const isCreditCard = method => method.card && method.card.length > 0;
