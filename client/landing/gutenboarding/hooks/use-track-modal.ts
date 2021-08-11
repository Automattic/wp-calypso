import { useEffect } from 'react';
import { recordEnterModal, recordCloseModal } from '../lib/analytics';
import { useOnUnmount } from './use-on-unmount';
import type { TracksEventProperties } from '../lib/analytics/types';

/**
 * Records events in tracks on opening and closing the modal
 * When closing the modal, additional properties can be recorded e.g. which domain was selected.
 *
 * @param modalName The name of the modal as will be sent to tracks
 * @param getEventProperties Returns additional properties to be recorded on completing the modal
 */
export function useTrackModal(
	modalName: string,
	getEventProperties?: () => TracksEventProperties
) {
	useOnUnmount( () => {
		recordCloseModal( modalName, getEventProperties && getEventProperties() );
	} );
	useEffect( () => {
		recordEnterModal( modalName );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps
}
