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
		apiNamespace: 'wpcom/v2',
		onSuccess: action,
		onFailure: action,
	} );
};

export const fromApi = ( { cards } ) => {
	const sites = cards
		.filter( ( card ) => card.type === 'post' )
		.map( ( card ) => ( {
			feedId: card.data.feed_ID,
			blogId: card.data.site_ID,
			title: decodeEntities( card.data.site_name ),
			url: card.data.site_URL,
		} ) );
	return sites;
};

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
