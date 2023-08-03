import './style.scss';
import { useTranslate } from 'i18n-calypso';
import { debounce } from 'lodash';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPosts from 'calypso/components/data/query-posts';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import QueryStatsRecentPostViews from 'calypso/components/data/query-stats-recent-post-views';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import useCampaignsQuery from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import useCampaignsStatsQuery from 'calypso/data/promote-post/use-promote-post-campaigns-stats-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import memoizeLast from 'calypso/lib/memoize-last';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import CampaignsList from 'calypso/my-sites/promote-post/components/campaigns-list';
import PostsList from 'calypso/my-sites/promote-post/components/posts-list';
import PostsListBanner from 'calypso/my-sites/promote-post/components/posts-list-banner';
import PromotePostTabBar from 'calypso/my-sites/promote-post/components/promoted-post-filter';
import { useSelector } from 'calypso/state';
import {
	getSitePost,
	getPostsForQuery,
	isRequestingPostsForQuery,
} from 'calypso/state/posts/selectors';
import {
	getTopPostAndPages,
	hasSiteStatsForQueryFinished,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { PostType } from 'calypso/types';
import { getAdvertisingDashboardPath, unifyCampaigns } from './utils';

export type TabType = 'posts' | 'campaigns';
export type TabOption = {
	id: TabType;
	name: string;
};

interface Props {
	tab?: TabType;
}

const queryProducts = {
	number: 20, // max supported by /me/posts endpoint for all-sites mode
	status: 'publish', // do not allow private or unpublished posts
	type: 'product',
};

const queryPageAndPostsByComments = {
	...queryProducts,
	type: 'any',
	order_by: 'comment_count',
};

const queryPageAndPostsByIDs = {
	...queryProducts,
	type: 'any',
	order_by: 'id',
	number: 5,
};

export type DSPMessage = {
	errorCode?: string;
};

const ERROR_NO_LOCAL_USER = 'no_local_user';

const memoizedQuery = memoizeLast( ( period, unit, quantity, endOf, num ) => ( {
	period,
	unit: unit,
	quantity: quantity,
	date: endOf,
	num: num,
	max: 20,
} ) );
const today = moment().locale( 'en' );
const period = 'year';
const topPostsQuery = memoizedQuery( period, 'month', 20, today.format( 'YYYY-MM-DD' ), -1 );

const allowedPostTypes = [ 'post', 'page', 'product' ];

export default function PromotedPosts( { tab }: Props ) {
	const selectedTab = tab === 'campaigns' ? 'campaigns' : 'posts';
	const selectedSite = useSelector( getSelectedSite );
	const [ expandedCampaigns, setExpandedCampaigns ] = useState< number[] >( [] );
	const [ alreadyScrolled, setAlreadyScrolled ] = useState< boolean >( false );
	const selectedSiteId = selectedSite?.ID || 0;

	const products = useSelector( ( state ) => {
		const products = getPostsForQuery( state, selectedSiteId, queryProducts );
		return products?.filter( ( product: any ) => ! product.password );
	} );

	const postAndPagesByComments = useSelector( ( state ) => {
		const postsAndPages = getPostsForQuery( state, selectedSiteId, queryPageAndPostsByComments );
		return postsAndPages?.filter(
			( product: any ) => ! product.password && allowedPostTypes.includes( product.type )
		);
	} );

	const postAndPagesByIDs = useSelector( ( state ) => {
		const postsAndPages = getPostsForQuery( state, selectedSiteId, queryPageAndPostsByIDs );
		return postsAndPages?.filter(
			( product: any ) => ! product.password && allowedPostTypes.includes( product.type )
		);
	} );

	const isLoadingProducts = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, selectedSiteId, queryProducts )
	);

	const topViewedPostAndPages = useSelector( ( state ) =>
		getTopPostAndPages( state, selectedSiteId, topPostsQuery )
	);

	const mostPopularPostAndPages = useSelector( ( state ) => {
		const topPostsAndPages: any[ PostType ] = [];

		topViewedPostAndPages?.forEach( ( post: any ) => {
			const item = getSitePost( state, selectedSiteId, post.id );
			item && topPostsAndPages.push( { ...item, views: post.views } );
		} );

		return topPostsAndPages;
	} );

	const campaigns = useCampaignsQuery( selectedSiteId ?? 0 );
	const campaignsStats = useCampaignsStatsQuery( selectedSiteId ?? 0 );

	const { isLoading: campaignsIsLoading, isError, error: campaignError } = campaigns;
	const { data: campaignsData } = campaigns;
	const { data: campaignsStatsData } = campaignsStats;

	const campaignsFull = useMemo(
		() => unifyCampaigns( campaignsData || [], campaignsStatsData || [] ),
		[ campaignsData, campaignsStatsData ]
	);

	const hasLocalUser = ( campaignError as DSPMessage )?.errorCode !== ERROR_NO_LOCAL_USER;

	const translate = useTranslate();

	const tabs: TabOption[] = [
		{ id: 'posts', name: translate( 'Ready to Blaze' ) },
		{ id: 'campaigns', name: translate( 'Campaigns' ) },
	];

	const topViewedPostAndPagesIds = topViewedPostAndPages?.map( ( post: any ) => post.id );
	const topViewedMemoizedQuery = useMemo(
		() => ( { include: topViewedPostAndPagesIds } ),
		[ JSON.stringify( topViewedPostAndPagesIds ) ]
	);

	const hasTopPostsFinished = useSelector( ( state ) =>
		hasSiteStatsForQueryFinished( state, selectedSiteId, 'statsTopPosts', topPostsQuery )
	);

	const isLoadingMemoizedQuery = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, selectedSiteId, topViewedMemoizedQuery )
	);

	const isLoadingByIDsQuery = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, selectedSiteId, queryPageAndPostsByIDs )
	);

	const isLoadingByCommentsQuery = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, selectedSiteId, queryPageAndPostsByComments )
	);

	const subtitle = translate(
		'Reach new readers and customers with WordPress Blaze. Promote a post or a page on our network of millions blogs and web sites. {{learnMoreLink}}Learn more.{{/learnMoreLink}}',
		{
			components: {
				learnMoreLink: <InlineSupportLink supportContext="advertising" showIcon={ false } />,
			},
		}
	);

	const debouncedScrollToCampaign = debounce( ( campaignId ) => {
		const element = document.querySelector( `.promote-post__campaigns_id_${ campaignId }` );
		if ( element instanceof Element ) {
			const margin = 50; // Some margin so it keeps below the header in mobile/desktop
			const dims = element.getBoundingClientRect();
			window.scrollTo( {
				top: dims.top - margin,
				behavior: 'smooth',
			} );
		}
	}, 100 );

	useEffect( () => {
		if ( ! alreadyScrolled && campaignsFull.length ) {
			const windowUrl = window.location.search;
			const params = new URLSearchParams( windowUrl );
			const campaignId = Number( params?.get( 'campaign_id' ) || 0 );
			if ( campaignId ) {
				setExpandedCampaigns( [ ...expandedCampaigns, campaignId ] );
				debouncedScrollToCampaign( campaignId );
				setAlreadyScrolled( true );
			}
		}
	}, [ campaignsFull, alreadyScrolled ] );

	if ( selectedSite?.is_coming_soon || selectedSite?.is_private ) {
		return (
			<EmptyContent
				className="campaigns-empty"
				title={
					selectedSite?.is_coming_soon
						? translate( 'Site is not published' )
						: translate( 'Site is private' )
				}
				line={ translate(
					'To start using Blaze, you must make your site public. You can do that from {{sitePrivacySettingsLink}}here{{/sitePrivacySettingsLink}}.',
					{
						components: {
							sitePrivacySettingsLink: (
								<a
									href={ `https://wordpress.com/settings/general/${ selectedSite.domain }#site-privacy-settings` }
									rel="noreferrer"
								/>
							),
						},
					}
				) }
				illustration={ null }
			/>
		);
	}

	const content = [
		...( postAndPagesByIDs || [] ),
		...( mostPopularPostAndPages || [] ),
		...( postAndPagesByComments || [] ),
		...( products || [] ),
	];

	/**
	 * Some of the posts/pages may be duplicated as we load them by popularity and sometimes by comments.
	 */
	const contentWithoutDuplicatedIds = content.filter(
		( obj, index ) => content.findIndex( ( item ) => item.ID === obj.ID ) === index
	);

	const isLoading =
		isLoadingByCommentsQuery ||
		isLoadingByIDsQuery ||
		isLoadingMemoizedQuery ||
		! hasTopPostsFinished ||
		( ! isWpMobileApp() && isLoadingProducts );

	return (
		<Main wideLayout className="promote-post">
			<DocumentHead title={ translate( 'Advertising' ) } />

			<FormattedHeader
				brandFont
				className="advertising__page-header"
				headerText={ translate( 'Advertising' ) }
				subHeaderText={ campaignsData?.length ? subtitle : '' }
				align="left"
			/>

			{ ! campaignsIsLoading && ! campaignsData?.length && <PostsListBanner /> }

			<PromotePostTabBar tabs={ tabs } selectedTab={ selectedTab } />
			{ selectedTab === 'campaigns' ? (
				<>
					<PageViewTracker
						path={ getAdvertisingDashboardPath( '/campaigns/:site' ) }
						title="Advertising > Campaigns"
					/>
					<CampaignsList
						hasLocalUser={ hasLocalUser }
						isError={ isError }
						isLoading={ campaignsIsLoading }
						campaigns={ campaignsFull || [] }
						expandedCampaigns={ expandedCampaigns }
						setExpandedCampaigns={ setExpandedCampaigns }
					/>
				</>
			) : (
				<PageViewTracker
					path={ getAdvertisingDashboardPath( '/posts/:site' ) }
					title="Advertising > Ready to Blaze"
				/>
			) }

			<QuerySiteStats siteId={ selectedSiteId } statType="statsTopPosts" query={ topPostsQuery } />

			{ ! isLoading && content?.length > 0 && (
				<QueryStatsRecentPostViews
					siteId={ selectedSiteId }
					postIds={ content?.map( ( post: any ) => post.ID ) }
					num={ 30 }
				/>
			) }
			{ topViewedPostAndPages && (
				<QueryPosts siteId={ selectedSiteId } query={ topViewedMemoizedQuery } postId={ null } />
			) }
			<QueryPosts siteId={ selectedSiteId } query={ queryPageAndPostsByIDs } postId={ null } />
			{ hasTopPostsFinished && ( ! topViewedPostAndPages || topViewedPostAndPages.length < 10 ) && (
				<QueryPosts
					siteId={ selectedSiteId }
					query={ queryPageAndPostsByComments }
					postId={ null }
				/>
			) }
			{ selectedTab === 'posts' && (
				<PostsList content={ contentWithoutDuplicatedIds } isLoading={ isLoading } />
			) }
			{ ! isWpMobileApp() && (
				<QueryPosts siteId={ selectedSiteId } query={ queryProducts } postId={ null } />
			) }
		</Main>
	);
}
