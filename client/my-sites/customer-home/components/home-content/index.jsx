import { Button, Card, Gridicon } from '@automattic/components';
import { eye } from '@automattic/components/src/icons';
import { Icon, people, starEmpty, commentContent } from '@wordpress/icons';
import CountCard from 'calypso/my-sites/stats/components/highlight-cards/count-card';
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { SET_UP_EMAIL_AUTHENTICATION_FOR_YOUR_DOMAIN } from '@automattic/urls';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import SiteIcon from 'calypso/blocks/site-icon';
import AsyncLoad from 'calypso/components/async-load';
import EmptyContent from 'calypso/components/empty-content';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import ResurrectedWelcomeModalGate from 'calypso/components/resurrected-welcome-modal';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import useActivityLogQuery from 'calypso/data/activity-log/use-activity-log-query';
import useDomainDiagnosticsQuery from 'calypso/data/domains/diagnostics/use-domain-diagnostics-query';
import useHomeLayoutQuery, { getCacheKey } from 'calypso/data/home/use-home-layout-query';
import useSkipCurrentViewMutation from 'calypso/data/home/use-skip-current-view-mutation';
import { usePurchasePlanNotification } from 'calypso/landing/stepper/declarative-flow/internals/hooks/use-purchase-plan-notification';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { setDomainNotice } from 'calypso/lib/domains/set-domain-notice';
import { preventWidows } from 'calypso/lib/formatting';
import { getQueryArgs } from 'calypso/lib/query-args';
import { useCelebrateLaunchModalSideEffects } from 'calypso/my-sites/customer-home/celebrate-site-launch-modal/use-side-effects';
import Primary from 'calypso/my-sites/customer-home/locations/primary';
import Secondary from 'calypso/my-sites/customer-home/locations/secondary';
import Tertiary from 'calypso/my-sites/customer-home/locations/tertiary';
import WooCommerceHomePlaceholder from 'calypso/my-sites/customer-home/wc-home-placeholder';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserDisplayName } from 'calypso/state/current-user/selectors';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors';
import { verifyIcannEmail } from 'calypso/state/domains/management/actions';
import { withJetpackConnectionProblem } from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem';
import {
	getPluginOnSite,
	isRequesting as isRequestingInstalledPlugins,
} from 'calypso/state/plugins/installed/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getRequest from 'calypso/state/selectors/get-request';
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isUserRegistrationDaysWithinRange from 'calypso/state/selectors/is-user-registration-days-within-range';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { launchSite } from 'calypso/state/sites/launch/actions';
import { getIsSiteLaunchCelebrationModalOpen } from 'calypso/state/sites/launch/selectors';
import { isSiteOnWooExpressEcommerceTrial } from 'calypso/state/sites/plans/selectors';
import {
	canCurrentUserUseCustomerHome,
	getSitePlan,
	getSiteOption,
} from 'calypso/state/sites/selectors';
import {
	getSiteStatsNormalizedData,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { FullScreenLaunchpad } from '../full-screen-launchpad';
import openSyncUrlInStudio from './studio-deeplink';

import './style.scss';

function getTimeOfDayGreeting( translate ) {
	const hour = new Date().getHours();
	if ( hour >= 5 && hour < 12 ) {
		return translate( 'Good morning' );
	}
	if ( hour >= 12 && hour < 18 ) {
		return translate( 'Good afternoon' );
	}
	if ( hour >= 18 && hour < 22 ) {
		return translate( 'Good evening' );
	}
	return translate( 'Good night' );
}

function getFirstName( displayName ) {
	if ( ! displayName ) {
		return '';
	}
	return displayName.split( ' ' )[ 0 ];
}


const HomeContent = ( {
	canUserUseCustomerHome,
	hasWooCommerceInstalled,
	isJetpack,
	isPossibleJetpackConnectionProblem,
	isRequestingSitePlugins,
	isSiteLaunching,
	site,
	siteId,
	trackViewSiteAction,
	trackStudioSyncConnectSite,
	isSiteWooExpressEcommerceTrial,
	ssoModuleActive,
	fetchingJetpackModules,
	handleVerifyIcannEmail,
	isAdmin,
	dashboardOptIn,
	displayName,
	todayViews,
	todayVisitors,
	todayLikes,
	todayComments,
	recentComments,
	isStatsLoading,
} ) => {
	const celebrateLaunchModalIsOpen = useSelector( ( state ) =>
		getIsSiteLaunchCelebrationModalOpen( state, siteId )
	);
	const [ launchedSiteId, setLaunchedSiteId ] = useState( null );
	const queryClient = useQueryClient();
	const translate = useTranslate();
	const isP2 = site?.options?.is_wpforteams_site;

	const { data: layout, isLoading, error: homeLayoutError } = useHomeLayoutQuery( siteId );
	const { skipCurrentView } = useSkipCurrentViewMutation( siteId );

	// Fetch the latest 10 activity log entries for the Activity column
	const { data: activityLogs, isLoading: isActivityLoading } = useActivityLogQuery(
		siteId,
		{ number: 10, aggregate: false },
		{ enabled: !! siteId }
	);
	// Recursively find a node with type === 'post' in the activityDescription tree
	const findPostNode = ( blocks ) => {
		if ( ! Array.isArray( blocks ) ) {
			return null;
		}
		for ( const block of blocks ) {
			if ( ! block || typeof block !== 'object' ) {
				continue;
			}
			if ( block.type === 'post' ) {
				return block;
			}
			// Check nested children
			if ( Array.isArray( block.children ) ) {
				const found = findPostNode( block.children );
				if ( found ) {
					return found;
				}
			}
		}
		return null;
	};

	// Extract the full description text from activityDescription blocks
	const getDescriptionText = ( blocks ) => {
		if ( ! Array.isArray( blocks ) ) {
			return '';
		}
		return blocks
			.map( ( block ) => {
				if ( typeof block === 'string' ) {
					return block;
				}
				if ( block && typeof block === 'object' && block.text ) {
					return block.text;
				}
				return '';
			} )
			.join( '' )
			.trim();
	};

	// Debug: log first activity entry to see available fields
	if ( activityLogs?.length ) {
		// eslint-disable-next-line no-console
		console.log( '[Dashboard Debug] First activity entry:', activityLogs[ 0 ] );
	}

	const recentActivity = ( activityLogs || [] ).slice( 0, 6 ).map( ( entry ) => {
		let postLink = null;
		let postTitle = null;
		const isPostActivity = entry.activityName && (
			entry.activityName.startsWith( 'post__' ) ||
			entry.activityName.startsWith( 'page__' )
		);

		if ( isPostActivity ) {
			const obj = entry.activityObject || {};

			// Try common field names for post title from the raw API object
			postTitle = obj.name || obj.post_title || obj.title || null;

			// Try common field names for post ID
			const postId = obj.object_id || obj.post_id || obj.id || null;
			if ( postId && site?.slug ) {
				postLink = `/post/${ site.slug }/${ postId }`;
			}

			// Fallback: try to find a post node in the parsed description tree
			if ( ! postTitle && Array.isArray( entry.activityDescription ) ) {
				const postBlock = findPostNode( entry.activityDescription );
				if ( postBlock ) {
					postTitle = postBlock.text || null;
					if ( ! postLink && postBlock.postId && site?.slug ) {
						postLink = `/post/${ site.slug }/${ postBlock.postId }`;
					}
				}
			}

			// Fallback: get the text from description blocks
			if ( ! postTitle && Array.isArray( entry.activityDescription ) ) {
				const descText = getDescriptionText( entry.activityDescription );
				if ( descText && descText !== entry.activityTitle ) {
					postTitle = descText;
				}
			}

			// eslint-disable-next-line no-console
			console.log( '[Dashboard Debug] Post activity:', entry.activityName, { obj, postTitle, postLink, desc: entry.activityDescription } );
		}

		return {
			icon: entry.activityIcon || 'info-outline',
			title: entry.activityTitle || '',
			actor: entry.actorName || '',
			time: moment( entry.activityTs ).fromNow(),
			postTitle,
			postLink,
		};
	} );

	const [ focusedLaunchpadDismissed, setFocusedLaunchpadDismissed ] = useState( false );

	const siteDomains = useSelector( ( state ) => getDomainsBySiteId( state, siteId ) );
	const customDomains = siteDomains?.filter( ( domain ) => ! domain.isWPCOMDomain );
	const customDomain = customDomains?.length ? customDomains[ 0 ] : undefined;
	const primaryDomain = customDomains?.find( ( domain ) => domain.isPrimary );

	const {
		data: domainDiagnosticData,
		isFetching: isFetchingDomainDiagnostics,
		refetch: refetchDomainDiagnosticData,
	} = useDomainDiagnosticsQuery( primaryDomain?.name, {
		staleTime: 5 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		enabled: primaryDomain !== undefined && primaryDomain.isMappedToAtomicSite,
	} );
	const emailDnsDiagnostics = domainDiagnosticData?.email_dns_records;
	const [ dismissedEmailDnsDiagnostics, setDismissedEmailDnsDiagnostics ] = useState( false );

	usePurchasePlanNotification( siteId, site?.plan?.product_slug );

	useEffect( () => {
		if ( ! isSiteLaunching && launchedSiteId === siteId ) {
			queryClient.invalidateQueries( { queryKey: getCacheKey( siteId ) } );
			setLaunchedSiteId( null );
		}
	}, [ isSiteLaunching, launchedSiteId, queryClient, siteId ] );

	useEffect( () => {
		if ( isSiteLaunching ) {
			setLaunchedSiteId( siteId );
		}
	}, [ isSiteLaunching, siteId ] );

	useEffect( () => {
		if ( emailDnsDiagnostics?.dismissed_email_dns_issues_notice ) {
			setDismissedEmailDnsDiagnostics( true );
		}
	}, [ emailDnsDiagnostics ] );

	useEffect( () => {
		const queryArgs = getQueryArgs();
		const studioSiteId = queryArgs.studioSiteId;
		const autoOpenPush = queryArgs.autoOpenPush === 'true';

		if ( ! studioSiteId ) {
			return;
		}
		trackStudioSyncConnectSite( false );
		openSyncUrlInStudio( studioSiteId, siteId, autoOpenPush );
	}, [ siteId, trackStudioSyncConnectSite ] );

	const isFirstSecondaryCardInPrimaryLocation =
		Array.isArray( layout?.primary ) &&
		layout.primary.length === 0 &&
		Array.isArray( layout?.secondary ) &&
		layout.secondary.length > 0;

	const { addCelebrateLaunchQueryParams } = useCelebrateLaunchModalSideEffects( siteId );

	if ( ! canUserUseCustomerHome ) {
		const title = translate( 'This page is not available on this site.' );
		return <EmptyContent title={ preventWidows( title ) } />;
	}

	if ( layout?.view_name === 'VIEW_FOCUSED_LAUNCHPAD' && ! focusedLaunchpadDismissed ) {
		return (
			<FullScreenLaunchpad
				onClose={ async () => {
					setFocusedLaunchpadDismissed( true );
					await updateLaunchpadSettings( siteId, { launchpad_screen: 'skipped' } );
					skipCurrentView( null, true );
				} }
				beforeSiteLaunchRefetch={ addCelebrateLaunchQueryParams }
				onSiteLaunch={ () => {
					setFocusedLaunchpadDismissed( true );
				} }
			/>
		);
	}

	// Ecommerce Plan's Home redirects to WooCommerce Home, so we show a placeholder
	// while doing the redirection.
	if (
		isSiteWooExpressEcommerceTrial &&
		( isRequestingSitePlugins || hasWooCommerceInstalled ) &&
		( fetchingJetpackModules || ssoModuleActive )
	) {
		return <WooCommerceHomePlaceholder />;
	}

	const headerActions = (
		<>
			<Button href={ site.URL } onClick={ trackViewSiteAction } style={ { color: '#fff', backgroundColor: '#000', borderColor: '#000' } }>
				{ translate( 'View site' ) }
			</Button>
		</>
	);
	const header = (
		<div className="customer-home__heading">
			<NavigationHeader
				compactBreadcrumb={ false }
				navigationItems={ [] }
				mobileItem={ null }
				title={ translate( 'Your Home' ) }
				subtitle={ translate( 'Your hub for next steps, support center, and quick links.' ) }
			>
				{ headerActions }
			</NavigationHeader>

			<div className="customer-home__site-content">
				<SiteIcon site={ site } size={ 58 } />
				<div className="customer-home__site-info">
					<div className="customer-home__site-title">{ site.name }</div>
					<a
						href={ site.URL }
						className="customer-home__site-domain"
						onClick={ trackViewSiteAction }
					>
						<span className="customer-home__site-domain-text">{ site.domain }</span>
					</a>
				</div>
			</div>
		</div>
	);

	const renderUnverifiedEmailNotice = () => {
		if ( customDomain?.isPendingIcannVerification ) {
			return (
				<Notice
					text={ translate(
						'You must respond to the ICANN email to verify your domain email address or your domain will stop working. Please check your inbox and respond to the email.'
					) }
					icon="cross-circle"
					showDismiss={ false }
					status="is-warning"
				>
					<NoticeAction onClick={ () => handleVerifyIcannEmail( customDomain.name ) }>
						{ translate( 'Resend Email' ) }
					</NoticeAction>
				</Notice>
			);
		}
		return null;
	};

	const renderDnsSettingsDiagnosticNotice = () => {
		if (
			dismissedEmailDnsDiagnostics ||
			isFetchingDomainDiagnostics ||
			! emailDnsDiagnostics ||
			emailDnsDiagnostics.code === 'domain_not_mapped_to_atomic_site' ||
			emailDnsDiagnostics.all_essential_email_dns_records_are_correct
		) {
			return null;
		}

		return (
			<Notice
				text={ translate(
					"There are some issues with your domain's email DNS settings. {{diagnosticLink}}Click here{{/diagnosticLink}} to see the full diagnostic for your domain. {{supportLink}}Learn more{{/supportLink}}.",
					{
						components: {
							diagnosticLink: (
								<a
									href={ domainManagementEdit( siteId, primaryDomain.name, null, {
										diagnostics: true,
									} ) }
								/>
							),
							supportLink: (
								<a href={ localizeUrl( SET_UP_EMAIL_AUTHENTICATION_FOR_YOUR_DOMAIN ) } />
							),
						},
					}
				) }
				icon="cross-circle"
				showDismiss
				onDismissClick={ () => {
					setDismissedEmailDnsDiagnostics( true );
					setDomainNotice( primaryDomain.name, 'email-dns-records-diagnostics', 'ignored', () => {
						refetchDomainDiagnosticData();
					} );
				} }
				status="is-warning"
			/>
		);
	};

	const renderStudioSyncNotice = () => {
		const studioSiteId = getQueryArgs().studioSiteId;
		const autoOpenPush = getQueryArgs().autoOpenPush === 'true';
		if ( ! studioSiteId ) {
			return null;
		}

		return (
			<Notice
				className="customer-home__studio-sync-notice"
				text={ translate( 'Open your Studio site to start syncing.' ) }
				icon="sync"
				showDismiss={ false }
				status="is-info"
			>
				<NoticeAction
					onClick={ () => {
						trackStudioSyncConnectSite( true );
						openSyncUrlInStudio( studioSiteId, siteId, autoOpenPush );
					} }
					external
				>
					{ translate( 'Open Studio' ) }
				</NoticeAction>
			</Notice>
		);
	};

	const greeting = `${ getTimeOfDayGreeting( translate ) }, ${ getFirstName( displayName ) }.`;

	const weeklyStatsQuery = {
		unit: 'day',
		quantity: 7,
		stat_fields: 'views,visitors',
	};

	const dashboardOverview = (
		<div className="customer-home__dashboard-overview">
			<QuerySiteStats siteId={ siteId } statType="statsVisits" query={ weeklyStatsQuery } />
			<div className="customer-home__greeting">
				<h1 className="customer-home__greeting-title">{ greeting }</h1>
				<p className="customer-home__greeting-subtitle">
					{ translate( 'Here is a quick overview about what happened since your last visit:' ) }
				</p>
			</div>
			<div className="customer-home__overview-grid">
				<CountCard
					heading={ translate( 'Views' ) }
					icon={ <Icon icon={ eye } /> }
					value={ todayViews || 0 }
					showValueTooltip
				/>
				<CountCard
					heading={ translate( 'Visitors' ) }
					icon={ <Icon icon={ people } /> }
					value={ todayVisitors || 0 }
					showValueTooltip
				/>
				<CountCard
					heading={ translate( 'Likes' ) }
					icon={ <Icon icon={ starEmpty } /> }
					value={ todayLikes || 0 }
					showValueTooltip
				/>
				<CountCard
					heading={ translate( 'Comments' ) }
					icon={ <Icon icon={ commentContent } /> }
					value={ todayComments || 0 }
					showValueTooltip
				/>

				{ /* Middle Column: Activity (Jetpack Activity Log) */ }
				<Card className="customer-home__overview-card">
					<h3 className="customer-home__overview-card-title">{ translate( 'Activity' ) }</h3>
					{ isActivityLoading ? (
						<div className="customer-home__overview-placeholder" />
					) : recentActivity.length > 0 ? (
						<ul className="customer-home__activity-list">
							{ recentActivity.map( ( item, index ) => (
								<li key={ index } className="customer-home__activity-item">
									<span className="customer-home__activity-icon">
										<Gridicon icon={ item.icon } size={ 18 } />
									</span>
									<div className="customer-home__activity-content">
										<span className="customer-home__activity-text">
											{ item.title }
										</span>
										{ item.postTitle && (
											item.postLink ? (
												<a href={ item.postLink } className="customer-home__activity-post-title customer-home__activity-post-title--link">
													{ item.postTitle }
												</a>
											) : (
												<span className="customer-home__activity-post-title">
													{ item.postTitle }
												</span>
											)
										) }
										<span className="customer-home__activity-meta">
											{ item.actor && <span>{ item.actor }</span> }
											{ item.actor && <span className="customer-home__activity-meta-sep">&middot;</span> }
											<span>{ item.time }</span>
										</span>
									</div>
								</li>
							) ) }
						</ul>
					) : (
						<p className="customer-home__overview-empty">{ translate( 'No recent activity.' ) }</p>
					) }
				</Card>

				{ /* Right Column: Inbox */ }
				<Card className="customer-home__overview-card">
					<h3 className="customer-home__overview-card-title">{ translate( 'Inbox' ) }</h3>
					{ recentComments && recentComments.length > 0 ? (
						<ul className="customer-home__inbox-list">
							{ recentComments.map( ( comment, index ) => (
								<li key={ index } className="customer-home__inbox-item">
									<div className="customer-home__inbox-avatar">
										{ comment.authorName?.charAt( 0 )?.toUpperCase() || '?' }
									</div>
									<div className="customer-home__inbox-content">
										<span className="customer-home__inbox-excerpt">{ comment.excerpt }</span>
										<span className="customer-home__inbox-meta">
											<span>{ comment.authorName }</span>
											<span className="customer-home__inbox-meta-sep">&middot;</span>
											<span>{ comment.time }</span>
										</span>
									</div>
								</li>
							) ) }
						</ul>
					) : (
						<p className="customer-home__overview-empty">{ translate( 'No new messages.' ) }</p>
					) }
				</Card>
			</div>
		</div>
	);

	return (
		<div className="customer-home__main">
			{ siteId && isJetpack && isPossibleJetpackConnectionProblem && (
				<JetpackConnectionHealthBanner siteId={ siteId } />
			) }
			{ header }
			{ dashboardOverview }
			{ ! isLoading && ! layout && homeLayoutError ? (
				<TrackComponentView
					eventName="calypso_customer_home_my_site_view_layout_error"
					eventProperties={ {
						site_id: siteId,
						error: homeLayoutError?.message ?? 'Layout is not available.',
					} }
				/>
			) : null }

			{ renderStudioSyncNotice() }
			{ renderUnverifiedEmailNotice() }
			{ renderDnsSettingsDiagnosticNotice() }

			{ isLoading && <div className="customer-home__loading-placeholder"></div> }
			{ ! isLoading && layout && ! homeLayoutError ? (
				<>
					<Primary cards={ layout?.primary } />
					<div className="customer-home__layout">
						<div className="customer-home__layout-col customer-home__layout-col-left">
							<Secondary
								cards={ layout?.secondary }
								siteId={ siteId }
								trackFirstCardAsPrimary={ isFirstSecondaryCardInPrimaryLocation }
							/>
						</div>
						<div className="customer-home__layout-col customer-home__layout-col-right">
							<Tertiary cards={ layout?.tertiary } />
						</div>
					</div>
				</>
			) : null }
			<ResurrectedWelcomeModalGate isSuppressed={ celebrateLaunchModalIsOpen } />
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</div>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const installedWooCommercePlugin = getPluginOnSite( state, siteId, 'woocommerce' );

	// Stats for the last 7 days (used for sparklines and today's totals)
	const weeklyStatsQuery = { unit: 'day', quantity: 7, stat_fields: 'views,visitors' };
	const isStatsLoading = isRequestingSiteStatsForQuery( state, siteId, 'statsVisits', weeklyStatsQuery );
	const statsData = getSiteStatsNormalizedData( state, siteId, 'statsVisits', weeklyStatsQuery );

	// Extract today's totals
	let todayViews = 0;
	let todayVisitors = 0;
	let todayLikes = 0;
	let todayComments = 0;
	if ( statsData && Array.isArray( statsData.data ) ) {
		const lastEntry = statsData.data[ statsData.data.length - 1 ];
		if ( lastEntry ) {
			todayViews = lastEntry[ 1 ] || 0;
			todayVisitors = lastEntry[ 2 ] || 0;
			todayLikes = lastEntry[ 3 ] || 0;
			todayComments = lastEntry[ 4 ] || 0;
		}
	}

	// Recent comments from state
	const siteComments = state.comments?.items?.[ siteId ];
	let recentComments = [];
	if ( siteComments ) {
		const allComments = Object.values( siteComments ).flat();
		recentComments = allComments
			.sort( ( a, b ) => new Date( b.date ) - new Date( a.date ) )
			.slice( 0, 5 )
			.map( ( c ) => ( {
				authorName: c.author?.name || c.author?.login || 'Anonymous',
				excerpt: c.content ? c.content.replace( /<[^>]*>/g, '' ).substring( 0, 80 ) + '...' : '',
				time: moment( c.date ).fromNow(),
			} ) );
	}

	return {
		site: getSelectedSite( state ),
		sitePlan: getSitePlan( state, siteId ),
		siteId,
		isJetpack: isJetpackSite( state, siteId ),
		isNew7DUser: isUserRegistrationDaysWithinRange( state, null, 0, 7 ),
		canUserUseCustomerHome: canCurrentUserUseCustomerHome( state, siteId ),
		isStaticHomePage: 'page' === getSiteOption( state, siteId, 'show_on_front' ),
		hasWooCommerceInstalled: !! ( installedWooCommercePlugin && installedWooCommercePlugin.active ),
		isRequestingSitePlugins: isRequestingInstalledPlugins( state, siteId ),
		isSiteWooExpressEcommerceTrial: isSiteOnWooExpressEcommerceTrial( state, siteId ),
		ssoModuleActive: !! isJetpackModuleActive( state, siteId, 'sso' ),
		fetchingJetpackModules: !! isFetchingJetpackModules( state, siteId ),
		isSiteLaunching: getRequest( state, launchSite( siteId ) )?.isLoading ?? false,
		isAdmin: canCurrentUser( state, siteId, 'manage_options' ),
		dashboardOptIn: hasDashboardOptIn( state ),
		displayName: getCurrentUserDisplayName( state ),
		todayViews,
		todayVisitors,
		todayLikes,
		todayComments,
		recentComments,
		isStatsLoading,
	};
};

const trackViewSiteAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_my_site_view_site_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'my_site_view_site' )
	);

const trackStudioSyncConnectSite = ( click = false ) =>
	recordTracksEvent( 'calypso_studio_sync_connect_site', {
		click,
	} );

const mapDispatchToProps = {
	trackViewSiteAction,
	trackStudioSyncConnectSite,
	verifyIcannEmail,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { isStaticHomePage } = stateProps;
	return {
		...ownProps,
		...stateProps,
		trackViewSiteAction: () => dispatchProps.trackViewSiteAction( isStaticHomePage ),
		trackStudioSyncConnectSite: dispatchProps.trackStudioSyncConnectSite,
		handleVerifyIcannEmail: dispatchProps.verifyIcannEmail,
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( withJetpackConnectionProblem( HomeContent ) );
