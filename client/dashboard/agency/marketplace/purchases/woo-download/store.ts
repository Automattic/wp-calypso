import { useSyncExternalStore } from 'react';

export interface WooDownloadRequest {
	licenseKey: string;
	productName: string;
	siteUrl: string;
	onClose?: () => void;
}

let current: WooDownloadRequest | null = null;
const listeners = new Set< () => void >();

function setCurrent( next: WooDownloadRequest | null ) {
	current = next;
	listeners.forEach( ( listener ) => listener() );
}

function subscribe( listener: () => void ) {
	listeners.add( listener );
	return () => {
		listeners.delete( listener );
	};
}

export function useWooDownloadRequest() {
	return useSyncExternalStore( subscribe, () => current );
}

/**
 * Opens the download step for a Woo extension that was just assigned. It lives outside the
 * assign modal because refetching the purchases drops that row's action, and the modal with it.
 * The modal is `WooDownloadModalHost`, which the agency layout mounts.
 */
export function openWooDownload( request: WooDownloadRequest ) {
	setCurrent( request );
}

export function closeWooDownload() {
	const onClose = current?.onClose;
	setCurrent( null );
	onClose?.();
}
