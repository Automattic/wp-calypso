import { SiteId } from 'calypso/types';

export type AsyncToastKey = string;

export enum AsyncToastSeverity {
	AsyncToastError = 'error',
	AsyncToastWarn = 'warn',
	AsyncToastSuccess = 'success',
}

export interface AsyncToast {
	message: string;
	severity: AsyncToastSeverity;
}

export type AsyncToastRecord = Record< SiteId, Record< AsyncToastKey, AsyncToast > >;

export interface AsyncToastState {
	toasts: AsyncToastRecord;
	isRequesting: boolean;
	isStale: boolean;
}

export interface RawToastData {
	toasts: AsyncToastRecord;
}

export function lookupToastForSiteByKey( {
	toasts,
	siteId,
	toastKey,
}: {
	toasts: AsyncToastRecord;
	siteId: SiteId | null;
	toastKey: AsyncToastKey;
} ): AsyncToast | null {
	console.log( toasts );
	console.log( siteId );
	console.log( toastKey );
	if ( siteId === null || siteId === undefined ) {
		return null;
	}
	return toasts?.[ siteId ]?.[ toastKey ] ?? null;
}
