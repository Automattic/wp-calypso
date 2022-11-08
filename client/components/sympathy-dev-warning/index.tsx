import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getStoredItem, setStoredItem } from 'calypso/lib/browser-storage';
import { IS_STATE_RANDOMLY_CLEARED_KEY } from 'calypso/state/initial-state';
import { warningNotice } from 'calypso/state/notices/actions';

export function SympathyDevWarning() {
	const dispatch = useDispatch();
	const [ isStateRandomlyCleared, setIsStateRandomlyCleared ] = useState( false );

	const loadIsClearedState = async () => {
		const loadedState = await getStoredItem< boolean >( IS_STATE_RANDOMLY_CLEARED_KEY );
		setIsStateRandomlyCleared( loadedState ?? false );
	};

	const notifyDeveloperAndCleanup = async () => {
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
		await setStoredItem( IS_STATE_RANDOMLY_CLEARED_KEY, false );
		setIsStateRandomlyCleared( false );
	};

	useEffect( () => {
		loadIsClearedState();
	}, [] );

	useEffect( () => {
		if ( isStateRandomlyCleared ) {
			notifyDeveloperAndCleanup();
		}
	}, [ isStateRandomlyCleared, dispatch, notifyDeveloperAndCleanup ] );

	return null;
}

export default SympathyDevWarning;
