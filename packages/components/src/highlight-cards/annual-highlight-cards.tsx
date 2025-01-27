import { comment, Icon, paragraph, postContent, starEmpty } from '@wordpress/icons';
import clsx from 'clsx';
import { translate, useTranslate } from 'i18n-calypso';
import ComponentSwapper from '../component-swapper';
import CountCard from './count-card';
import HighlightCardsHeading from './highlight-cards-heading';
import MobileHighlightCardListing from './mobile-highlight-cards';

import './style.scss';

type AnnualHighlightCounts = {
	comments: number | null;
	likes: number | null;
	posts: number | null;
	words: number | null;
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
		{ heading: translate( 'Posts' ), count: counts?.posts, icon: postContent },
		{ heading: translate( 'Words' ), count: counts?.words, icon: paragraph },
		{ heading: translate( 'Likes' ), count: counts?.likes, icon: starEmpty },
		{ heading: translate( 'Comments' ), count: counts?.comments, icon: comment },
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
					label={ heading.toLocaleLowerCase() }
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
		<HighlightCardsHeading>
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
		</HighlightCardsHeading>
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
