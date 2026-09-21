import { formatNumber } from '@automattic/number-formatters';
import { TabPanel } from '@wordpress/components';
import { Icon, chartBar, external } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { FunctionComponent } from 'react';
import useReferrersQuery from '../hooks/use-referrers-query';
import useTopPostsQuery from '../hooks/use-top-posts-query';
import { DateRange } from '../lib/date-ranges';
import { HighLightItem } from '../typings';
import GrowHeight from './grow-height';
import WidgetSection from './widget-section';

import './highlights.scss';

interface ItemWrapperProps {
	siteId: number;
	statsBaseUrl: string;
	isItemLink: boolean;
	item: HighLightItem;
	isItemLinkExternal: boolean;
}

interface TopColumnProps {
	items: Array< HighLightItem >;
	viewAllUrl: string;
	viewAllText: string;
	isLoading: boolean;
	statsBaseUrl: string;
	siteId: number;
	isItemLinkExternal?: boolean;
	isItemLink?: boolean;
	className?: null | string;
}

interface HighlightsProps {
	siteId: number;
	gmtOffset: number;
	statsBaseUrl: string;
	range: DateRange;
}

const HIGHLIGHT_ITEMS_LIMIT = 5;
const HIGHLIGHT_TAB_TOP_POSTS_PAGES = 'topPostsAndPages';
const HIGHLIGHT_TAB_TOP_REFERRERS = 'topReferrers';

const postAndPageLink = ( baseUrl: string, siteId: number, postId: number ) => {
	return `${ baseUrl }/stats/post/${ postId }/${ siteId }`;
};

const externalLink = ( item: HighLightItem ) => {
	// Url is for referrers and href is for top posts and pages.
	return item.url || item.href;
};

const ItemWrapper: FunctionComponent< ItemWrapperProps > = ( {
	statsBaseUrl,
	siteId,
	isItemLink,
	item,
	isItemLinkExternal,
} ) => {
	const translate = useTranslate();

	// The bare figure is what the design shows; screen readers get the worded version so
	// the number is not announced without its unit.
	const renderedItem = (
		<>
			<span className="stats-widget-highlights-card__title">
				<span className="stats-widget-highlights-card__title-text">{ item.title }</span>
				{ isItemLink && isItemLinkExternal && (
					<Icon className="stats-icon" icon={ external } size={ 16 } />
				) }
			</span>
			<span className="stats-widget-highlights-card__value" aria-hidden="true">
				{ formatNumber( item.views ) }
			</span>
			<span className="screen-reader-text">
				{ translate( '%(views)s Views', {
					args: {
						views: formatNumber( item.views ),
					},
				} ) }
			</span>
		</>
	);

	return isItemLink ? (
		<a
			className="stats-widget-highlights-card__item"
			href={
				isItemLinkExternal ? externalLink( item ) : postAndPageLink( statsBaseUrl, siteId, item.id )
			}
			target={ isItemLinkExternal ? '_blank' : '_self' }
			rel="noopener noreferrer"
			title={ translate( 'View detailed stats for %(title)s', {
				args: {
					title: item.title,
				},
				textOnly: true,
				comment: 'Text for anchor linking to a stats page for a given post/page',
			} ) }
		>
			{ renderedItem }
		</a>
	) : (
		<div className="stats-widget-highlights-card__item">{ renderedItem }</div>
	);
};

const TopColumn: FunctionComponent< TopColumnProps > = ( {
	items,
	viewAllUrl,
	viewAllText,
	isLoading,
	statsBaseUrl,
	siteId,
	isItemLink = false,
	isItemLinkExternal = false,
	className = null,
} ) => {
	const translate = useTranslate();

	return (
		<div className={ clsx( 'stats-widget-highlights-card', className ) }>
			<GrowHeight>
				{ items.length === 0 && isLoading && (
					// One row, not a full list: how many items come back is unknown, and the one
					// thing a loading list can promise is that there is at least one.
					<div className="stats-widget-highlights-card__list stats-widget-highlights-card__skeleton">
						<span className="screen-reader-text">{ translate( 'Loading…' ) }</span>
						<div className="stats-widget-highlights-card__item" aria-hidden="true">
							<span className="stats-widget-highlights-card__skeleton-bar is-title" />
							<span className="stats-widget-highlights-card__skeleton-bar is-value" />
						</div>
					</div>
				) }
				{ items.length === 0 && ! isLoading && (
					<p className="stats-widget-highlights-card__empty">{ translate( 'No data to show' ) }</p>
				) }
				{ items.length > 0 && (
					<ul className="stats-widget-highlights-card__list">
						{ items.slice( 0, HIGHLIGHT_ITEMS_LIMIT ).map( ( item, idx ) => (
							<li key={ idx }>
								<ItemWrapper
									item={ item }
									statsBaseUrl={ statsBaseUrl }
									siteId={ siteId }
									isItemLink={ isItemLink }
									isItemLinkExternal={ isItemLinkExternal }
								/>
							</li>
						) ) }
					</ul>
				) }
			</GrowHeight>
			<div className="stats-widget-highlights-card__view-all">
				<a href={ viewAllUrl }>{ viewAllText }</a>
			</div>
		</div>
	);
};

export default function Highlights( { siteId, gmtOffset, statsBaseUrl, range }: HighlightsProps ) {
	const translate = useTranslate();
	const { unit, quantity } = range;

	const topPostsAndPagesTitle = translate( 'Top Posts & Pages' );
	const topReferrersTitle = translate( 'Top Referrers' );

	const queryDate = moment()
		.utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 )
		.format( 'YYYY-MM-DD' );
	// The period segment and `num` both track the range, so the deep link opens the
	// same window the widget is showing.
	const viewAllPostsStatsUrl = `${ statsBaseUrl }/stats/${ unit }/posts/${ siteId }?startDate=${ queryDate }&summarize=1&num=${ quantity }`;
	const viewAllReferrerStatsUrl = `${ statsBaseUrl }/stats/${ unit }/referrers/${ siteId }?startDate=${ queryDate }&summarize=1&num=${ quantity }`;

	const { data: topPostsAndPages = [], isFetching: isFetchingPostsAndPages } = useTopPostsQuery(
		siteId,
		unit,
		quantity,
		queryDate
	);

	const { data: topReferrers = [], isFetching: isFetchingReferrers } = useReferrersQuery(
		siteId,
		unit,
		quantity,
		queryDate
	);

	// Nothing to show in either list, once both have answered: drop the section rather
	// than leave a card of two empty tabs. While either is loading it stays, showing its
	// skeleton. A single empty list keeps its tab and says so.
	const isEmpty =
		! isFetchingPostsAndPages &&
		! isFetchingReferrers &&
		topPostsAndPages.length === 0 &&
		topReferrers.length === 0;

	if ( isEmpty ) {
		return null;
	}

	const tabs = [
		{
			name: HIGHLIGHT_TAB_TOP_POSTS_PAGES,
			title: topPostsAndPagesTitle,
			items: topPostsAndPages,
			isLoading: isFetchingPostsAndPages,
			viewAllUrl: viewAllPostsStatsUrl,
			isItemLinkExternal: false,
		},
		{
			name: HIGHLIGHT_TAB_TOP_REFERRERS,
			title: topReferrersTitle,
			items: topReferrers,
			isLoading: isFetchingReferrers,
			viewAllUrl: viewAllReferrerStatsUrl,
			isItemLinkExternal: true,
		},
	];

	return (
		<WidgetSection
			title={ translate( 'Popular content & referrers' ) }
			icon={ chartBar }
			className="stats-widget-highlights"
		>
			<TabPanel
				className="stats-widget-highlights__tabs"
				tabs={ tabs.map( ( { name, title } ) => ( { name, title } ) ) }
			>
				{ ( tab ) => {
					const active = tabs.find( ( candidate ) => candidate.name === tab.name ) ?? tabs[ 0 ];

					return (
						<TopColumn
							className="stats-widget-highlights__column"
							viewAllUrl={ active.viewAllUrl }
							viewAllText={ translate( 'See more' ) }
							items={ active.items }
							isLoading={ active.isLoading }
							statsBaseUrl={ statsBaseUrl }
							siteId={ siteId }
							isItemLink
							isItemLinkExternal={ active.isItemLinkExternal }
						/>
					);
				} }
			</TabPanel>
		</WidgetSection>
	);
}
