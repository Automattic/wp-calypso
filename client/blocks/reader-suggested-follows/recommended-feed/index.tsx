import { RecommendedFeed as BaseRecommendedFeed } from 'calypso/reader/recommended-feed';
import type { FeedRecommendation } from 'calypso/data/reader/use-feed-recommendations-query';
import './style.scss';

export const RecommendedFeed = ( {
	feed,
	onClose,
}: {
	feed: FeedRecommendation;
	onClose: () => void;
} ) => {
	return (
		<BaseRecommendedFeed
			classPrefix="reader-recommended-follows-dialog"
			blog={ feed }
			onLinkClick={ onClose }
			variant="small"
		/>
	);
};
