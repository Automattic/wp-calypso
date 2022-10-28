import { comment, Icon, navigation, people, starEmpty } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
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
	const translate = useTranslate();
	return (
		<div className="highlight-cards">
			<h1 className="highlight-cards-heading">
				{ translate( '7-day highlights' ) }{ ' ' }
				<small>{ translate( 'compared to the last seven days' ) }</small>
			</h1>

			<div className="highlight-cards-list">
				<HighlightCard
					heading={ translate( 'Visitors' ) }
					icon={ <Icon icon={ people } /> }
					count={ counts?.visitors ?? null }
					previousCount={ previousCounts?.visitors ?? null }
				/>
				<HighlightCard
					heading={ translate( 'Views' ) }
					icon={ <Icon icon={ navigation } /> }
					count={ counts?.views ?? null }
					previousCount={ previousCounts?.views ?? null }
				/>
				<HighlightCard
					heading={ translate( 'Likes' ) }
					icon={ <Icon icon={ starEmpty } /> }
					count={ counts?.likes ?? null }
					previousCount={ previousCounts?.likes ?? null }
				/>
				<HighlightCard
					heading={ translate( 'Comments' ) }
					icon={ <Icon icon={ comment } /> }
					count={ counts?.comments ?? null }
					previousCount={ previousCounts?.comments ?? null }
				/>
			</div>
		</div>
	);
}
