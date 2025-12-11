import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import './style.scss';
import { formatNumber } from '@automattic/number-formatters';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import cookie from 'cookie';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Notice from 'calypso/components/notice';
import {
	BlazablePost,
	BlazePagedItem,
	Campaign,
	CampaignQueryResult,
	PromotePostWarning,
} from 'calypso/data/promote-post/types';
import useBillingSummaryQuery from 'calypso/data/promote-post/use-promote-post-billing-summary-query';
import useCampaignsQueryPaged from 'calypso/data/promote-post/use-promote-post-campaigns-query-paged';
import useCreditBalanceQuery from 'calypso/data/promote-post/use-promote-post-credit-balance-query';
import { usePaymentsQuery } from 'calypso/data/promote-post/use-promote-post-payments-query';
import usePostsQueryPaged, {
	usePostsQueryStats,
} from 'calypso/data/promote-post/use-promote-post-posts-query-paged';
import { useJetpackBlazeVersionCheck } from 'calypso/lib/promote-post';
import CampaignsList from 'calypso/my-sites/promote-post-i2/components/campaigns-list';
import PaymentLinks from 'calypso/my-sites/promote-post-i2/components/payment-links';
import PaymentsList from 'calypso/my-sites/promote-post-i2/components/payments-list';
import { PaymentReceipt } from 'calypso/my-sites/promote-post-i2/components/payments-receipt';
import PostsList, {
	postsNotReadyErrorMessage,
} from 'calypso/my-sites/promote-post-i2/components/posts-list';
import PromotePostTabBar from 'calypso/my-sites/promote-post-i2/components/promoted-post-filter';
import {
	SORT_OPTIONS_DEFAULT,
	SearchOptions,
} from 'calypso/my-sites/promote-post-i2/components/search-bar';
import { getPagedBlazeSearchData } from 'calypso/my-sites/promote-post-i2/utils';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import BlazePageViewTracker from './components/blaze-page-view-tracker';
import BlazePluginBanner from './components/blaze-plugin-banner';
import CampaignsTotalStats from './components/campaigns-total-stats';
import MainWrapper from './components/main-wrapper';
import PostsListBanner from './components/posts-list-banner';
import TspBanner from './components/tsp-banner';
import useOpenPromoteWidget from './hooks/use-open-promote-widget';
import { getAdvertisingDashboardPath } from './utils';

export const TAB_OPTIONS = [ 'posts', 'campaigns', 'credits', 'payments' ] as const;
const isWooStore = config.isEnabled( 'is_running_in_woo_site' );
export type TabType = ( typeof TAB_OPTIONS )[ number ];
export type TabOption = {
	id: TabType;
	name: string;
	itemCount?: number;
	isCountAmount?: boolean;
	className?: string;
	enabled?: boolean;
	label?: string;
};

interface Props {
	tab?: TabType;
	receiptId?: number;
}

export type DSPMessage = {
	errorCode?: string;
};

export type PagedBlazeContentData = {
	has_more_pages: boolean;
	total_items?: number;
	items?: BlazePagedItem[];
	warnings?: PromotePostWarning[];
	campaigns_stats?: {
		total_impressions: number;
		total_clicks: number;
	};
	tsp_eligible: boolean;
};

export type PagedBlazeSearchResponse = {
	pages: PagedBlazeContentData[];
};

const POST_DEFAULT_SEARCH_OPTIONS: SearchOptions = {
	order: SORT_OPTIONS_DEFAULT,
	filter: {
		postType: isWooStore ? 'product' : '',
	},
};

const TSP_BANNER_COLLAPSED_COOKIE = 'blaze-tsp-banner-collapsed';

const setTspBannerCollapsedCookie = ( value: boolean ) => {
	document.cookie = cookie.serialize( TSP_BANNER_COLLAPSED_COOKIE, ( +value ).toString(), {
		path: '/',
		maxAge: 365 * 24 * 60 * 60, // 1 year
	} );
};

export default function PromotedPosts( { tab, receiptId }: Props ) {
	const selectedTab = tab && TAB_OPTIONS.includes( tab ) ? tab : 'posts';
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = selectedSite?.ID || 0;
	const translate = useTranslate();
	const onClickPromote = useOpenPromoteWidget( {
		keyValue: 'post-0', // post 0 means to open post selector in widget
		entrypoint: 'promoted_posts-header',
	} );
	const isSelfHosted = useSelector( ( state ) =>
		isJetpackSite( state, selectedSiteId, { treatAtomicAsJetpackSite: false } )
	);

	const { data: creditBalance = '0.00' } = useCreditBalanceQuery();

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

	const { data, isLoading: isLoadingBillingSummary } = useBillingSummaryQuery();

	const [ fetchPaymentsForCurrentSite, setFetchPaymentsForCurrentSite ] = useState( true );
	const arePaymentsEnabled = useJetpackBlazeVersionCheck( selectedSiteId, '14.9-alpha', '0.8.0' );
	/* query for payments */
	const {
		data: payments,
		isLoading: isLoadingPayments,
		isFetching: isFetchingPayments,
		error: paymentsError,
	} = usePaymentsQuery(
		arePaymentsEnabled,
		fetchPaymentsForCurrentSite ? selectedSiteId : undefined
	);

	const paymentBlocked = data?.paymentsBlocked ?? false;

	const shouldDisplayDebtAndPaymentLinks =
		! isLoadingBillingSummary &&
		data?.debt !== undefined &&
		! data?.paymentsBlocked &&
		data?.paymentLinks &&
		data?.paymentLinks.length > 0 &&
		parseFloat( data.debt ) > 0 &&
		selectedTab !== 'payments';

	const {
		has_more_pages: campaignsHasMorePages,
		items: pagedCampaigns,
		campaigns_stats: campaignsStats,
		tsp_eligible: campaignsTspEligible,
	} = getPagedBlazeSearchData( 'campaigns', campaignsData );

	const { total_items: totalCampaignsUnfiltered } = getPagedBlazeSearchData(
		'campaigns',
		initialCampaignQueryState?.data as InfiniteData< CampaignQueryResult >
	);

	/* query for posts */
	const { data: postsStatsData } = usePostsQueryStats( selectedSiteId ?? 0 );
	const { total_items: totalPostsUnfiltered } = postsStatsData || {};

	const [ postsSearchOptions, setPostsSearchOptions ] = useState< SearchOptions >(
		POST_DEFAULT_SEARCH_OPTIONS
	);
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

	const {
		has_more_pages: postsHasMorePages,
		items: posts,
		warnings: postsWarnings,
		tsp_eligible: postsTspEligible,
	} = getPagedBlazeSearchData( 'posts', postsData );

	const tabs: TabOption[] = [
		{
			id: 'posts',
			name: translate( 'Ready to promote' ),
			itemCount: totalPostsUnfiltered,
			label: translate( 'Posts' ),
		},
		{
			id: 'campaigns',
			name: translate( 'Campaigns' ),
			itemCount: totalCampaignsUnfiltered,
			label: translate( 'Campaigns' ),
		},
	];

	if ( arePaymentsEnabled ) {
		tabs.push( {
			id: 'payments',
			name: translate( 'Payments' ),
			className: 'payments',
			itemCount: payments?.total,
			label: translate( 'Payments' ),
		} );
	}

	const cookies = cookie.parse( document.cookie );
	const userHasCollapsedTspBanner = ( cookies[ TSP_BANNER_COLLAPSED_COOKIE ] ?? '0' ) === '1';

	const showTspBanner = // TSP Banner has a higher priority than the regular banner
		( ! campaignsIsLoading && campaignsTspEligible ) || ( ! postsIsLoading && postsTspEligible );

	const [ isTspBannerCollapsed, setIsTspBannerCollapsed ] = useState( userHasCollapsedTspBanner );

	const showRegularBanner =
		! showTspBanner && ! campaignsIsLoading && ( totalCampaignsUnfiltered || 0 ) < 3;

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
								<a href={ `/settings/reading/${ selectedSite.domain }` } rel="noreferrer" />
							),
						},
					}
				) }
			/>
		);
	}

	const isBlazePlugin = config.isEnabled( 'is_running_in_blaze_plugin' );
	const isWooBlaze = config.isEnabled( 'is_running_in_woo_site' );

	const headerSubtitle = ( isMobile: boolean ) => {
		if ( ! isMobile && showRegularBanner ) {
			// Do not show subtitle for desktops where banner should be shown
			return null;
		}

		const baseClassName = 'promote-post-i2__header-subtitle';
		return (
			<div
				className={ clsx(
					baseClassName,
					`${ baseClassName }_${ isMobile ? 'mobile' : 'desktop' }`
				) }
			>
				{ isWooBlaze
					? translate(
							'Increase your sales by promoting your products and pages across millions of blogs and sites.'
					  )
					: translate(
							'Use Blaze to grow your audience by promoting your content across Tumblr and WordPress.com.'
					  ) }
			</div>
		);
	};

	const renderWarningNotices = ( warnings?: PromotePostWarning[] ) => {
		const content = [];

		for ( const item of warnings ?? [] ) {
			switch ( item ) {
				case 'sync_in_progress':
					content.push(
						<Notice
							key={ item }
							className="promote-post-notice"
							status="is-info"
							showDismiss={ false }
						>
							{ postsNotReadyErrorMessage }
						</Notice>
					);
					break;
			}
		}

		return content.length ? (
			<div className="promote-post-i2__warnings-wrapper promote-post-i2__aux-wrapper">
				{ content }
			</div>
		) : null;
	};

	const toggleTspBanner = () => {
		setTspBannerCollapsedCookie( ! isTspBannerCollapsed );
		setIsTspBannerCollapsed( ! isTspBannerCollapsed );
	};

	return (
		<MainWrapper>
			<DocumentHead title={ translate( 'Advertising' ) } />

			<div className="promote-post-i2__top-bar">
				<FormattedHeader
					brandFont
					className={ clsx( 'advertising__page-header', {
						'advertising__page-header_has-banner': showRegularBanner,
					} ) }
					children={ headerSubtitle( false ) /* for desktop */ }
					headerText={ isBlazePlugin ? translate( 'Blaze Ads' ) : translate( 'Advertising' ) }
					align="left"
				/>

				<div className="promote-post-i2__top-bar-buttons">
					<InlineSupportLink
						supportContext="advertising"
						className="button posts-list-banner__learn-more"
						showIcon={ false }
						showSupportModal={ ! isSelfHosted }
					/>
					<Button
						variant="primary"
						onClick={ onClickPromote }
						disabled={ isLoadingBillingSummary || paymentBlocked }
					>
						{ translate( 'Promote' ) }
					</Button>
				</div>
			</div>
			{ headerSubtitle( true ) /* for mobile */ }

			{ /* Banners */ }
			{ showRegularBanner && ( isBlazePlugin ? <BlazePluginBanner /> : <PostsListBanner /> ) }

			{ ! showRegularBanner && showTspBanner && (
				<TspBanner onToggle={ toggleTspBanner } isCollapsed={ isTspBannerCollapsed } />
			) }

			{ parseFloat( creditBalance ) > 0 && (
				<div className="blaze-credits-container">
					<div className="blaze-credits-container__item">
						<div className="blaze-credits-container__label">
							{ translate( 'Credits' ) }
							<InlineSupportLink
								showIcon
								className="credits-inline-support-link"
								iconSize={ 18 }
								showText={ false }
								supportPostId={ 240330 }
								supportLink={ localizeUrl(
									'https://wordpress.com/support/promote-a-post/blaze-credits/'
								) }
							/>
						</div>
						<div className="blaze-credits-container__result">
							{ '$' + formatNumber( parseFloat( creditBalance ), { decimals: 2 } ) }
						</div>
					</div>
				</div>
			) }

			{
				// TODO: Uncomment when DebtNotifier is implemented
				/* <DebtNotifier /> */
			 }
			<CampaignsTotalStats
				totalImpressions={ campaignsStats?.total_impressions }
				totalClicks={ campaignsStats?.total_clicks }
				outerContainerClass={ ! showRegularBanner ? 'promote-post-i2__divider' : '' }
			/>

			<PromotePostTabBar tabs={ tabs } selectedTab={ selectedTab } />

			{ ! isLoadingBillingSummary && paymentBlocked && (
				<Notice
					showDismiss={ false }
					status="is-error"
					icon="notice-outline"
					className="promote-post-i2__payment-blocked-notice"
					theme="light"
				>
					{ translate(
						'Your account does not have the capabilities to promote. {{wpcomSupport}}Reach out to us{{/wpcomSupport}} for support.',
						{
							components: {
								wpcomSupport: (
									<a
										href={ localizeUrl( 'https://wordpress.com/help/contact' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</Notice>
			) }

			{ shouldDisplayDebtAndPaymentLinks && (
				<>
					<Notice
						theme="light"
						showDismiss={ false }
						status="is-error"
						icon="notice-outline"
						className="promote-post-i2__payment-blocked-notice wpcomsh-notice"
					>
						{ translate(
							'Your account currently has an outstanding balance of $%(debtAmount)s. Please resolve this using the links below before creating new campaigns.',
							{
								args: {
									debtAmount: data.debt || '',
									// this is just a fallback. debt should never be undefined
									// it is checked in shouldDisplayDebtAndPaymentLinks
								},
							}
						) }
					</Notice>
					<PaymentLinks payment_links={ data?.paymentLinks } />
				</>
			) }

			{ /* Render campaigns tab */ }
			{ selectedTab === 'campaigns' && (
				<>
					<BlazePageViewTracker
						path={ getAdvertisingDashboardPath( '/campaigns/:site' ) }
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
						campaigns={ pagedCampaigns as Campaign[] }
					/>
				</>
			) }

			{ /* Render payments tab */ }
			{ selectedTab === 'payments' && (
				<>
					<BlazePageViewTracker
						path={ getAdvertisingDashboardPath(
							receiptId ? '/payments/receipt/:receiptId/:site' : '/payments/:site'
						) }
						title={ receiptId ? 'Advertising > Payment Receipt' : 'Advertising > Payments' }
					/>

					{ receiptId ? (
						<div className="payment-receipt-container">
							<div className="payment-receipt-container__header">
								<button
									className="payment-receipt-container__back-button"
									onClick={ () => page( getAdvertisingDashboardPath( '/payments' ) ) }
								>
									{ translate( '← Back to payments' ) }
								</button>
							</div>
							<PaymentReceipt paymentId={ receiptId } />
						</div>
					) : (
						<PaymentsList
							isLoading={ isLoadingPayments }
							isError={ paymentsError as DSPMessage }
							isFetching={ isFetchingPayments }
							payments={ payments?.payments }
							selectedPaymentsFilter={ fetchPaymentsForCurrentSite }
							setFetchPaymentsForCurrentSite={ setFetchPaymentsForCurrentSite }
						/>
					) }
				</>
			) }

			{ /* Render posts tab */ }
			{ selectedTab !== 'campaigns' && selectedTab !== 'credits' && selectedTab !== 'payments' && (
				<>
					{ renderWarningNotices( postsWarnings ) }

					<BlazePageViewTracker
						path={ getAdvertisingDashboardPath( '/posts/:site' ) }
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
						hasPaymentsBlocked={ paymentBlocked }
					/>
				</>
			) }
		</MainWrapper>
	);
}
