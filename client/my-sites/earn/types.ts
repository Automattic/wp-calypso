export type Product = {
	ID?: number;
	currency?: string;
	price?: number;
	title?: string;
	interval?: string;
	buyer_can_change_amount?: boolean;
	multiple_per_user?: boolean;
	welcome_email_content?: string;
	subscribe_as_site_subscriber?: boolean;
	renewal_schedule?: string;
	type?: string;
	is_editable?: boolean;
	tier?: number;
};

export type Coupon = {
	ID?: number;
	coupon_code?: string;
	cannot_be_combined?: boolean;
	can_be_combined?: boolean; // TODO: remove after backend migration to 'cannot_be_combined';
	first_time_purchase_only?: boolean;
	start_date?: string;
	end_date?: string;
	plan_ids_allow_list?: number[];
	limit_per_user?: number;
	use_duration?: boolean;
	use_email_allow_list?: boolean;
	duration?: string;
	email_allow_list?: string[];
	discount_type?: string;
	discount_value?: number;
	discount_percentage?: number;
	discount_currency?: string;
};

export type Query = {
	[ key: string ]: string;
};

export type Subscriber = {
	id: string;
	status: string;
	start_date: string;
	end_date: string;
	// appears as both subscriber.user_email & subscriber.user.user_email in this file
	user_email: string;
	user: {
		ID: string;
		name: string;
		user_email: string;
	};
	plan: {
		connected_account_product_id: string;
		title: string;
		renewal_price: number;
		currency: string;
		renew_interval: string;
	};
	renew_interval: string;
	all_time_total: number;
};
