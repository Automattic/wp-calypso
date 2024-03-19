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

	useEffect( () => {
		if ( category ) {
			recordTracksEvent( 'calypso_pattern_library_filter', {
				category,
				is_logged_in: isLoggedIn,
				user_is_dev_account: isDevAccount ? '1' : '0',
			} );
		}
	}, [ category, isDevAccount, isLoggedIn ] );

	useEffect( () => {
		if ( searchTerm ) {
			recordTracksEvent( 'calypso_pattern_library_search', {
				category,
				is_logged_in: isLoggedIn,
				user_is_dev_account: isDevAccount ? '1' : '0',
				search_term: searchTerm,
			} );
		}

		// We want to avoid resubmitting the `calypso_pattern_library_search` event whenever
		// `category` changes, which is why we deliberately don't include it in the dependency array
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isDevAccount, isLoggedIn, searchTerm ] );

	let path: string = '';
	const properties: Record< string, string | boolean > = {
		is_logged_in: isLoggedIn,
	};

	if ( ! category ) {
		path = '/patterns';
	} else {
		path = `/patterns/${ category }`;
	}

	if ( searchTerm ) {
		path += '/:search';
	}

	return <PageViewTracker path={ path } properties={ properties } title="Pattern Library" />;
}
