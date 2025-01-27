import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

export const READER_FOLLOWING_VIEW_PREFERENCE = 'reader_following_view';
export type ReaderFollowingView = 'recent' | 'stream';
export const DEFAULT_VIEW: ReaderFollowingView = 'stream';

export const useFollowingView = () => {
	const dispatch = useDispatch();
	const currentView: ReaderFollowingView = useSelector(
		( state ) => getPreference( state, READER_FOLLOWING_VIEW_PREFERENCE ) ?? DEFAULT_VIEW
	);

	const setView = ( view: ReaderFollowingView ) => {
		dispatch( savePreference( READER_FOLLOWING_VIEW_PREFERENCE, view ) );
		recordTracksEvent( 'calypso_reader_following_view_toggle', {
			view: view,
		} );
	};

	return { currentView, setView };
};
