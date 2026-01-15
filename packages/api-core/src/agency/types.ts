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
