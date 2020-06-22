/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';

export const dispatchFluxReceiveMediaItemSuccess = ( siteId, savedMediaItem ) =>
	Dispatcher.handleServerAction( {
		type: 'RECEIVE_MEDIA_ITEM',
		siteId,
		data: savedMediaItem,
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
