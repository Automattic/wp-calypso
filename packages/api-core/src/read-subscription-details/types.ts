export enum EmailDeliveryFrequency {
	Instantly = 'instantly',
	Daily = 'daily',
	Weekly = 'weekly',
}

export type SiteSubscriptionDeliveryMethods = {
	email?: {
		send_posts: boolean;
		send_comments?: boolean;
		post_delivery_frequency: EmailDeliveryFrequency;
		date_subscribed?: Date;
	};
	notification?: {
		send_posts: boolean;
		send_comments?: boolean;
	};
};

export type SiteSubscriptionPaymentDetails = {
	is_comp: boolean;
	/** @deprecated Legacy field from the API — plans with is_gift are filtered out. */
	is_gift?: boolean;
	ID: string;
	site_id: string;
	status: string;
	start_date: string;
	end_date: string;
	renew_interval: string;
	renewal_price: string;
	currency: string;
	product_id: string;
	title: string;
};

export type SiteSubscriptionDetails< DateT = Date > = {
	ID: number;
	blog_ID: number;
	feed_ID: number;
	name: string;
	URL: string;
	site_icon: string | null;
	date_subscribed: DateT;
	subscriber_count: number;
	delivery_methods: SiteSubscriptionDeliveryMethods;
	payment_details: SiteSubscriptionPaymentDetails[];
};

export type ReadSubscriptionDetailsErrorResponse = {
	errors: {
		invalid_blog?: string[];
		invalid_user?: string[];
		subscription_not_found?: string[];
		unauthorized?: string[];
	};
	error_data: {
		invalid_blog?: { status: 404 };
		invalid_user?: { status: 403 };
		subscription_not_found?: { status: 404 };
		unauthorized?: { status: 401 };
	};
};

export type ReadSubscriptionDetailsResponse< DateT = Date > =
	| SiteSubscriptionDetails< DateT >
	| ReadSubscriptionDetailsErrorResponse;
