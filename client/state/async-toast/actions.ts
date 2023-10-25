import { ASYNC_TOAST_REQUEST, ASYNC_TOAST_DELETE } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/async-toast';
import { SiteId } from 'calypso/types';
import { RequestAsyncToastActionType, DeleteAsyncToastActionType } from './types';

export function requestAsyncToast( siteId: SiteId ): RequestAsyncToastActionType {
	return {
		type: ASYNC_TOAST_REQUEST,
		siteId,
	};
}

export function deleteAsyncToast( siteId: SiteId, toastKey: string ): DeleteAsyncToastActionType {
	return {
		type: ASYNC_TOAST_DELETE,
		siteId,
		toastKey,
	};
}
