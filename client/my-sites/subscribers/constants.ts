export enum SubscribersSortBy {
	Name = 'name',
	DateSubscribed = 'date_subscribed',
	Plan = 'plan',
	EmailSubscriber = 'is_email_subscriber',
}

export enum SubscribersFilterBy {
	All = 'all',
	Email = 'email',
	WPCOM = 'wpcom',
	Free = 'free',
	Paid = 'paid',
	EmailSubscriber = 'email_subscriber',
	ReaderSubscriber = 'reader_subscriber',
}

export const DEFAULT_PER_PAGE = 10;
