import { SubscribersFilterBy } from '../constants';

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

export { getSubscriberDetailsCacheKey, getSubscriberDetailsType, getSubscribersCacheKey };
