import { ReferralProduct } from '../client/types';

interface ReferralPurchaseAPIResponse {
	status: string;
	product_id: number;
	quantity: number;
	license: {
		license_key: string;
		issued_at: string;
		attached_at: string | null;
		revoked_at: string | null;
	};
	site_assigned: string;
	subscription?: ReferralProduct[ 'subscription' ];
	commissions?: {
		estimated_commission_current_quarter: number;
		estimated_commission_previous_quarter: number;
	};
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
	referrals: ReferralAPIResponse[];
}

export interface ReferralAPIResponse {
	id: number;
	client: ReferralClient;
	products: ReferralPurchase[];
	status: string;
	checkout_url: string;
}

export type ReferralOrderFlowType = 'send' | 'copy';
