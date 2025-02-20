import { SubscribersFilterBy } from '../constants';

const getSubscribersCacheKey = ( {
	siteId,
	page,
	perPage,
	search,
	sortTerm,
	filters,
	sortOrder,
}: {
	siteId: number | undefined | null;
	page?: number;
	perPage?: number;
	search?: string;
	sortTerm?: string;
	filters?: SubscribersFilterBy[];
	sortOrder?: 'asc' | 'desc';
} ) => [ 'subscribers', siteId, page, perPage, search, sortTerm, filters, sortOrder ];

const getSubscriberDetailsCacheKey = (
	siteId: number | undefined | null,
	subscriptionId: number | undefined,
	userId: number | undefined,
	type: string
) => [ 'subscriber-details', siteId, subscriptionId, userId, type ];

const sanitizeInt = ( intString: string ) => {
	const parsedInt = parseInt( intString, 10 );
	return ! Number.isNaN( parsedInt ) && parsedInt > 0 ? parsedInt : undefined;
};

const getSubscriberDetailsType = ( userId: number | undefined ) => ( userId ? 'wpcom' : 'email' );

export {
	getSubscriberDetailsCacheKey,
	getSubscriberDetailsType,
	getSubscribersCacheKey,
	sanitizeInt,
};
