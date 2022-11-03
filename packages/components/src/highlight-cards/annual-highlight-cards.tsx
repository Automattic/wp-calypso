import { comment, Icon, paragraph, people, postContent, starEmpty } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import HighlightCard from './highlight-card';
import './style.scss';

export type AnnualHighlightCardsProps = {
	className?: string;
	counts: {
		comments: number | null;
		likes: number | null;
		posts: number | null;
		words: number | null;
		followers: number | null;
	};
	titleHref?: string | null;
	year?: string | number | null;
};

export default function AnnualHighlightCards( {
	className,
	counts,
	titleHref,
	year,
}: AnnualHighlightCardsProps ) {
	const translate = useTranslate();

	const header = (
		<h1 className="highlight-cards-heading">
			{ Number.isFinite( year )
				? translate( '%(year)s in review', { args: { year } } )
				: translate( 'Year in review' ) }
		</h1>
	);

	return (
		<div className={ classNames( 'highlight-cards', className ?? null ) }>
			{ titleHref ? (
				<a className="highlight-cards-heading-wrapper" href={ titleHref }>
					{ header }
				</a>
			) : (
				header
			) }

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
