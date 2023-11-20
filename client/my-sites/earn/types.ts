import { SubscribersFilterBy, SubscribersSortBy } from '../subscribers/constants';

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
	f?: SubscribersFilterBy;
};

export type Query = {
	f: SubscribersFilterBy | undefined;
	sort: SubscribersSortBy | undefined;
	[ key: string ]: string | undefined;
};
