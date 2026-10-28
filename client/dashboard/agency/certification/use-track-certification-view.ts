import { useEffect, useRef } from 'react';
import type { CertificationSource } from './constants';
import type { RecordTracksEvent } from '../tiers/types';

/**
 * Records one view per mount, once the card has a code to show, so copies and
 * exam clicks can be read against how many agencies saw the code.
 */
export function useTrackCertificationView(
	isEligible: boolean,
	source: CertificationSource,
	recordTracksEvent?: RecordTracksEvent
) {
	const hasRecorded = useRef( false );

	useEffect( () => {
		if ( ! isEligible || hasRecorded.current ) {
			return;
		}
		hasRecorded.current = true;
		recordTracksEvent?.( 'calypso_a4a_certification_view', { source } );
	}, [ isEligible, source, recordTracksEvent ] );
}
