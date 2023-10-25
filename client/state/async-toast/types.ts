import { ASYNC_TOAST_REQUEST, ASYNC_TOAST_DELETE } from 'calypso/state/action-types';
import { SiteId } from 'calypso/types';

/**
 * AsyncToastMap stores the current set of async toasts for the user.
 * It is effectively a cache of the response of and API endpoint call.
 *
 * It maps from a site ID and a _toast key_ to a toast object, which
 * comprises a message string and a severity. Components that wish to
 * display an async toast use the key to specify which messages they're
 * interested in.
 */
export type AsyncToastMap = Map< SiteId, Map< AsyncToastKey, AsyncToast > >;

export type AsyncToastKey = string;

export interface AsyncToast {
	message: string;
	severity: AsyncToastSeverity;
}

export enum AsyncToastSeverity {
	Error = 'error',
	Warning = 'warning',
	Info = 'info',
	Success = 'success',
}

/**
 * AsyncToastState carries both the map of toast data and flags
 * which control when requests are made to refresh the cache.
 */
export interface AsyncToastState {
	toasts: AsyncToastMap;
	isRequesting: boolean;
	isStale: boolean;
	lastFetch: number; // unix timestamp
}

export interface RequestAsyncToastActionType {
	type: typeof ASYNC_TOAST_REQUEST;
	siteId: SiteId;
}

export interface DeleteAsyncToastActionType {
	type: typeof ASYNC_TOAST_DELETE;
	siteId: SiteId;
	toastKey: string;
}
