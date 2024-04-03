import { useEffect } from 'react';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getTracksPatternType } from 'calypso/my-sites/patterns/lib/get-tracks-pattern-type';
import { PatternTypeFilter, PatternView } from 'calypso/my-sites/patterns/types';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import type { AppState } from 'calypso/types';

type PatternsPageViewTrackerProps = {
	category: string;
	searchTerm?: string;
	patternTypeFilter?: PatternTypeFilter;
	view?: PatternView;
	referrer?: string;
	error?: string;
	patternsCount?: number;
};

export function PatternsPageViewTracker( {
	category,
	searchTerm,
	patternTypeFilter,
	view,
	referrer,
	error,
	patternsCount,
}: PatternsPageViewTrackerProps ) {
	const isLoggedIn = useSelector( isUserLoggedIn );

	// Default to `undefined` while user settings are loading
	const isDevAccount = useSelector( ( state: AppState ) => {
		if ( Object.keys( state.userSettings?.settings ?? {} ).length > 0 ) {
			return getUserSetting( state, 'is_dev_account' ) ?? false;
		}

		return undefined;
	} );

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
		if ( isDevAccount !== undefined && patternsCount !== undefined ) {
			recordTracksEvent( 'calypso_pattern_library_view', {
				category,
				is_logged_in: isLoggedIn,
				user_is_dev_account: isDevAccount ? '1' : '0',
				search_term: searchTerm,
				type: getTracksPatternType( patternTypeFilter ),
				view,
				referrer,
				error,
				num_patterns: searchTerm ? patternsCount : undefined,
			} );
		}

		// We want to avoid resubmitting the event whenever
		// `category` changes, which is why we deliberately don't include it in the dependency array
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isDevAccount, isLoggedIn, searchTerm, patternTypeFilter, view ] );

	let path: string = '';

	if ( ! category ) {
		path = '/patterns';
	} else {
		path = `/patterns/${ category }`;
	}

	if ( searchTerm ) {
		path += '/:search';
	}

	return (
		<>
			<QueryUserSettings />

			<PageViewTracker
				key={ path + searchTerm }
				path={ path }
				properties={ {
					is_logged_in: isLoggedIn,
				} }
				title="Pattern Library"
			/>
		</>
	);
}
