import { comment, Icon, navigation, people, starEmpty } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import './style.scss';
import HighlightCard from './highlight-card';

export type HighlightCardsProps = {
	className?: string;
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
	onClickComments: ( event: MouseEvent ) => void;
	onClickLikes: ( event: MouseEvent ) => void;
	onClickViews: ( event: MouseEvent ) => void;
	onClickVisitors: ( event: MouseEvent ) => void;
};

export default function HighlightCards( {
	className,
	counts,
	onClickComments,
	onClickLikes,
	onClickViews,
	onClickVisitors,
	previousCounts,
}: HighlightCardsProps ) {
	const translate = useTranslate();

	return (
		<div className={ classNames( 'highlight-cards', className ?? null ) }>
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
					onClick={ onClickVisitors }
				/>
				<HighlightCard
					heading={ translate( 'Views' ) }
					icon={ <Icon icon={ navigation } /> }
					count={ counts?.views ?? null }
					previousCount={ previousCounts?.views ?? null }
					onClick={ onClickViews }
				/>
				<HighlightCard
					heading={ translate( 'Likes' ) }
					icon={ <Icon icon={ starEmpty } /> }
					count={ counts?.likes ?? null }
					previousCount={ previousCounts?.likes ?? null }
					onClick={ onClickLikes }
				/>
				<HighlightCard
					heading={ translate( 'Comments' ) }
					icon={ <Icon icon={ comment } /> }
					count={ counts?.comments ?? null }
					previousCount={ previousCounts?.comments ?? null }
					onClick={ onClickComments }
				/>
			</div>
		</div>
	);
}
