/**
 * External dependencies
 */
import { assign } from 'lodash';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import MediaStore from './store';

/**
 * @typedef IMediaActions
 *
 * TODO: Better method types
 *
 * @property {Function} fetch
 */

/**
 * @type {IMediaActions}
 */
const MediaActions = {
	_fetching: {},
};

MediaActions.setQuery = function ( siteId, query ) {
	Dispatcher.handleViewAction( {
		type: 'SET_MEDIA_QUERY',
		siteId: siteId,
		query: query,
	} );
};

MediaActions.edit = function ( siteId, item ) {
	const newItem = assign( {}, MediaStore.get( siteId, item.ID ), item );

	Dispatcher.handleViewAction( {
		type: 'RECEIVE_MEDIA_ITEM',
		siteId: siteId,
		data: newItem,
	} );
};

export default MediaActions;
