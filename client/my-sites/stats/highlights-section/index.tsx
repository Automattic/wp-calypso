import { HighlightCards } from '@automattic/components';

export default function HighlightsSection() {
	// TODO: make a request for highlights data
	// TODO: select the highlights data

	return (
		<div className="stats-highlights-section">
			<HighlightCards
				counts={ {
					comments: null,
					likes: null,
					views: null,
					visitors: null,
				} }
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
