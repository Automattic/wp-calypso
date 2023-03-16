import './style.scss';
import { useTranslate } from 'i18n-calypso';
import { debounce } from 'lodash';
import page from 'page';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPosts from 'calypso/components/data/query-posts';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import useCampaignsQuery from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import useCampaignsStatsQuery from 'calypso/data/promote-post/use-promote-post-campaigns-stats-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { usePromoteWidget, PromoteWidgetStatus } from 'calypso/lib/promote-post';
import CampaignsList from 'calypso/my-sites/promote-post/components/campaigns-list';
import PostsList from 'calypso/my-sites/promote-post/components/posts-list';
import PostsListBanner from 'calypso/my-sites/promote-post/components/posts-list-banner';
import PromotePostTabBar from 'calypso/my-sites/promote-post/components/promoted-post-filter';
import { getPostsForQuery, isRequestingPostsForQuery } from 'calypso/state/posts/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { unifyCampaigns } from './utils';

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
	order_by: 'id',
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
	const selectedSite = useSelector( getSelectedSite );
	const [ expandedCampaigns, setExpandedCampaigns ] = useState< number[] >( [] );
	const [ alreadyScrolled, setAlreadyScrolled ] = useState< boolean >( false );
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

	const content = [ ...( posts || [] ), ...( pages || [] ), ...( products || [] ) ].sort(
		( a, b ) => b.ID - a.ID
	);

	const isLoading = isWpMobileApp()
		? isLoadingPage && isLoadingPost
		: isLoadingPage && isLoadingPost && isLoadingProducts;

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
						campaigns={ campaignsFull || [] }
						expandedCampaigns={ expandedCampaigns }
						setExpandedCampaigns={ setExpandedCampaigns }
					/>
				</>
			) : (
				<PageViewTracker path="/advertising/:site/posts" title="Advertising > Ready to Blaze" />
			) }

			<QueryPosts siteId={ selectedSiteId } query={ queryPost } postId={ null } />
			<QueryPosts siteId={ selectedSiteId } query={ queryPage } postId={ null } />
			{ ! isWpMobileApp() && (
				<QueryPosts siteId={ selectedSiteId } query={ queryProducts } postId={ null } />
			) }

			{ selectedTab === 'posts' && <PostsList content={ content } isLoading={ isLoading } /> }
		</Main>
	);
}
