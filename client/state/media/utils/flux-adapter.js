/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';

export const dispatchFluxCreateMediaItem = ( transientMedia, site ) =>
	Dispatcher.handleViewAction( {
		type: 'CREATE_MEDIA_ITEM',
		siteId: site.ID,
		data: transientMedia,
		site,
	} );

export const dispatchFluxReceiveMediaItemSuccess = ( transientMediaId, siteId, savedMediaItem ) =>
	Dispatcher.handleServerAction( {
		type: 'RECEIVE_MEDIA_ITEM',
		id: transientMediaId,
		siteId,
		data: savedMediaItem,
	} );

export const dispatchFluxReceiveMediaItemError = ( transientMediaId, siteId, error ) =>
	Dispatcher.handleServerAction( {
		type: 'RECEIVE_MEDIA_ITEM',
		id: transientMediaId,
		siteId,
		error,
	} );

export const dispatchFluxUpdateMediaItem = ( siteId, updatedMediaItem ) => {
	Dispatcher.handleViewAction( {
		type: 'RECEIVE_MEDIA_ITEM',
		siteId,
		data: updatedMediaItem,
	} );
};

export const dispatchFluxUpdateMediaItemSuccess = ( siteId, updatedMediaItem ) => {
	Dispatcher.handleServerAction( {
		type: 'RECEIVE_MEDIA_ITEM',
		siteId,
		data: updatedMediaItem,
	} );
};

export const dispatchFluxUpdateMediaItemError = ( siteId, error ) => {
	Dispatcher.handleServerAction( {
		type: 'RECEIVE_MEDIA_ITEM',
		siteId,
		error,
	} );
};

export const dispatchFluxRemoveMediaItem = ( siteId, mediaItem ) => {
	Dispatcher.handleViewAction( {
		type: 'REMOVE_MEDIA_ITEM',
		siteId: siteId,
		data: mediaItem,
	} );
};

export const dispatchFluxRemoveMediaItemSuccess = ( siteId, mediaItem ) => {
	Dispatcher.handleServerAction( {
		type: 'REMOVE_MEDIA_ITEM',
		siteId,
		data: mediaItem,
	} );
};

export const dispatchFluxRemoveMediaItemError = ( siteId, error ) => {
	Dispatcher.handleViewAction( {
		type: 'REMOVE_MEDIA_ITEM',
		siteId,
		error,
	} );
};

export const dispatchFluxFetchMediaLimits = ( siteId ) =>
	Dispatcher.handleServerAction( { type: 'FETCH_MEDIA_LIMITS', siteId } );
