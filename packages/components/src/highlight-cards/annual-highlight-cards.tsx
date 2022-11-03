import { comment, Icon, paragraph, people, postContent, starEmpty } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import './style.scss';
import HighlightCard from './highlight-card';

export type AnnualHighlightCardsProps = {
	className?: string;
	counts: {
		comments: number | null;
		likes: number | null;
		posts: number | null;
		words: number | null;
		followers: number | null;
	};
	year?: string | number | null;
	onClickComments?: ( event: MouseEvent ) => void;
	onClickLikes?: ( event: MouseEvent ) => void;
	onClickPosts?: ( event: MouseEvent ) => void;
	onClickWords?: ( event: MouseEvent ) => void;
	onClickFollowers?: ( event: MouseEvent ) => void;
};

export default function AnnualHighlightCards( {
	className,
	counts,
	year,
}: AnnualHighlightCardsProps ) {
	const translate = useTranslate();

	return (
		<div className={ classNames( 'highlight-cards', className ?? null ) }>
			<h1 className="highlight-cards-heading">
				{ Number.isFinite( year )
					? translate( '%(year)s in review', { args: { year } } )
					: translate( 'Year in review' ) }
			</h1>

			<div className="highlight-cards-list">
				<HighlightCard
					heading={ translate( 'Posts' ) }
					icon={ <Icon icon={ postContent } /> }
					count={ counts?.posts ?? null }
				/>
				<HighlightCard
					heading={ translate( 'Words' ) }
					icon={ <Icon icon={ paragraph } /> }
					count={ counts?.words ?? null }
				/>
				<HighlightCard
					heading={ translate( 'Likes' ) }
					icon={ <Icon icon={ starEmpty } /> }
					count={ counts?.likes ?? null }
				/>
				<HighlightCard
					heading={ translate( 'Comments' ) }
					icon={ <Icon icon={ comment } /> }
					count={ counts?.comments ?? null }
				/>
				<HighlightCard
					heading={ translate( 'Followers' ) }
					icon={ <Icon icon={ people } /> }
					count={ counts?.followers ?? null }
				/>
			</div>
		</div>
	);
}
