import './style.scss';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import page from 'page';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPosts from 'calypso/components/data/query-posts';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import useCampaignsQuery from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import memoizeLast from 'calypso/lib/memoize-last';
import { usePromoteWidget, PromoteWidgetStatus } from 'calypso/lib/promote-post';
import CampaignsList from 'calypso/my-sites/promote-post/components/campaigns-list';
import PostsList from 'calypso/my-sites/promote-post/components/posts-list';
import PostsListBanner from 'calypso/my-sites/promote-post/components/posts-list-banner';
import PromotePostTabBar from 'calypso/my-sites/promote-post/components/promoted-post-filter';
import {
	getSitePost,
	getPostsForQuery,
	isRequestingPostsForQuery,
} from 'calypso/state/posts/selectors';
import { getTopPostAndPages } from 'calypso/state/stats/lists/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export type TabType = 'posts' | 'campaigns';
export type TabOption = {
	id: TabType;
	name: string;
};

interface Props {
	tab?: TabType;
}

const queryPost = {
	number: 20, // max supported by /me/posts endpoint for all-sites mode
	status: 'publish', // do not allow private or unpublished posts
	type: 'post',
	order_by: 'comment_count',
};
const queryPage = {
	...queryPost,
	type: 'page',
};

const queryProducts = {
	...queryPost,
	type: 'product',
};

export type DSPMessage = {
	errorCode?: string;
};

const ERROR_NO_LOCAL_USER = 'no_local_user';

export default function PromotedPosts( { tab }: Props ) {
	const selectedTab = tab === 'campaigns' ? 'campaigns' : 'posts';

	const memoizedQuery = memoizeLast( ( period, unit, quantity, endOf ) => ( {
		period,
		unit: unit,
		quantity: quantity,
		date: endOf,
	} ) );
	const selectedSite = useSelector( getSelectedSite );
	const today = moment().locale( 'en' );
	const period = 'year';
	const topPostsQuery = memoizedQuery( period, 'month', 1, today.format( 'YYYY-MM-DD' ) );

	const selectedSiteId = selectedSite?.ID || 0;

	const posts = useSelector( ( state ) => {
		const posts = getPostsForQuery( state, selectedSiteId, queryPost );
		return posts?.filter( ( post: any ) => ! post.password );
	} );

	const pages = useSelector( ( state ) => {
		const pages = getPostsForQuery( state, selectedSiteId, queryPage );
		return pages?.filter( ( page: any ) => ! page.password );
	} );

	const products = useSelector( ( state ) => {
		const products = getPostsForQuery( state, selectedSiteId, queryProducts );
		return products?.filter( ( product: any ) => ! product.password );
	} );

	const isLoadingPost = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, selectedSiteId, queryPost )
	);
	const isLoadingPage = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, selectedSiteId, queryPage )
	);
	const isLoadingProducts = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, selectedSiteId, queryProducts )
	);
	const mostPopularPostAndPages = useSelector( ( state ) => {
		const topViewedPostAndPages = getTopPostAndPages( state, selectedSiteId, topPostsQuery );
		const topPosts = [];

		topViewedPostAndPages?.map( ( post ) => {
			const item = getSitePost( state, selectedSiteId, post.id );
			item && topPosts.push( item );
		} );

		return topPosts;
	} );

	const campaigns = useCampaignsQuery( selectedSiteId ?? 0 );
	const { isLoading: campaignsIsLoading, isError, error: campaignError } = campaigns;
	const { data: campaignsData } = campaigns;

	const hasLocalUser = ( campaignError as DSPMessage )?.errorCode !== ERROR_NO_LOCAL_USER;

	const translate = useTranslate();

	const tabs: TabOption[] = [
		{ id: 'posts', name: translate( 'Ready to Blaze' ) },
		{ id: 'campaigns', name: translate( 'Campaigns' ) },
	];

	if ( usePromoteWidget() === PromoteWidgetStatus.DISABLED ) {
		page( '/' );
	}

	const subtitle = translate(
		'Reach new readers and customers with WordPress Blaze. Promote a post or a page on our network of millions blogs and web sites. {{learnMoreLink}}Learn more.{{/learnMoreLink}}',
		{
			components: {
				learnMoreLink: <InlineSupportLink supportContext="advertising" showIcon={ false } />,
			},
		}
	);

	if ( selectedSite?.is_coming_soon ) {
		return (
			<EmptyContent
				className="campaigns-empty"
				title={ translate( 'Site is not published' ) }
				line={ translate( 'To start using Blaze, you must first publish your site.' ) }
				illustration={ null }
			/>
		);
	}

	if ( selectedSite?.is_private ) {
		return (
			<EmptyContent
				className="campaigns-empty"
				title={ translate( 'Site is private' ) }
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
		...( mostPopularPostAndPages || [] ),
		...( posts || [] ),
		...( pages || [] ),
		...( products || [] ),
	];

	/**
	 * Some of the posts/pages may be duplicated in the due to mostPopularPostAndPages.
	 */
	const contentWithoutDuplicateIds = content.filter(
		( obj, index ) => content.findIndex( ( item ) => item.ID === obj.ID ) === index
	);

	const isLoading = isLoadingPage && isLoadingPost && isLoadingProducts;

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
					<PageViewTracker path="/advertising/:site/campaigns" title="Advertising > Campaigns" />
					<CampaignsList
						hasLocalUser={ hasLocalUser }
						isError={ isError }
						isLoading={ campaignsIsLoading }
						campaigns={ campaignsData || [] }
					/>
				</>
			) : (
				<PageViewTracker path="/advertising/:site/posts" title="Advertising > Ready to Blaze" />
			) }

			<QuerySiteStats siteId={ selectedSiteId } statType="statsTopPosts" query={ topPostsQuery } />
			<QueryPosts siteId={ selectedSiteId } query={ queryPost } postId={ null } />
			<QueryPosts siteId={ selectedSiteId } query={ queryPage } postId={ null } />
			<QueryPosts siteId={ selectedSiteId } query={ queryProducts } postId={ null } />
			{ selectedTab === 'posts' && (
				<PostsList content={ contentWithoutDuplicateIds } isLoading={ isLoading } />
			) }
		</Main>
	);
}
