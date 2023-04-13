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
	navigation?: React.ReactNode;
};

export default function AnnualHighlightCards( {
	className,
	counts,
	titleHref,
	year,
	navigation,
}: AnnualHighlightCardsProps ) {
	const translate = useTranslate();

	const header = (
		<h1 className="highlight-cards-heading">
			{ Number.isFinite( year )
				? translate( '%(year)s in review', { args: { year } } )
				: translate( 'Year in review' ) }{ ' ' }
			{ titleHref ? (
				<small>
					<a className="highlight-cards-heading-wrapper" href={ titleHref }>
						{ translate( 'View all annual insights' ) }
					</a>
				</small>
			) : null }
		</h1>
	);

	return (
		<div className={ classNames( 'highlight-cards', className ?? null ) }>
			<div className="highlight-year-navigation">
				{ header }
				{ navigation }
			</div>

			<div className="highlight-cards-list">
				<HighlightCard
					heading={ translate( 'Posts' ) }
					icon={ <Icon icon={ postContent } /> }
					count={ counts?.posts ?? null }
					showValueTooltip
				/>
				<HighlightCard
					heading={ translate( 'Words' ) }
					icon={ <Icon icon={ paragraph } /> }
					count={ counts?.words ?? null }
					showValueTooltip
				/>
				<HighlightCard
					heading={ translate( 'Likes' ) }
					icon={ <Icon icon={ starEmpty } /> }
					count={ counts?.likes ?? null }
					showValueTooltip
				/>
				<HighlightCard
					heading={ translate( 'Comments' ) }
					icon={ <Icon icon={ comment } /> }
					count={ counts?.comments ?? null }
					showValueTooltip
				/>
				<HighlightCard
					heading={ translate( 'Subscribers' ) }
					icon={ <Icon icon={ people } /> }
					count={ counts?.followers ?? null }
					showValueTooltip
				/>
			</div>
		</div>
	);
}
