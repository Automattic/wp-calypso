import { transferFailureStates, transferStates } from 'calypso/state/automated-transfer/constants';

export type ThankYouError = 'transfer-failed' | 'timeout' | null;

export function getThankYouError( {
	transferStatus,
	hasTimedOut,
	isPageReady,
}: {
	transferStatus: string | null;
	hasTimedOut: boolean;
	isPageReady: boolean;
} ): ThankYouError {
	if ( isPageReady ) {
		return null;
	}

	if ( transferFailureStates.includes( transferStatus ) ) {
		return 'transfer-failed';
	}

	if ( transferStatus === transferStates.CLIENT_TIMEOUT || hasTimedOut ) {
		return 'timeout';
	}

	return null;
}
