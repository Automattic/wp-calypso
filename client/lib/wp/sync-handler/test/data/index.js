/**
 * Internal dependencies
 */
import { RECORDS_LIST_KEY } from '../../constants';

/**
 * Keys -- these have been pre-generated using generateKey and generatePageSeriesKey
 */
export const postListKey = 'sync-record-8545d21d82beef8dbda3a4fdb65ba46df49095b3';
export const postListNextPageKey = 'sync-record-0dbda4d37a524b7e03baedfd803821556e623b8f';
export const postListDifferentSiteKey = 'sync-record-47c8614e439761ed4406915f31bc16b06ce5181e';
export const postListWithSearchKey = 'sync-record-5c73482c2934a7f40601935c92e734748026fe70';

export const postListPageSeriesKey = 'sync-record-8545d21d82beef8dbda3a4fdb65ba46df49095b3';
export const postListDifferentPageSeriesKey = 'sync-record-5c73482c2934a7f40601935c92e734748026fe70';

/*
 * Request Parameters
 */

export const postListSiteId = 'bobinprogress.wordpress.com';
export const postListParams = {
	apiVersion: '1.1',
	method: 'GET',
	path: `/sites/${ postListSiteId }/posts`,
	query: 'status=publish%2Cprivate&order_by=date&order=DESC&author=6617482&type=post&site_visibility=visible&meta=counts',
};

// the same query parameters but in a different order
export const postListDifferentOrderParams = {
	apiVersion: '1.1',
	method: 'GET',
	path: `/sites/${ postListSiteId }/posts`,
	query: 'order_by=date&order=DESC&author=6617482&type=post&site_visibility=visible&meta=counts&status=publish%2Cprivate',
};

// the same parameters, but with a page_handle
export const postListNextPageParams = {
	apiVersion: '1.1',
	method: 'GET',
	path: `/sites/${ postListSiteId }/posts`,
	query: 'status=publish%2Cprivate&order_by=date&order=DESC&author=6617482&type=post&site_visibility=visible&meta=counts&page_handle=2014-11-24T13%3A39%3A39-08%3A00%26id=1307',
};

// the same post-list request but against a different site
export const postListDifferentSiteParams = Object.assign( {}, postListParams, { path: '/sites/bobinprogress2.wordpress.com/posts' } );

export const postListWithSearchParams = Object.assign( {}, postListParams, { query: 'search=test' } );

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

export const postListNextPageResponseBody = {
	found: 3,
	meta: {
		data: {},
		links: {},
		next_page: 'value=2014-10-24T13%3A39%3A39-08%3A00&id=9897',
	},
	posts: [
		{ ID: 9897 },
		{ ID: 9898 },
		{ ID: 9899 }
	],
};

export const postListDifferentSiteResponseBody = {
	found: 1,
	meta: {
		data: {},
		links: {},
		next_page: 'value=2015-11-24T13%3A39%3A39-08%3A00&id=1234',
	},
	posts: [
		{ ID: 1234 }
	],
};

export const postListWithSearchResponseBody = {
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

export const postListFreshResponseBody = {
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
};

export const postListNoHandleResponseBody = Object.assign( {}, postListResponseBody, { meta: {} } );

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

export const postListNextPageLocalRecord = {
	__sync: {
		key: postListNextPageKey,
		synced: 1457329263679,
		syncing: false,
	},
	body: postListNextPageResponseBody,
	params: Object.assign( {}, postListNextPageParams ),
};

export const postListDifferentSiteLocalRecord = {
	__sync: {
		key: postListDifferentSiteKey,
		synced: 1457329263679,
		syncing: false,
	},
	body: postListDifferentSiteResponseBody,
	params: Object.assign( {}, postListDifferentSiteParams ),
};

export const postListWithSearchLocalRecord = {
	__sync: {
		key: postListWithSearchKey,
		synced: 1457329263679,
		syncing: false,
	},
	body: postListWithSearchResponseBody,
	params: Object.assign( {}, postListWithSearchParams ),
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
		key: postListWithSearchKey,
		pageSeriesKey: postListDifferentPageSeriesKey,
		timestamp: 1457329442428,
	},
];

export const localDataFull = {
	[ postListKey ]: postListLocalRecord,
	[ postListNextPageKey ]: postListNextPageLocalRecord,
	[ postListWithSearchKey ]: postListWithSearchLocalRecord,
	[ RECORDS_LIST_KEY ]: recordsList,
};
