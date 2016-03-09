/**
 * Internal dependencies
 */
import { RECORDS_LIST_KEY } from '../constants';

/**
 * Keys
 */
export const postListKey = 'sync-record-c8234aa4facc43d9bf2a2ef4037c595200f282f2';
export const postListNextPageKey = 'sync-record-e1e623dc2933ed96ead4b0508b053660cd4542c3';
export const postListDifferentKey = 'sync-record-5c73482c2934a7f40601935c92e734748026fe70';

export const postListPageSeriesKey = 'sync-record-c8234aa4facc43d9bf2a2ef4037c595200f282f2';
export const postListPageSeriesKeyDifferent = 'sync-record-5c73482c2934a7f40601935c92e734748026fe70';

/*
 * Request Parameters
 */

export const postListParams = {
	apiVersion: '1.1',
	method: 'GET',
	path: '/sites/bobinprogress.wordpress.com/posts',
	query: 'status=publish%2Cprivate&order_by=date&order=DESC&author=6617482&type=post&site_visibility=visible&meta=counts',
};

export const postListParamsDifferentOrder = {
	apiVersion: '1.1',
	method: 'GET',
	path: '/sites/bobinprogress.wordpress.com/posts',
	query: 'order_by=date&order=DESC&author=6617482&type=post&site_visibility=visible&meta=counts&status=publish%2Cprivate',
};

export const postListParamsNextPage = {
	apiVersion: '1.1',
	method: 'GET',
	path: '/sites/bobinprogress.wordpress.com/posts',
	query: 'status=publish%2Cprivate&order_by=date&order=DESC&author=6617482&type=post&site_visibility=visible&meta=counts&page_handle=2014-11-24T13%3A39%3A39-08%3A00%26id=1307',
};

export const postListParamsDifferent = Object.assign( {}, postListParams, { query: 'filter=test' } );

export const nonWhiteListedRequest = {
	apiVersion: '1.1',
	method: 'GET',
	path: '/not-whitelisted',
};

/*
 * Response Bodies
 */

export const postListResponseBody = {
	found: 2,
	meta: {
		data: {},
		links: {},
		next_page: 'value=2014-11-24T13%3A39%3A39-08%3A00&id=9900',
	},
	posts: [
		{ ID: 9900 },
		{ ID: 9901 },
	],
};

export const postListResponseBodyNextPage = {
	found: 3,
	meta: {
		data: {},
		links: {},
		next_page: 'value=2014-10-24T13%3A39%3A39-08%3A00&id=9897',
	},
	posts: [
		{ ID: 9897 },
		{ ID: 9898 },
		{ ID: 9899}
	],
};

export const postListResponseBodyDifferent = {
	found: 2,
	meta: {
		data: {},
		links: {},
		next_page: 'value=2015-11-24T13%3A39%3A39-08%3A00&id=2000',
	},
	posts: [
		{ ID: 2000 },
		{ ID: 2001 },
	],
};

export const postListResponseBodyFresh = {
	found: 3,
	meta: {
		data: {},
		links: {},
		next_page: 'value=2014-11-26T13%3A39%3A39-08%3A00&id=9899',
	},
	posts: [
		{ ID: 9899 },
		{ ID: 9900 },
		{ ID: 9901 },
	]
}

export const postListResponseBodyNoHandle = Object.assign( {}, postListResponseBody, { meta: {} } );

/*
 * Local Data
 */

export const postListLocalRecord = {
	__sync: {
		key: postListKey,
		synced: 1457329263679,
		syncing: false,
	},
	body: postListResponseBody,
	params: Object.assign( {}, postListParams ),
};

export const postListLocalRecordNextPage = {
	__sync: {
		key: postListNextPageKey,
		synced: 1457329263679,
		syncing: false,
	},
	body: postListResponseBodyNextPage,
	params: Object.assign( {}, postListParamsNextPage ),
};

export const postListLocalRecordDifferent = {
	__sync: {
		key: postListDifferentKey,
		synced: 1457329263679,
		syncing: false,
	},
	body: postListResponseBodyDifferent,
	params: Object.assign( {}, postListParamsDifferent ),
};

export const recordsList = [
	{
		key: postListKey,
		pageSeriesKey: postListPageSeriesKey,
		timestamp: 1457329204357,
	},
	{
		key: postListNextPageKey,
		pageSeriesKey: postListPageSeriesKey,
		timestamp: 1457329263835,
	},
	{
		key: postListDifferentKey,
		pageSeriesKey: postListPageSeriesKeyDifferent,
		timestamp: 1457329442428,
	},
];

export const localDataFull = {
	[ postListKey ]: postListLocalRecord,
	[ postListNextPageKey ]: postListLocalRecordNextPage,
	[ postListDifferentKey ]: postListLocalRecordDifferent,
	[ RECORDS_LIST_KEY ]: recordsList,
}
