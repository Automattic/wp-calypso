import './style.scss';
import { Button } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import useCampaignsQueryPaged, {
	Campaign,
} from 'calypso/data/promote-post/use-promote-post-campaigns-query-paged';
import useCreditBalanceQuery from 'calypso/data/promote-post/use-promote-post-credit-balance-query';
import usePostsQueryPaged from 'calypso/data/promote-post/use-promote-post-posts-query-paged';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import CampaignsList from 'calypso/my-sites/promote-post-i2/components/campaigns-list';
import PostsList from 'calypso/my-sites/promote-post-i2/components/posts-list';
import PromotePostTabBar from 'calypso/my-sites/promote-post-i2/components/promoted-post-filter';
import { SearchOptions } from 'calypso/my-sites/promote-post-i2/components/search-bar';
import { getPagedBlazeSearchData } from 'calypso/my-sites/promote-post-i2/utils';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import CreditBalance from './components/credit-balance';
import { BlazablePost } from './components/post-item';
import PostsListBanner from './components/posts-list-banner';
import useOpenPromoteWidget from './hooks/use-open-promote-widget';
import { getAdvertisingDashboardPath } from './utils';

export type TabType = 'posts' | 'campaigns' | 'credits';
export type TabOption = {
	id: TabType;
	name: string;
	itemCount?: number;
	isCountAmount?: boolean;
	className?: string;
	enabled?: boolean;
};

interface Props {
	tab?: TabType;
}

export type DSPMessage = {
	errorCode?: string;
};

export type PagedBlazeContentData = {
	has_more_pages: boolean;
	total_items?: number;
	items?: Campaign[] | BlazablePost[];
};

export type PagedBlazeSearchResponse = {
	pages: PagedBlazeContentData[];
};

export default function PromotedPosts( { tab }: Props ) {
	const selectedTab = tab && [ 'campaigns', 'posts', 'credits' ].includes( tab ) ? tab : 'posts';
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = selectedSite?.ID || 0;
	const translate = useTranslate();
	const onClickPromote = useOpenPromoteWidget( {
		keyValue: 'post-0', // post 0 means to open post selector in widget
		entrypoint: 'promoted_posts-header',
	} );

	const { data: creditBalance } = useCreditBalanceQuery();

	/* query for campaigns */
	const [ campaignsSearchOptions, setCampaignsSearchOptions ] = useState< SearchOptions >( {} );
	const campaignsQuery = useCampaignsQueryPaged( selectedSiteId ?? 0, campaignsSearchOptions );
	const {
		fetchNextPage: fetchCampaignsNextPage,
		data: campaignsData,
		isLoading: campaignsIsLoading,
		isFetchingNextPage: campaignIsFetching,
		error: campaignError,
		isRefetching: campaignIsRefetching,
	} = campaignsQuery;

	const campaignIsLoadingNewContent = campaignsIsLoading || campaignIsRefetching;

	const queryClient = useQueryClient();
	const initialCampaignQueryState = queryClient.getQueryState( [
		'promote-post-campaigns',
		selectedSiteId,
		'',
	] );

	const { has_more_pages: campaignsHasMorePages, items: campaigns } = getPagedBlazeSearchData(
		'campaigns',
		campaignsData
	);

	const { total_items: totalCampaignsUnfiltered } = getPagedBlazeSearchData(
		'campaigns',
		initialCampaignQueryState?.data as PagedBlazeSearchResponse
	);

	/* query for posts */
	const [ postsSearchOptions, setPostsSearchOptions ] = useState< SearchOptions >( {} );
	const postsQuery = usePostsQueryPaged( selectedSiteId ?? 0, postsSearchOptions );

	const {
		fetchNextPage: fetchPostsNextPage,
		data: postsData,
		isLoading: postsIsLoading,
		isFetchingNextPage: postIsFetching,
		error: postError,
		isRefetching: postIsRefetching,
	} = postsQuery;

	const postsIsLoadingNewContent = postsIsLoading || postIsRefetching;

	const initialPostQueryState = queryClient.getQueryState( [
		'promote-post-posts',
		selectedSiteId,
		'',
	] );

	const { has_more_pages: postsHasMorePages, items: posts } = getPagedBlazeSearchData(
		'posts',
		postsData
	);
	const { total_items: totalPostsUnfiltered } = getPagedBlazeSearchData(
		'posts',
		initialPostQueryState?.data as PagedBlazeSearchResponse
	);

	const tabs: TabOption[] = [
		{
			id: 'posts',
			name: translate( 'Ready to promote' ),
			itemCount: totalPostsUnfiltered,
		},
		{
			id: 'campaigns',
			name: translate( 'Campaigns' ),
			itemCount: totalCampaignsUnfiltered,
		},
		{
			id: 'credits',
			name: translate( 'Credits' ),
			className: 'pull-right',
			itemCount: creditBalance,
			isCountAmount: true,
			enabled: creditBalance !== undefined && creditBalance !== 0,
		},
	];

	useEffect( () => {
		document.querySelector( 'body' )?.classList.add( 'is-section-promote-post-i2' );
	}, [] );

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

	const showBanner = ! campaignsIsLoading && ( totalCampaignsUnfiltered || 0 ) < 3;

	const headerSubtitle = ( isMobile: boolean ) => {
		if ( ! isMobile && showBanner ) {
			// Do not show subtitle for desktops where banner should be shown
			return null;
		}

		const baseClassName = 'promote-post-i2__header-subtitle';
		return (
			<div
				className={ classNames(
					baseClassName,
					`${ baseClassName }_${ isMobile ? 'mobile' : 'desktop' }`
				) }
			>
				{ translate(
					'Use Blaze to grow your audience by promoting your content across Tumblr and WordPress.com.'
				) }
			</div>
		);
	};

	return (
		<Main wideLayout className="promote-post-i2">
			<DocumentHead title={ translate( 'Advertising' ) } />

			<div className="promote-post-i2__top-bar">
				<FormattedHeader
					brandFont
					className={ classNames( 'advertising__page-header', {
						'advertising__page-header_has-banner': showBanner,
					} ) }
					children={ headerSubtitle( false ) /* for desktop */ }
					headerText={ translate( 'Advertising' ) }
					align="left"
				/>

				<div className="promote-post-i2__top-bar-buttons">
					<Button compact className="posts-list-banner__learn-more">
						<InlineSupportLink supportContext="advertising" showIcon={ false } />
					</Button>
					<Button primary onClick={ onClickPromote }>
						{ translate( 'Promote' ) }
					</Button>
				</div>
			</div>
			{ headerSubtitle( true ) /* for mobile */ }

			{ showBanner && <PostsListBanner /> }

			<PromotePostTabBar tabs={ tabs } selectedTab={ selectedTab } />

			{ /* Render campaigns tab */ }
			{ selectedTab === 'campaigns' && (
				<>
					<PageViewTracker
						path={ getAdvertisingDashboardPath( '/:site/campaigns' ) }
						title="Advertising > Campaigns"
					/>
					<CampaignsList
						isLoading={ campaignIsLoadingNewContent }
						isFetching={ campaignIsFetching }
						isError={ campaignError as DSPMessage }
						fetchNextPage={ fetchCampaignsNextPage }
						handleSearchOptions={ setCampaignsSearchOptions }
						totalCampaigns={ totalCampaignsUnfiltered || 0 }
						hasMorePages={ campaignsHasMorePages }
						campaigns={ campaigns as Campaign[] }
					/>
				</>
			) }

			{ /* Render credits tab */ }
			{ selectedTab === 'credits' && (
				<>
					<PageViewTracker
						path={ getAdvertisingDashboardPath( '/:site/credits' ) }
						title="Advertising > Credits"
					/>
					<CreditBalance balance={ creditBalance } />
				</>
			) }

			{ /* Render products tab */ }
			{ selectedTab !== 'campaigns' && selectedTab !== 'credits' && (
				<>
					<PageViewTracker
						path={ getAdvertisingDashboardPath( '/:site/posts' ) }
						title="Advertising > Ready to Promote"
					/>
					<PostsList
						isLoading={ postsIsLoadingNewContent }
						isFetching={ postIsFetching }
						isError={ postError as DSPMessage }
						fetchNextPage={ fetchPostsNextPage }
						handleSearchOptions={ setPostsSearchOptions }
						totalCampaigns={ totalPostsUnfiltered || 0 }
						hasMorePages={ postsHasMorePages }
						posts={ posts as BlazablePost[] }
					/>
				</>
			) }
		</Main>
	);
}
