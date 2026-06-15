/**
 * Response from GET /wpcom/v2/agency.
 * Either an array of agencies (agency user) or a client-user payload.
 */
export type AgencyApiResponse =
	| { id: number; name: string }[]
	| { is_client_user: boolean; billing_type?: string };

export interface AgencyBlog {
	name: string;
	existing_wpcom_license_count: number;
	referral_status: 'active' | 'pending' | 'canceled' | 'archived';
	billing_system?: 'billingdragon' | 'legacy';
	prices: {
		actual_price: number;
		currency: string;
	};
}
