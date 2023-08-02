import { useEffect } from 'react';
import { getStoredItem, setStoredItem } from 'calypso/lib/browser-storage';
import { useDispatch } from 'calypso/state';
import { WAS_STATE_RANDOMLY_CLEARED_KEY } from 'calypso/state/initial-state';
import { warningNotice } from 'calypso/state/notices/actions';

export function SympathyDevWarning() {
	const dispatch = useDispatch();

	const maybeNotifyDeveloperAndCleanup = async () => {
		const wasStateRandomlyCleared = await getStoredItem< boolean >(
			WAS_STATE_RANDOMLY_CLEARED_KEY
		);
		if ( wasStateRandomlyCleared ) {
			setTimeout( () => {
				// Read more about this (sympathy) :  https://github.com/Automattic/wp-calypso/pull/14121, p4TIVU-6Ed-p2
				// TLDR: We try to clear state randomly to match closely to the UX of our user i.e. Sympathy.
				// In other words, you cannot rely on user's persisted state to be reliable so we randomly clear it to simulate that experience.
				dispatch(
					warningNotice( 'DEV NOTICE: Persisted redux state was randomly cleared', {
						id: 'Sympathy-Dev-Warning',
						duration: 8000,
						showDismiss: true,
						displayOnNextPage: true,
					} )
				);
			}, 1200 );
			await setStoredItem( WAS_STATE_RANDOMLY_CLEARED_KEY, false );
		}
	};

	useEffect( () => {
		maybeNotifyDeveloperAndCleanup();
	}, [ maybeNotifyDeveloperAndCleanup ] );

	return null;
}

export default SympathyDevWarning;
