import './style.scss';
import clsx from 'clsx';
import { ComponentProps } from 'react';
import { FeedRecommendation } from 'calypso/data/reader/use-feed-recommendations-query';
import { RecommendedFeedItem } from './recommended-feed-item';

interface RecommendedFeedsListProps
	extends Pick< ComponentProps< typeof RecommendedFeedItem >, 'variant' | 'followSource' > {
	feeds: FeedRecommendation[];
}

export function RecommendedFeedsList( props: RecommendedFeedsListProps ): JSX.Element {
	const { feeds, variant = 'default', followSource } = props;

	return (
		<ul className={ clsx( 'recommended-feeds-list', `is-${ variant }-view` ) }>
			{ feeds
				.filter( ( feed ) => feed.feedUrl )
				.map(
					( feed ): JSX.Element => (
						<RecommendedFeedItem
							key={ `recommended-feed-item-${ feed.feedId || feed.feedUrl }` }
							feed={ feed }
							followSource={ followSource }
							variant={ variant }
						/>
					)
				) }
		</ul>
	);
}
