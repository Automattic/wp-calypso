import { useEffect } from 'react';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { getTracksPatternType } from 'calypso/my-sites/patterns/lib/get-tracks-pattern-type';
import { PatternView } from 'calypso/my-sites/patterns/types';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

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

	useEffect( () => {
		if ( patternsCount !== undefined ) {
			recordTracksEvent( 'calypso_pattern_library_view', {
				name: patternPermalinkName,
				category,
				is_logged_in: isLoggedIn,
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
		<PageViewTracker
			key={ path + searchTerm }
			path={ path }
			properties={ {
				is_logged_in: isLoggedIn,
			} }
			title="Pattern Library"
		/>
	);
}
