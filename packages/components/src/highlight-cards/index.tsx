import { comment, Icon, navigation, people, starEmpty } from '@wordpress/icons';
import './style.scss';
import HighlightCard from './highlight-card';

export type HighlightCardsProps = {
	counts: {
		comments: number | null;
		likes: number | null;
		views: number | null;
		visitors: number | null;
	};
	previousCounts: {
		comments: number | null;
		likes: number | null;
		views: number | null;
		visitors: number | null;
	};
	onClickComments: string;
	onClickLikes: string;
	onClickViews: string;
	onClickVisitors: string;
};

export default function HighlightCards( { counts, previousCounts }: HighlightCardsProps ) {
	return (
		<div className="highlight-cards">
			<h1 className="highlight-cards-heading">
				7-day highlights <small>compared to the last seven days</small>
			</h1>

			<div className="highlight-cards-list">
				<HighlightCard
					heading="Visitors"
					icon={ <Icon icon={ people } /> }
					count={ counts.visitors }
					previousCount={ previousCounts.visitors }
				/>
				<HighlightCard
					heading="Views"
					icon={ <Icon icon={ navigation } /> }
					count={ counts.views }
					previousCount={ previousCounts.views }
				/>
				<HighlightCard
					heading="Likes"
					icon={ <Icon icon={ starEmpty } /> }
					count={ counts.likes }
					previousCount={ previousCounts.likes }
				/>
				<HighlightCard
					heading="Comments"
					icon={ <Icon icon={ comment } /> }
					count={ counts.comments }
					previousCount={ previousCounts.comments }
				/>
			</div>
		</div>
	);
}
