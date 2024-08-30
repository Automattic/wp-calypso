import { comment, Icon, paragraph, people, postContent, starEmpty } from '@wordpress/icons';
import clsx from 'clsx';
import { translate, useTranslate } from 'i18n-calypso';
import ComponentSwapper from '../component-swapper';
import CountCard from './count-card';
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

function getCardProps( counts: AnnualHighlightCounts ) {
	return [
		{ count: counts?.posts, heading: translate( 'Posts' ), icon: postContent },
		{ count: counts?.words, heading: translate( 'Words' ), icon: paragraph },
		{ count: counts?.likes, heading: translate( 'Likes' ), icon: starEmpty },
		{ count: counts?.comments, heading: translate( 'Comments' ), icon: comment },
		{ count: counts?.followers, heading: translate( 'Subscribers' ), icon: people },
	];
}

function AnnualHighlightsMobile( { counts }: AnnualHighlightsProps ) {
	return <MobileHighlightCardListing highlights={ getCardProps( counts ) } />;
}

function AnnualHighlightsStandard( { counts }: AnnualHighlightsProps ) {
	const props = getCardProps( counts );
	return (
		<div className="highlight-cards-list">
			{ props.map( ( { count, heading, icon }, index ) => (
				<CountCard
					key={ index }
					heading={ heading }
					value={ count }
					icon={ <Icon icon={ icon } /> }
					showValueTooltip
				/>
			) ) }
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
