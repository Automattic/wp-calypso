import './style.scss';
import clsx from 'clsx';
import { FeedRecommendation } from 'calypso/data/reader/use-feed-recommendations-query';
import { RecommendedFeedItem, RecommendedFeedItemProps } from './recommended-feed-item';

interface RecommendedFeedsListProps extends Omit< RecommendedFeedItemProps, 'feed' > {
	feeds: FeedRecommendation[];
}

export function RecommendedFeedsList( props: RecommendedFeedsListProps ): JSX.Element {
	const { feeds, variant = 'default', ...feedItemProps } = props;

	return (
		<ul className={ clsx( 'recommended-feeds-list', `is-${ variant }-view` ) }>
			{ feeds
				.filter( ( feed ) => feed.feedUrl )
				.map(
					( feed ): JSX.Element => (
						<RecommendedFeedItem
							key={ `recommended-feed-item-${ feed.feedId || feed.feedUrl }` }
							feed={ feed }
							variant={ variant }
							{ ...feedItemProps }
						/>
					)
				) }
		</ul>
	);
}
