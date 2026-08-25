import { useEffect, useRef } from '@wordpress/element';
import { ImageStudioMode } from '../types';
import { getImageStudioRequestErrorType, trackImageStudioError } from '../utils/tracking';

export function useImageStudioErrorTracking(
	error: string | null,
	mode: ImageStudioMode,
	attachmentId?: number
): void {
	const lastTrackedError = useRef< string | null >( null );

	useEffect( () => {
		if ( ! error ) {
			// useAgentChat clears errors when a new request starts, including retries of the same request.
			lastTrackedError.current = null;
			return;
		}

		if ( lastTrackedError.current === error ) {
			return;
		}

		lastTrackedError.current = error;
		trackImageStudioError( {
			mode,
			errorType: getImageStudioRequestErrorType( error, mode ),
			attachmentId,
		} );
	}, [ error, mode, attachmentId ] );
}
