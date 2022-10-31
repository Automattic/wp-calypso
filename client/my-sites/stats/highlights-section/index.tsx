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
			comments: highlights?.comments ?? null,
			likes: highlights?.likes ?? null,
			views: highlights?.views ?? null,
			visitors: highlights?.visitors ?? null,
		} ),
		[ highlights ]
	);

	return (
		<div className="stats-highlights-section">
			<HighlightCards
				counts={ counts }
				previousCounts={ {
					comments: null,
					likes: null,
					views: null,
					visitors: null,
				} }
				onClickComments={ () => null }
				onClickLikes={ () => null }
				onClickViews={ () => null }
				onClickVisitors={ () => null }
			/>
		</div>
	);
}
