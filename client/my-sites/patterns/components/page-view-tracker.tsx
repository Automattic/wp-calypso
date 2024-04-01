import { useEffect, useState } from 'react';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { getTracksPatternType } from '../lib/get-tracks-pattern-type';
import { PatternTypeFilter, PatternView } from '../types';
import type { AppState } from 'calypso/types';

type PatternsPageViewTrackerProps = {
	category: string;
	searchTerm?: string;
	patternTypeFilter?: PatternTypeFilter;
	view?: PatternView;
	referrer?: string;
	error?: string;
};

export function PatternsPageViewTracker( {
	category,
	searchTerm,
	patternTypeFilter,
	view,
	referrer,
	error,
}: PatternsPageViewTrackerProps ) {
	const isLoggedIn = useSelector( isUserLoggedIn );
	// Default to `undefined` while user settings are loading
	const isDevAccount = useSelector( ( state: AppState ) => {
		if ( Object.keys( state.userSettings?.settings ?? {} ).length > 0 ) {
			return getUserSetting( state, 'is_dev_account' ) ?? false;
		}

		return undefined;
	} );
	const [ debouncedSearchTerm, setDebouncedSearchTerm ] = useState( searchTerm );

	// We debounce the search term because search happens instantaneously, without the user
	// submitting the search form
	useEffect( () => {
		const timeoutId = window.setTimeout( () => {
			setDebouncedSearchTerm( searchTerm );
		}, 1500 );

		return () => {
			window.clearTimeout( timeoutId );
		};
	}, [ searchTerm ] );

	useEffect( () => {
		if ( category && isDevAccount !== undefined ) {
			recordTracksEvent( 'calypso_pattern_library_filter', {
				category,
				is_logged_in: isLoggedIn,
				user_is_dev_account: isDevAccount ? '1' : '0',
				type: getTracksPatternType( patternTypeFilter ),
			} );
		}
	}, [ category, isDevAccount, isLoggedIn, patternTypeFilter ] );

	useEffect( () => {
		if ( isDevAccount !== undefined ) {
			recordTracksEvent( 'calypso_pattern_library_view', {
				category,
				is_logged_in: isLoggedIn,
				user_is_dev_account: isDevAccount ? '1' : '0',
				search_term: debouncedSearchTerm,
				type: getTracksPatternType( patternTypeFilter ),
				view,
				referrer,
				error,
			} );
		}

		// We want to avoid resubmitting the event whenever
		// `category` changes, which is why we deliberately don't include it in the dependency array
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isDevAccount, isLoggedIn, debouncedSearchTerm, patternTypeFilter, view ] );

	let path: string = '';

	if ( ! category ) {
		path = '/patterns';
	} else {
		path = `/patterns/${ category }`;
	}

	if ( debouncedSearchTerm ) {
		path += '/:search';
	}

	return (
		<>
			<QueryUserSettings />

			<PageViewTracker
				key={ path + debouncedSearchTerm }
				path={ path }
				properties={ {
					is_logged_in: isLoggedIn,
				} }
				title="Pattern Library"
			/>
		</>
	);
}
