import { comment, Icon, paragraph, people, postContent, starEmpty } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ComponentSwapper from '../component-swapper';
import CountComparisonCard from './count-comparison-card';
import MobileHighlightCardListing from './mobile-highlight-cards';

import './style.scss';

type AnnualHighlightCounts = {
	comments: number | null;
	likes: number | null;
	posts: number | null;
	words: number | null;
	followers: number | null;
};

type AnnualHighlightsProps = {
	counts: AnnualHighlightCounts;
};

type AnnualHighlightCardsProps = {
	className?: string;
	counts: AnnualHighlightCounts;
	titleHref?: string | null;
	year?: string | number | null;
	navigation?: React.ReactNode;
};

function AnnualHighlightsMobile( { counts }: AnnualHighlightsProps ) {
	const translate = useTranslate();

	const highlights = [
		{ heading: translate( 'Posts' ), count: counts?.posts, icon: postContent },
		{ heading: translate( 'Words' ), count: counts?.words, icon: paragraph },
		{ heading: translate( 'Likes' ), count: counts?.likes, icon: starEmpty },
		{ heading: translate( 'Comments' ), count: counts?.comments, icon: comment },
		{ heading: translate( 'Subscribers' ), count: counts?.followers, icon: people },
	];

	return <MobileHighlightCardListing highlights={ highlights } />;
}

function AnnualHighlightsStandard( { counts }: AnnualHighlightsProps ) {
	const translate = useTranslate();
	return (
		<div className="highlight-cards-list">
			<CountComparisonCard
				heading={ translate( 'Posts' ) }
				icon={ <Icon icon={ postContent } /> }
				count={ counts?.posts ?? null }
				showValueTooltip
			/>
			<CountComparisonCard
				heading={ translate( 'Words' ) }
				icon={ <Icon icon={ paragraph } /> }
				count={ counts?.words ?? null }
				showValueTooltip
			/>
			<CountComparisonCard
				heading={ translate( 'Likes' ) }
				icon={ <Icon icon={ starEmpty } /> }
				count={ counts?.likes ?? null }
				showValueTooltip
			/>
			<CountComparisonCard
				heading={ translate( 'Comments' ) }
				icon={ <Icon icon={ comment } /> }
				count={ counts?.comments ?? null }
				showValueTooltip
			/>
			<CountComparisonCard
				heading={ translate( 'Subscribers' ) }
				icon={ <Icon icon={ people } /> }
				count={ counts?.followers ?? null }
				showValueTooltip
			/>
		</div>
	);
}

export default function AnnualHighlightCards( {
	className,
	counts,
	titleHref,
	year,
	navigation,
}: AnnualHighlightCardsProps ) {
	const translate = useTranslate();

	const header = (
		<h3 className="highlight-cards-heading">
			{ year != null && Number.isFinite( year )
				? translate( '%(year)s in review', { args: { year } } )
				: translate( 'Year in review' ) }{ ' ' }
			{ titleHref ? (
				<small>
					<a className="highlight-cards-heading-wrapper" href={ titleHref }>
						{ translate( 'View all annual insights' ) }
					</a>
				</small>
			) : null }
		</h3>
	);

	return (
		<div className={ clsx( 'highlight-cards', className ?? null ) }>
			<div className="highlight-year-navigation">
				{ header }
				{ navigation }
			</div>

			<ComponentSwapper
				breakpoint="<660px"
				breakpointActiveComponent={ <AnnualHighlightsMobile counts={ counts } /> }
				breakpointInactiveComponent={ <AnnualHighlightsStandard counts={ counts } /> }
			/>
		</div>
	);
}
