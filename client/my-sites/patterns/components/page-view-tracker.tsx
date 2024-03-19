import { useEffect } from 'react';
import { useDebounce } from 'use-debounce';
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
	// We debounce the search term because search happens instantaneously, without the user
	// submitting the search form
	const [ debouncedSeachTerm ] = useDebounce( searchTerm, 1500 );

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
		if ( debouncedSeachTerm ) {
			recordTracksEvent( 'calypso_pattern_library_search', {
				category,
				is_logged_in: isLoggedIn,
				user_is_dev_account: isDevAccount ? '1' : '0',
				search_term: debouncedSeachTerm,
			} );
		}

		// We want to avoid resubmitting the `calypso_pattern_library_search` event whenever
		// `category` changes, which is why we deliberately don't include it in the dependency array
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isDevAccount, isLoggedIn, debouncedSeachTerm ] );

	let path: string = '';
	const properties: Record< string, string | boolean > = {
		is_logged_in: isLoggedIn,
	};

	if ( ! category ) {
		path = '/patterns';
	} else {
		path = `/patterns/${ category }`;
	}

	if ( debouncedSeachTerm ) {
		path += '/:search';
	}

	const key = path + debouncedSeachTerm;

	return (
		<PageViewTracker key={ key } path={ path } properties={ properties } title="Pattern Library" />
	);
}
