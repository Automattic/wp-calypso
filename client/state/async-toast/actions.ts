import wpcom from 'calypso/lib/wp';
import {
	ASYNC_TOAST_REQUEST,
	ASYNC_TOAST_REQUEST_SUCCESS,
	ASYNC_TOAST_REQUEST_FAILURE,
	ASYNC_TOAST_RECEIVE,
	ASYNC_TOAST_DELETE,
} from 'calypso/state/action-types';
import { SiteId } from 'calypso/types';
import type { AsyncToastKey, RawToastData } from './types';
import type { CalypsoDispatch } from 'calypso/state/types';

import 'calypso/state/async-toast/init';

export const requestAsyncToast = ( { siteId }: { siteId: SiteId } ) => {
	return ( dispatch: CalypsoDispatch ) => {
		dispatch( {
			type: ASYNC_TOAST_REQUEST,
			siteId: siteId,
		} );
		console.log( 'SITE ID' );
		console.log( siteId );
		return wpcom.req
			.get( `/async-toast/toasts/${ siteId }` )
			.then( ( data: RawToastData ) => {
				dispatch( {
					type: ASYNC_TOAST_RECEIVE,
					siteId: siteId,
					toasts: data.toasts,
				} );
				dispatch( {
					type: ASYNC_TOAST_REQUEST_SUCCESS,
				} );
			} )
			.catch( ( error: Error ) => {
				const errorMessage = error.message;
				console.log( 'GET TOAST ERROR' );
				dispatch( {
					type: ASYNC_TOAST_REQUEST_FAILURE,
					siteId: siteId,
					error: errorMessage,
				} );
			} );
	};
};

export function deleteAsyncToast( toastKey: AsyncToastKey, siteId: SiteId ) {
	return ( dispatch: CalypsoDispatch ) => {
		dispatch( {
			type: ASYNC_TOAST_DELETE,
			siteId,
			toastKey,
		} );

		return wpcom.req
			.get( `/async-toast/toasts/${ siteId }/${ String( toastKey ) }/delete` )
			.catch( ( error: Error ) => {
				const errorMessage = error.message;
			} );
	};
}
