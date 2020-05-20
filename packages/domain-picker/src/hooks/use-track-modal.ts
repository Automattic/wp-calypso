/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * Internal dependencies
 */
import { useOnUnmount } from './use-on-unmount';

/**
 * Records events in tracks on opening and closing the modal
 * When closing the modal, additional properties can be recorded e.g. which domain was selected.
 *
 * @param modalName The name of the modal as will be sent to tracks
 * @param onModalOpen called when the modal opens
 * @param onModalUnmount called when the modal unmounts
 * @param eventProperties Returns additional properties to be recorded on completing the modal
 */
export function useTrackModal(
	modalName: string,
	onModalOpen: Function,
	onModalUnmount: Function,
	eventProperties: { selected_domain?: string }
) {
	useOnUnmount( () => {
		onModalUnmount?.( modalName, eventProperties );
	} );
	useEffect( () => {
		onModalOpen?.( modalName );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps
}
