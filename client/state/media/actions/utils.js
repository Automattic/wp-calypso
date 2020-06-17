/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';

/**
 * Constants
 */
const ONE_YEAR_IN_MILLISECONDS = 31540000000;

export const getBaseTime = () => Date.now() + ONE_YEAR_IN_MILLISECONDS;
export const getTransientDate = ( baseTime = getBaseTime(), index = 0, fileCount = 1 ) =>
	new Date( baseTime - ( fileCount - index ) ).toISOString();

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

export const dispatchFluxFetchMediaLimits = ( siteId ) =>
	Dispatcher.handleServerAction( { type: 'FETCH_MEDIA_LIMITS', siteId } );
