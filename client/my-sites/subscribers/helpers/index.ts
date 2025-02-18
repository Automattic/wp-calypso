import { SubscribersFilterBy } from '../constants';
import { SubscriberListArgs } from '../types';

const getSubscribersCacheKey = (
	siteId: number | undefined | null,
	currentPage?: number,
	perPage?: number,
	search?: string,
	sortTerm?: string,
	filterOption?: string,
	filters?: SubscribersFilterBy[],
	hasManySubscribers?: boolean,
	timestamp?: number,
	sortOrder?: 'asc' | 'desc'
) => {
	const cacheKey = [ 'subscribers', siteId ];
	if ( currentPage ) {
		cacheKey.push( currentPage );
	}
	if ( perPage ) {
		cacheKey.push( 'per-page', perPage );
	}
	if ( search ) {
		cacheKey.push( 'search', search );
	}
	if ( sortTerm ) {
		cacheKey.push( 'sort-term', sortTerm );
	}
	if ( filterOption ) {
		cacheKey.push( 'filter-option', filterOption );
	}
	if ( filters?.length ) {
		cacheKey.push( 'filters', filters.join( ',' ) );
	}
	if ( timestamp ) {
		cacheKey.push( timestamp );
	}
	if ( sortOrder ) {
		cacheKey.push( 'sort-order', sortOrder );
	}
	if ( hasManySubscribers ) {
		cacheKey.push( 'many-subscribers' );
	}
	return cacheKey;
};

const getSubscribersQueryString = (
	pageNumber: number,
	search?: string,
	sortTerm?: string,
	filterOption?: string
): string => {
	const queryParams = [
		search ? `s=${ search }` : '',
		sortTerm ? `sort=${ sortTerm }` : '',
		filterOption ? `f=${ filterOption }` : '',
	];

	let queryString = queryParams.filter( ( param ) => !! param ).join( '&' );
	queryString = queryString ? `&${ queryString }` : '';

	return `page=${ pageNumber }${ queryString }`;
};

const getSubscribersUrl = (
	siteSlug: string | undefined | null,
	args: SubscriberListArgs
): string => {
	const { currentPage, searchTerm, sortTerm, filterOption } = args;
	const queryString = getSubscribersQueryString( currentPage, searchTerm, sortTerm, filterOption );

	return `/subscribers/${ siteSlug }?${ queryString }`;
};

const getSubscriberDetailsUrl = (
	siteSlug: string | undefined | null,
	subscriptionId: number | undefined,
	userId: number | undefined,
	args: SubscriberListArgs
): string => {
	const { currentPage, searchTerm, sortTerm, filterOption } = args;
	const queryString = getSubscribersQueryString( currentPage, searchTerm, sortTerm, filterOption );

	if ( userId ) {
		return `/subscribers/${ siteSlug }/${ userId }?${ queryString }`;
	}

	return `/subscribers/external/${ siteSlug }/${ subscriptionId }?${ queryString }`;
};

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
	getSubscriberDetailsUrl,
	getSubscriberDetailsType,
	getSubscribersCacheKey,
	getSubscribersUrl,
	sanitizeInt,
};
