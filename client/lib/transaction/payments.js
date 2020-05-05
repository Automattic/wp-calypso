export function newCardPayment( newCardDetails ) {
	return {
		paymentMethod: 'WPCOM_Billing_MoneyPress_Paygate',
		newCardDetails: newCardDetails || {},
	};
}

export function newStripeCardPayment( newCardDetails ) {
	return {
		paymentMethod: 'WPCOM_Billing_Stripe_Payment_Method',
		newCardDetails: newCardDetails || {},
	};
}

export function storedCardPayment( storedCard ) {
	return {
		paymentMethod: 'WPCOM_Billing_MoneyPress_Stored',
		storedCard,
	};
}

export function webPayment( newCardDetails ) {
	return {
		paymentMethod: 'WPCOM_Billing_Web_Payment',
		newCardDetails: newCardDetails || {},
	};
}

export function fullCreditsPayment() {
	return {
		paymentMethod: 'WPCOM_Billing_WPCOM',
	};
}
