import { formatNumber } from '@automattic/number-formatters';
import { TabPanel } from '@wordpress/components';
import { Icon, chartBar, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useRef } from 'react';
import useReferrersQuery from '../hooks/use-referrers-query';
import useTopPostsQuery from '../hooks/use-top-posts-query';
import { DateRangeId } from '../lib/date-ranges';
import { HighLightItem } from '../typings';
import GrowHeight from './grow-height';
import recordWidgetEvent, { recordWidgetEventThenFollow } from './record-widget-event';
import useStatsLink from './use-stats-link';
import WidgetSection from './widget-section';
import type { PremiumAnalyticsRange } from 'calypso/dashboard/utils/premium-analytics-url';
import type { MouseEvent } from 'react';

import './highlights.scss';

interface ItemWrapperProps {
	siteId: number;
	statsBaseUrl: string;
	isItemLink: boolean;
	item: HighLightItem;
	isItemLinkExternal: boolean;
	/** The days the list covers, so a post's link opens on them. */
	linkRange: PremiumAnalyticsRange;
	onClick?: ( event: MouseEvent< HTMLAnchorElement > ) => void;
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
	linkRange: PremiumAnalyticsRange;
	onItemClick?: ( event: MouseEvent< HTMLAnchorElement > ) => void;
	onViewAllClick?: ( event: MouseEvent< HTMLAnchorElement > ) => void;
}

interface HighlightsProps {
	siteId: number;
	statsBaseUrl: string;
	rangeId: DateRangeId;
	/** First and last day of the range, as `YYYY-MM-DD`. */
	startDate: string;
	endDate: string;
	gmtOffset: number;
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
	linkRange,
	onClick,
} ) => {
	const translate = useTranslate();
	const statsLink = useStatsLink( siteId );

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
				{ isItemLink && isItemLinkExternal && ` ${ translate( '(opens in a new tab)' ) }` }
			</span>
		</>
	);

	return isItemLink ? (
		<a
			className="stats-widget-highlights-card__item"
			href={
				isItemLinkExternal
					? externalLink( item )
					: statsLink(
							postAndPageLink( statsBaseUrl, siteId, item.id ),
							item.id > 0 ? `/post/${ item.id }` : null,
							linkRange
						)
			}
			target={ isItemLinkExternal ? '_blank' : '_self' }
			onClick={ onClick }
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
	linkRange,
	onItemClick,
	onViewAllClick,
} ) => {
	const translate = useTranslate();

	return (
		<div className="stats-widget-highlights-card">
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
									linkRange={ linkRange }
									onClick={ onItemClick }
								/>
							</li>
						) ) }
					</ul>
				) }
			</GrowHeight>
			<div className="stats-widget-highlights-card__view-all">
				<a href={ viewAllUrl } onClick={ onViewAllClick }>
					{ viewAllText }
				</a>
			</div>
		</div>
	);
};

export default function Highlights( {
	siteId,
	statsBaseUrl,
	rangeId,
	startDate,
	endDate,
	gmtOffset,
}: HighlightsProps ) {
	const translate = useTranslate();
	const statsLink = useStatsLink( siteId );

	const topPostsAndPagesTitle = translate( 'Top Posts & Pages' );
	const topReferrersTitle = translate( 'Top Referrers' );

	// "See more" and the post rows open the days the lists cover, on Stats or Premium Analytics.
	const linkRange = { from: startDate, to: endDate, gmtOffset };
	const viewAllPostsStatsUrl = statsLink(
		`${ statsBaseUrl }/stats/day/posts/${ siteId }?chartStart=${ startDate }&chartEnd=${ endDate }`,
		'/reports/posts',
		linkRange
	);
	const viewAllReferrerStatsUrl = statsLink(
		`${ statsBaseUrl }/stats/day/referrers/${ siteId }?chartStart=${ startDate }&chartEnd=${ endDate }`,
		'/reports/referrers',
		linkRange
	);

	const {
		data: topPostsAndPages = [],
		isPending: isPendingPostsAndPages,
		isError: isPostsAndPagesError,
	} = useTopPostsQuery( siteId, startDate, endDate );

	const {
		data: topReferrers = [],
		isPending: isPendingReferrers,
		isError: isReferrersError,
	} = useReferrersQuery( siteId, startDate, endDate );

	// TabPanel also reports the initial tab on mount; only a change is a user's click.
	const selectedTabRef = useRef< string >( HIGHLIGHT_TAB_TOP_POSTS_PAGES );

	// Nothing to show in either list, once both have answered: drop the section rather
	// than leave a card of two empty tabs. While either is loading it stays, showing its
	// skeleton. A single empty list keeps its tab and says so.
	//
	// A failed request is not an empty one. Both fall back to `[]`, so without this a
	// request that errored would read as a range with no traffic and take the section and
	// its "See more" links with it; the lists say "No data to show" instead.
	const isEmpty =
		! isPendingPostsAndPages &&
		! isPendingReferrers &&
		! isPostsAndPagesError &&
		! isReferrersError &&
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
			isLoading: isPendingPostsAndPages,
			viewAllUrl: viewAllPostsStatsUrl,
			isItemLinkExternal: false,
			trackingName: 'top_posts',
			itemEvent: 'post_clicked',
		},
		{
			name: HIGHLIGHT_TAB_TOP_REFERRERS,
			title: topReferrersTitle,
			items: topReferrers,
			isLoading: isPendingReferrers,
			viewAllUrl: viewAllReferrerStatsUrl,
			isItemLinkExternal: true,
			trackingName: 'top_referrers',
			itemEvent: 'referrer_clicked',
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
				onSelect={ ( tabName: string ) => {
					if ( tabName === selectedTabRef.current ) {
						return;
					}
					selectedTabRef.current = tabName;
					const selected = tabs.find( ( candidate ) => candidate.name === tabName );
					if ( selected ) {
						recordWidgetEvent( 'highlights_tab_clicked', { tab: selected.trackingName } );
					}
				} }
			>
				{ ( tab ) => {
					const active = tabs.find( ( candidate ) => candidate.name === tab.name ) ?? tabs[ 0 ];

					return (
						<TopColumn
							viewAllUrl={ active.viewAllUrl }
							viewAllText={ translate( 'See more' ) }
							items={ active.items }
							isLoading={ active.isLoading }
							statsBaseUrl={ statsBaseUrl }
							siteId={ siteId }
							isItemLink
							isItemLinkExternal={ active.isItemLinkExternal }
							linkRange={ linkRange }
							onItemClick={ recordWidgetEventThenFollow( active.itemEvent ) }
							onViewAllClick={ recordWidgetEventThenFollow( 'see_more_clicked', {
								tab: active.trackingName,
								range: rangeId,
							} ) }
						/>
					);
				} }
			</TabPanel>
		</WidgetSection>
	);
}
