import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { getTracksPatternType } from 'calypso/my-sites/patterns/lib/get-tracks-pattern-type';

export const useRecordPatternsEvent = () => {
	const { category, isGridView, patternTypeFilter } = usePatternsContext();

	return {
		recordPatternsEvent: (
			tracksEventName: string,
			params: Record< string, string | number | undefined > = {}
		) => {
			recordTracksEvent( tracksEventName, {
				category: category || undefined,
				type: getTracksPatternType( patternTypeFilter ),
				view: isGridView ? 'view' : 'list',
				...params,
			} );
		},
	};
};
