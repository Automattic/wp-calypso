import { useEffect } from 'react';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { getTracksPatternType } from 'calypso/my-sites/patterns/lib/get-tracks-pattern-type';
import { PatternView } from 'calypso/my-sites/patterns/types';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import type { AppState } from 'calypso/types';

type PatternsPageViewTrackerProps = {
	patternPermalinkName?: string;
	view?: PatternView;
	error?: string;
	patternsCount?: number;
};

export function PatternsPageViewTracker( {
	patternPermalinkName,
	view,
	error,
	patternsCount,
}: PatternsPageViewTrackerProps ) {
	const { category, searchTerm, patternTypeFilter, referrer } = usePatternsContext();
	const isLoggedIn = useSelector( isUserLoggedIn );

	// Default to `undefined` while user settings are loading
	const isDevAccount = useSelector( ( state: AppState ) => {
		if ( Object.keys( state.userSettings?.settings ?? {} ).length > 0 ) {
			return getUserSetting( state, 'is_dev_account' ) ?? false;
		}

		if ( state.userSettings.failed ) {
			return false;
		}

		return undefined;
	} );

	useEffect( () => {
		if ( isDevAccount !== undefined && patternsCount !== undefined ) {
			recordTracksEvent( 'calypso_pattern_library_view', {
				name: patternPermalinkName,
				category,
				is_logged_in: isLoggedIn,
				user_is_dev_account: isDevAccount ? '1' : '0',
				search_term: searchTerm || undefined,
				type: getTracksPatternType( patternTypeFilter ),
				view,
				referrer,
				error,
				num_patterns: searchTerm ? patternsCount : undefined,
			} );
		}
	}, [
		category,
		error,
		isDevAccount,
		isLoggedIn,
		patternsCount,
		patternPermalinkName,
		patternTypeFilter,
		referrer,
		searchTerm,
		view,
	] );

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
