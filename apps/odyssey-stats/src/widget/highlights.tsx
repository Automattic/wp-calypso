import { formatNumber } from '@automattic/number-formatters';
import { TabPanel } from '@wordpress/components';
import { Icon, chartBar, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useState } from 'react';
import useReferrersQuery from '../hooks/use-referrers-query';
import useTopPostsQuery from '../hooks/use-top-posts-query';
import { ResolvedDateRange } from '../lib/date-ranges';
import { HighLightItem } from '../typings';
import GrowHeight from './grow-height';
import recordWidgetEvent, { recordWidgetEventThenFollow } from './record-widget-event';
import useStatsLink from './use-stats-link';
import WidgetSection from './widget-section';
import type { MouseEvent } from 'react';

import './highlights.scss';

type ClickHandler = ( event: MouseEvent< HTMLAnchorElement > ) => void;

interface ItemLinkProps {
	item: HighLightItem;
	href: string;
	isExternal: boolean;
	onClick: ClickHandler;
}

interface TopColumnProps {
	items: Array< HighLightItem >;
	itemHref: ( item: HighLightItem ) => string;
	isExternal: boolean;
	isLoading: boolean;
	viewAllUrl: string;
	onItemClick: ClickHandler;
	onViewAllClick: ClickHandler;
}

interface HighlightsProps {
	siteId: number;
	statsBaseUrl: string;
	range: ResolvedDateRange;
	gmtOffset: number;
}

const HIGHLIGHT_ITEMS_LIMIT = 5;
const HIGHLIGHT_TAB_TOP_POSTS_PAGES = 'topPostsAndPages';
const HIGHLIGHT_TAB_TOP_REFERRERS = 'topReferrers';

const ItemLink: FunctionComponent< ItemLinkProps > = ( { item, href, isExternal, onClick } ) => {
	const translate = useTranslate();

	// The bare figure is what the design shows; screen readers get the worded version so
	// the number is not announced without its unit.
	return (
		<a
			className="stats-widget-highlights-card__item"
			href={ href }
			target={ isExternal ? '_blank' : '_self' }
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
			<span className="stats-widget-highlights-card__title">
				<span className="stats-widget-highlights-card__title-text">{ item.title }</span>
				{ isExternal && <Icon className="stats-icon" icon={ external } size={ 16 } /> }
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
				{ isExternal && ` ${ translate( '(opens in a new tab)' ) }` }
			</span>
		</a>
	);
};

const TopColumn: FunctionComponent< TopColumnProps > = ( {
	items,
	itemHref,
	isExternal,
	isLoading,
	viewAllUrl,
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
								<ItemLink
									item={ item }
									href={ itemHref( item ) }
									isExternal={ isExternal }
									onClick={ onItemClick }
								/>
							</li>
						) ) }
					</ul>
				) }
			</GrowHeight>
			<div className="stats-widget-highlights-card__view-all">
				<a href={ viewAllUrl } onClick={ onViewAllClick }>
					{ translate( 'See more' ) }
				</a>
			</div>
		</div>
	);
};

export default function Highlights( { siteId, statsBaseUrl, range, gmtOffset }: HighlightsProps ) {
	const translate = useTranslate();
	const statsLink = useStatsLink( siteId );
	const { startDate, endDate } = range;

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
	const postHref = ( item: HighLightItem ) =>
		statsLink(
			`${ statsBaseUrl }/stats/post/${ item.id }/${ siteId }`,
			item.id > 0 ? `/post/${ item.id }` : null,
			linkRange
		);
	const referrerHref = ( item: HighLightItem ) => item.url || item.href;

	const {
		data: topPostsAndPages = [],
		isPending: isPendingPostsAndPages,
		isError: isPostsAndPagesError,
	} = useTopPostsQuery( siteId, range );

	const {
		data: topReferrers = [],
		isPending: isPendingReferrers,
		isError: isReferrersError,
	} = useReferrersQuery( siteId, range );

	// Held here rather than left to TabPanel, which remounts when the section comes back after
	// an empty range and reports its initial tab as it does; only a change is a user's click.
	const [ selectedTab, setSelectedTab ] = useState< string >( HIGHLIGHT_TAB_TOP_POSTS_PAGES );

	// Drop the section only once both lists have answered empty. A failed request also falls
	// back to `[]`, so errors are excluded: those lists say "No data to show" instead.
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
			title: translate( 'Top Posts & Pages' ),
			items: topPostsAndPages,
			isLoading: isPendingPostsAndPages,
			viewAllUrl: viewAllPostsStatsUrl,
			itemHref: postHref,
			isExternal: false,
			trackingName: 'top_posts' as const,
			itemEvent: 'post_clicked' as const,
		},
		{
			name: HIGHLIGHT_TAB_TOP_REFERRERS,
			title: translate( 'Top Referrers' ),
			items: topReferrers,
			isLoading: isPendingReferrers,
			viewAllUrl: viewAllReferrerStatsUrl,
			itemHref: referrerHref,
			isExternal: true,
			trackingName: 'top_referrers' as const,
			itemEvent: 'referrer_clicked' as const,
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
				initialTabName={ selectedTab }
				onSelect={ ( tabName: string ) => {
					if ( tabName === selectedTab ) {
						return;
					}
					setSelectedTab( tabName );
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
							items={ active.items }
							itemHref={ active.itemHref }
							isExternal={ active.isExternal }
							isLoading={ active.isLoading }
							viewAllUrl={ active.viewAllUrl }
							onItemClick={ recordWidgetEventThenFollow( active.itemEvent ) }
							onViewAllClick={ recordWidgetEventThenFollow( 'see_more_clicked', {
								tab: active.trackingName,
								range: range.id,
							} ) }
						/>
					);
				} }
			</TabPanel>
		</WidgetSection>
	);
}
