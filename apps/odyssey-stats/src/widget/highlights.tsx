import { SegmentedControl } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { Icon, external } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useState, FunctionComponent } from 'react';
import useReferrersQuery from '../hooks/use-referrers-query';
import useTopPostsQuery from '../hooks/use-top-posts-query';
import { HighLightItem } from '../typings';

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
	title: string;
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

	const renderedItem = (
		<div>
			<p>{ item.title }</p>
			<span>
				{ translate( '%(views)s Views', {
					args: {
						views: formatNumber( item.views ),
					},
				} ) }
			</span>
		</div>
	);

	return isItemLink ? (
		<a
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
			{ isItemLinkExternal && <Icon className="stats-icon" icon={ external } size={ 18 } /> }
		</a>
	) : (
		renderedItem
	);
};

const TopColumn: FunctionComponent< TopColumnProps > = ( {
	items,
	viewAllUrl,
	viewAllText,
	title,
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
			<label className="stats-widget-highlights-card__title">{ title }</label>
			{ items.length === 0 && (
				<p className="stats-widget-highlights-card__empty">
					{ isLoading ? `${ translate( 'Loading' ) }...` : translate( 'No data to show' ) }
				</p>
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
			<div className="stats-widget-highlights-card__view-all">
				<a href={ viewAllUrl }>{ viewAllText }</a>
			</div>
		</div>
	);
};

export default function Highlights( { siteId, gmtOffset, statsBaseUrl }: HighlightsProps ) {
	const translate = useTranslate();

	const headingTitle = translate( '7 Day Highlights' );
	const topPostsAndPagesTitle = translate( 'Top Posts & Pages' );
	const topReferrersTitle = translate( 'Top Referrers' );

	const moduleTabs = [
		{
			value: HIGHLIGHT_TAB_TOP_POSTS_PAGES,
			label: topPostsAndPagesTitle,
		},
		{
			value: HIGHLIGHT_TAB_TOP_REFERRERS,
			label: topReferrersTitle,
		},
	];

	// Default to the first tab `topPostsAndPages`.
	const [ selectedTab, setSelectedTab ] = useState( HIGHLIGHT_TAB_TOP_POSTS_PAGES );

	const queryDate = moment()
		.utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 )
		.format( 'YYYY-MM-DD' );
	const viewAllPostsStatsUrl = `${ statsBaseUrl }/stats/day/posts/${ siteId }?startDate=${ queryDate }&summarize=1&num=7`;
	const viewAllReferrerStatsUrl = `${ statsBaseUrl }/stats/day/referrers/${ siteId }?startDate=${ queryDate }&summarize=1&num=7`;

	const { data: topPostsAndPages = [], isFetching: isFetchingPostsAndPages } = useTopPostsQuery(
		siteId,
		'day',
		7,
		queryDate
	);

	const { data: topReferrers = [], isFetching: isFetchingReferrers } = useReferrersQuery(
		siteId,
		'day',
		7,
		queryDate
	);

	return (
		<div className="stats-widget-highlights stats-widget-card" aria-label={ headingTitle }>
			<div className="stats-widget-highlights__header">
				<label>{ headingTitle }</label>
			</div>
			<div className="stats-widget-highlights__tabs">
				<SegmentedControl primary>
					{ moduleTabs.map( ( tab ) => {
						return (
							<SegmentedControl.Item
								key={ tab.value }
								selected={ tab.value === selectedTab }
								onClick={ () => setSelectedTab( tab.value ) }
							>
								{ tab.label }
							</SegmentedControl.Item>
						);
					} ) }
				</SegmentedControl>
			</div>
			<div className="stats-widget-highlights__body">
				<TopColumn
					className={ clsx( 'stats-widget-highlights__column', {
						'stats-widget-highlights__column--show-in-mobile':
							selectedTab === HIGHLIGHT_TAB_TOP_POSTS_PAGES,
					} ) }
					title={ topPostsAndPagesTitle }
					viewAllUrl={ viewAllPostsStatsUrl }
					viewAllText={ translate( 'View all posts & pages stats' ) }
					items={ topPostsAndPages }
					isLoading={ isFetchingPostsAndPages }
					statsBaseUrl={ statsBaseUrl }
					siteId={ siteId }
					isItemLink
				/>
				<TopColumn
					className={ clsx( 'stats-widget-highlights__column', {
						'stats-widget-highlights__column--show-in-mobile':
							selectedTab === HIGHLIGHT_TAB_TOP_REFERRERS,
					} ) }
					title={ topReferrersTitle }
					viewAllUrl={ viewAllReferrerStatsUrl }
					viewAllText={ translate( 'View all referrer stats' ) }
					items={ topReferrers }
					isLoading={ isFetchingReferrers }
					statsBaseUrl={ statsBaseUrl }
					siteId={ siteId }
					isItemLink
					isItemLinkExternal
				/>
			</div>
		</div>
	);
}
