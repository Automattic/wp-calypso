import { trackImageStudioUpgradeNoticeClick } from './tracking';
import type { ImageStudioMode } from '../types';

export function openImageStudioUpgradeUrl( url: string, mode: ImageStudioMode ): void {
	try {
		trackImageStudioUpgradeNoticeClick( { mode } );
	} catch {
		// Analytics must never block checkout navigation.
	}

	const newWindow = window.open( url, '_blank' );
	if ( newWindow ) {
		newWindow.opener = null;
	}
}
