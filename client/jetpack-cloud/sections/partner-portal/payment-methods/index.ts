export interface PaymentMethod {
	id: string;
	card: PaymentMethodCard;
	is_default: boolean;
	name: string;
	created: string;
}

export interface PaymentMethodCard {
	brand: string;
	exp_month: number;
	exp_year: number;
	last4: string;
}
