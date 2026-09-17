export interface ReferralClient {
	id: number;
	email: string;
}

export interface ReferralPurchaseSubscription {
	id: string;
	product_name: string;
	purchase_price?: string;
	purchase_currency?: string;
	billing_interval_unit?: string;
	status: string;
	expiry?: string;
	is_auto_renew_enabled: boolean;
	is_refundable?: boolean;
}

export interface ReferralPurchaseLicense {
	license_key: string;
	issued_at: string;
	attached_at: string | null;
	revoked_at: string | null;
}

export interface ReferralPurchaseCommissions {
	estimated_commission_current_quarter: number;
	estimated_commission_previous_quarter: number;
}

export interface ReferralPurchase {
	status: string;
	product_id: number;
	quantity: number;
	license: ReferralPurchaseLicense;
	site_assigned: string;
	subscription?: ReferralPurchaseSubscription;
	commissions?: ReferralPurchaseCommissions;
	referral_id: number;
}

/**
 * A single referral as returned by GET /agency/{agencyId}/referrals.
 */
export interface ReferralApiResponse {
	id: number;
	client: ReferralClient;
	products: ReferralPurchase[];
	status: string;
	checkout_url: string;
}

/**
 * Referrals grouped by client, as consumed by the Referrals dashboard.
 */
export interface Referral {
	id: number;
	client: ReferralClient;
	purchases: ReferralPurchase[];
	purchaseStatuses: string[];
	referralStatuses: string[];
	referrals: ReferralApiResponse[];
}

export interface ReferralCommissionPayoutInvoice {
	payment_date: string;
	paid_amount: number;
	commission_amount: number;
}

export interface ReferralCommissionPayoutProduct {
	product_id: number;
	product_name: string;
	total_amount: number;
	total_commission: number;
	invoices?: ReferralCommissionPayoutInvoice[];
}

export interface ReferralCommissionPayoutClient {
	client_user_id: number | 'N/A';
	email: string;
	total_amount: number;
	total_commission: number;
	products: ReferralCommissionPayoutProduct[];
}

export interface ReferralCommissionPayout {
	total_amount: number;
	total_commission: number;
	start_date: string;
	end_date: string;
	next_payout_date: string;
	client_data: ReferralCommissionPayoutClient[];
}
