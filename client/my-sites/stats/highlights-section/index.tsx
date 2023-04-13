import { HighlightCards } from '@automattic/components';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestHighlights } from 'calypso/state/stats/highlights/actions';
import { getHighlights } from 'calypso/state/stats/highlights/selectors';

export default function HighlightsSection( { siteId }: { siteId: number } ) {
	const dispatch = useDispatch();

	// Request new highlights whenever site ID changes.
	useEffect( () => {
		dispatch( requestHighlights( siteId ) );
	}, [ dispatch, siteId ] );

	const highlights = useSelector( ( state ) => getHighlights( state, siteId ) );
	const counts = useMemo(
		() => ( {
			comments: highlights?.past_seven_days?.comments ?? null,
			likes: highlights?.past_seven_days?.likes ?? null,
			views: highlights?.past_seven_days?.views ?? null,
			visitors: highlights?.past_seven_days?.visitors ?? null,
		} ),
		[ highlights ]
	);
	const previousCounts = useMemo(
		() => ( {
			comments: highlights?.between_past_eight_and_fifteen_days?.comments ?? null,
			likes: highlights?.between_past_eight_and_fifteen_days?.likes ?? null,
			views: highlights?.between_past_eight_and_fifteen_days?.views ?? null,
			visitors: highlights?.between_past_eight_and_fifteen_days?.visitors ?? null,
		} ),
		[ highlights ]
	);

	return (
		<HighlightCards
			className="has-odyssey-stats-bg-color"
			counts={ counts }
			previousCounts={ previousCounts }
			showValueTooltip={ true }
			onClickComments={ () => null }
			onClickLikes={ () => null }
			onClickViews={ () => null }
			onClickVisitors={ () => null }
		/>
	);
}
