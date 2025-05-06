import config from '@automattic/calypso-config';
import { SubscribersFilterBy } from '../constants';
import type { Subscriber } from '../types';

const getSubscribersCacheKey = ( {
	siteId,
	page,
	perPage,
	search,
	sortTerm,
	filters,
	sortOrder,
	use_new_helper,
}: {
	siteId: number | undefined | null;
	page?: number;
	perPage?: number;
	search?: string;
	sortTerm?: string;
	filters?: SubscribersFilterBy[];
	sortOrder?: 'asc' | 'desc';
	use_new_helper?: boolean;
} ) => [
	'subscribers',
	siteId,
	page,
	perPage,
	search,
	sortTerm,
	filters,
	sortOrder,
	use_new_helper,
];

const getSubscriberDetailsCacheKey = (
	siteId: number | undefined | null,
	subscriptionId: number | undefined,
	userId: number | undefined,
	type: string
) => [ 'subscriber-details', siteId, subscriptionId, userId, type ];

const getSubscriberDetailsType = ( userId: number | undefined ) => ( userId ? 'wpcom' : 'email' );

const getSubscriptionIdFromSubscriber = ( subscriber: Subscriber ): number | string => {
	const useNewHelper = config.isEnabled( 'subscribers-helper-library' );
	if ( useNewHelper ) {
		return (
			subscriber.email_subscription_id ||
			subscriber.subscription_id ||
			subscriber.wpcom_subscription_id ||
			0
		);
	}
	return subscriber.subscription_id || 0;
};

export {
	getSubscriberDetailsCacheKey,
	getSubscriberDetailsType,
	getSubscribersCacheKey,
	getSubscriptionIdFromSubscriber,
};
