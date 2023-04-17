import { decodeEntities } from 'calypso/lib/formatting';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { READER_RELATED_SITES_REQUEST } from 'calypso/state/reader/action-types';
import { receiveRelatedSites } from 'calypso/state/reader/related-sites/actions';

const noop = () => {};

export const requestRelatedSites = ( action ) => {
	const { tag = '', number = 10, offset = 0 } = action.payload;
	return http( {
		method: 'GET',
		path: `/read/tags/${ tag }/cards`,
		query: { number, offset, posts_per_site: 0 },
		apiVersion: '1.2',
		onSuccess: action,
		onFailure: action,
	} );
};

export const fromApi = ( { algorithm, sites } ) =>
	sites.map( ( site ) => ( {
		feedId: site.feed_id,
		blogId: site.blog_id,
		title: decodeEntities( site.blog_title ),
		url: site.blog_url,
		railcar: site.railcar,
		algorithm,
	} ) );

export const addRelatedSites = ( { payload: { tag, offset } }, sites ) =>
	receiveRelatedSites( { sites, tag, offset } );

registerHandlers( 'state/data-layer/wpcom/read/related/sites/index.js', {
	[ READER_RELATED_SITES_REQUEST ]: [
		dispatchRequest( {
			fetch: requestRelatedSites,
			onSuccess: addRelatedSites,
			onError: noop,
			fromApi,
		} ),
	],
} );
