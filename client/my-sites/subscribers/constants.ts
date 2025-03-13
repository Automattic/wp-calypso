export enum SubscribersSortBy {
	Name = 'name',
	DateSubscribed = 'date_subscribed',
	Plan = 'plan',
	SubscriptionStatus = 'subscription_status',
}

export enum SubscribersFilterBy {
	All = 'all',
	Email = 'email',
	WPCOM = 'wpcom',
	Free = 'free',
	Paid = 'paid',
	ReaderSubscriber = 'reader_subscriber',
	UnconfirmedSubscriber = 'unconfirmed_subscriber',
	EmailSubscriber = 'email_subscriber',
	BlockedSubscriber = 'blocked_subscriber',
}

export const DEFAULT_PER_PAGE = 10;
