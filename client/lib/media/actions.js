/**
 * External dependencies
 */
import { assign } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:media' );

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import { reduxDispatch } from 'lib/redux-bridge';
import MediaStore from './store';
import { changeMediaSource } from 'state/media/actions';

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

MediaActions.sourceChanged = function ( siteId ) {
	debug( 'Media data source changed' );
	Dispatcher.handleViewAction( {
		type: 'CHANGE_MEDIA_SOURCE',
		siteId,
	} );
	reduxDispatch( changeMediaSource( siteId ) );
};

export default MediaActions;
