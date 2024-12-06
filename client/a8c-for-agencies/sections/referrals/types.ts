interface ReferralPurchaseAPIResponse {
	status: string;
	product_id: number;
	quantity: number;
	license: {
		license_key: string;
		attached_at: string | null;
		revoked_at: string | null;
	};
	site_assigned: string;
}
export interface ReferralPurchase extends ReferralPurchaseAPIResponse {
	status: string;
	referral_id: number;
}
export interface ReferralClient {
	id: number;
	email: string;
}
export interface Referral {
	id: number;
	client: ReferralClient;
	purchases: ReferralPurchase[];
	purchaseStatuses: string[];
	referralStatuses: string[];
	referralId: number;
}

export interface ReferralAPIResponse {
	id: number;
	client: ReferralClient;
	products: ReferralPurchaseAPIResponse[];
	status: string;
}

export interface ReferralInvoiceAPIResponse {
	id: string;
	metadata: {
		invalid: string;
		jetpack_partner_key_id: string;
		jetpack_partner_type: string;
		period_end: string;
		period_start: string;
		user_id: string;
	};
	status: string;
	amount_due: number;
	amount_paid: number;
	amount_remaining: number;
	products: {
		wpcom_product_id: string;
		product_family_slug: string;
		amount: number;
	}[];
}

export interface ReferralInvoice extends ReferralInvoiceAPIResponse {
	clientId: number;
	isPaid: boolean;
	isDue: boolean;
}
