import { useEffect } from 'react';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';

type PatternsPageViewTrackerProps = {
	category: string;
	searchTerm: string;
};

export function PatternsPageViewTracker( { category, searchTerm }: PatternsPageViewTrackerProps ) {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );

	// `PageViewTracker` pushes a new event only when `path` changes, so we track
	// `calypso_pattern_library_search` to have accurate data on which search terms are used
	useEffect( () => {
		if ( searchTerm ) {
			recordTracksEvent( 'calypso_pattern_library_search', {
				is_logged_in: isLoggedIn ? '1' : '0',
				search_term: searchTerm,
				user_is_dev_account: isDevAccount ? '1' : '0',
			} );
		}
	}, [ isDevAccount, isLoggedIn, searchTerm ] );

	let path: string = '';
	const properties: Record< string, string > = {
		is_logged_in: isLoggedIn ? '1' : '0',
	};

	if ( ! category ) {
		path = searchTerm ? '/patterns/:search' : '/patterns';
	} else {
		path = searchTerm ? '/patterns/:category/:search' : '/patterns/:category';
		properties.category = category;
	}

	if ( searchTerm ) {
		properties.search_term = searchTerm;
	}

	return <PageViewTracker path={ path } properties={ properties } title="Pattern Library" />;
}
