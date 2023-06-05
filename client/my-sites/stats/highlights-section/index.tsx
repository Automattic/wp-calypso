import {
	WeeklyHighlightCards,
	PAST_THIRTY_DAYS,
	BETWEEN_PAST_EIGHT_AND_FIFTEEN_DAYS,
	BETWEEN_PAST_THIRTY_ONE_AND_SIXTY_DAYS,
} from '@automattic/components';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { requestHighlights } from 'calypso/state/stats/highlights/actions';
import { getHighlights } from 'calypso/state/stats/highlights/selectors';
import { updateModulesSettings } from 'calypso/state/stats/modules-settings/actions';

export default function HighlightsSection( {
	siteId,
	currentPeriod,
}: {
	siteId: number;
	currentPeriod: string;
} ) {
	const dispatch = useDispatch();

	// Request new highlights whenever site ID changes.
	useEffect( () => {
		dispatch( requestHighlights( siteId ) );
	}, [ dispatch, siteId ] );

	const onUpdatePeriod = ( period: string ) => {
		dispatch(
			updateModulesSettings( siteId, {
				traffic: { highlights: { period_in_days: period === PAST_THIRTY_DAYS ? 30 : 7 } },
			} )
		);
	};

	const highlights = useSelector( ( state ) => getHighlights( state, siteId ) );
	const counts = useMemo(
		() => ( {
			comments: highlights[ currentPeriod ]?.comments ?? null,
			likes: highlights[ currentPeriod ]?.likes ?? null,
			views: highlights[ currentPeriod ]?.views ?? null,
			visitors: highlights[ currentPeriod ]?.visitors ?? null,
		} ),
		[ highlights, currentPeriod ]
	);
	const previousCounts = useMemo( () => {
		const comparePeriod =
			currentPeriod === PAST_THIRTY_DAYS
				? BETWEEN_PAST_THIRTY_ONE_AND_SIXTY_DAYS
				: BETWEEN_PAST_EIGHT_AND_FIFTEEN_DAYS;
		return {
			comments: highlights[ comparePeriod ]?.comments ?? null,
			likes: highlights[ comparePeriod ]?.likes ?? null,
			views: highlights[ comparePeriod ]?.views ?? null,
			visitors: highlights[ comparePeriod ]?.visitors ?? null,
		};
	}, [ highlights, currentPeriod ] );

	return (
		<WeeklyHighlightCards
			className="has-odyssey-stats-bg-color"
			counts={ counts }
			previousCounts={ previousCounts }
			showValueTooltip={ true }
			onClickComments={ () => null }
			onClickLikes={ () => null }
			onClickViews={ () => null }
			onClickVisitors={ () => null }
			onTogglePeriod={ onUpdatePeriod }
			currentPeriod={ currentPeriod }
		/>
	);
}
