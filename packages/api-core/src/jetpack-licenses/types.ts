export interface JetpackLicenseMeta {
	a4a_is_dev_site?: string;
	a4a_was_dev_site?: string;
	a4a_dev_site_period_end?: string;
	a4a_dev_site_period_start?: string;
	a4a_transferred_subscription_id?: string;
	a4a_transferred_subscription_expiration?: string;
}

export interface JetpackLicenseSubscription {
	id: string;
	product_name: string;
	purchase_price: number;
	purchase_currency: string;
	billing_interval_unit: string;
	status: string;
	expiry: string | null;
	is_auto_renew_enabled: boolean;
	is_refundable: boolean;
}

export interface JetpackLicense {
	license_id: number;
	license_key: string;
	product_id: number;
	product: string;
	user_id: number | null;
	username: string | null;
	blog_id: number | null;
	siteurl: string | null;
	has_downloads: boolean;
	issued_at: string;
	attached_at: string | null;
	revoked_at: string | null;
	owner_type: string | null;
	quantity: number | null;
	parent_license_id: number | null;
	meta: JetpackLicenseMeta | null;
	referral: unknown;
	subscription?: JetpackLicenseSubscription | null;
}

export interface FetchJetpackLicensesOptions {
	filter: string;
	search?: string;
	sortField: string;
	sortDirection: string;
}
