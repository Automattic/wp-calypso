import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { SYMPATHY_DEV_WARNING_KEY } from 'calypso/state/initial-state';
import { warningNotice } from 'calypso/state/notices/actions';
import { getPersistedStateItem } from 'calypso/state/persisted-state';

export function SympathyDevWarning() {
	const dispatch = useDispatch();
	const { isStateRandomlyCleared } = getPersistedStateItem( SYMPATHY_DEV_WARNING_KEY );
	useEffect( () => {
		if ( isStateRandomlyCleared ) {
			setTimeout( () => {
				// Read more about this (sympathy) :  https://github.com/Automattic/wp-calypso/pull/14121, p4TIVU-6Ed-p2
				// TLDR: We try to clear state randomly to match closely to the UX of our user i.e. Sympathy.
				// In other words, you cannot rely on user's persisted state to be reliable so we randomly clear it to simulate that experience.
				return warningNotice( 'DEV NOTICE: Persisted redux state was randomly cleared', {
					id: 'Sympathy-Dev-Warning',
					duration: 8000,
					showDismiss: true,
					displayOnNextPage: true,
				} );
			}, 1200 );
		}
	}, [ isStateRandomlyCleared, dispatch ] );
	return null;
}

export default SympathyDevWarning;
