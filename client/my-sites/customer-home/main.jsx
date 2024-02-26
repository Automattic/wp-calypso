import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import SiteIcon from 'calypso/blocks/site-icon';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteChecklist from 'calypso/components/data/query-site-checklist';
import EmptyContent from 'calypso/components/empty-content';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import useDomainDiagnosticsQuery from 'calypso/data/domains/diagnostics/use-domain-diagnostics-query';
import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import useHomeLayoutQuery, { getCacheKey } from 'calypso/data/home/use-home-layout-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { setDomainNotice } from 'calypso/lib/domains/set-domain-notice';
import { preventWidows } from 'calypso/lib/formatting';
import { getQueryArgs } from 'calypso/lib/query-args';
import { SET_UP_EMAIL_AUTHENTICATION_FOR_YOUR_DOMAIN } from 'calypso/lib/url/support';
import Primary from 'calypso/my-sites/customer-home/locations/primary';
import Secondary from 'calypso/my-sites/customer-home/locations/secondary';
import Tertiary from 'calypso/my-sites/customer-home/locations/tertiary';
import WooCommerceHomePlaceholder from 'calypso/my-sites/customer-home/wc-home-placeholder';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { verifyIcannEmail } from 'calypso/state/domains/management/actions';
import { withJetpackConnectionProblem } from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem';
import {
	getPluginOnSite,
	isRequesting as isRequestingInstalledPlugins,
} from 'calypso/state/plugins/installed/selectors';
import getRequest from 'calypso/state/selectors/get-request';
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isUserRegistrationDaysWithinRange from 'calypso/state/selectors/is-user-registration-days-within-range';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { launchSite } from 'calypso/state/sites/launch/actions';
import { isSiteOnWooExpressEcommerceTrial } from 'calypso/state/sites/plans/selectors';
import {
	canCurrentUserUseCustomerHome,
	getSitePlan,
	getSiteOption,
} from 'calypso/state/sites/selectors';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import CelebrateLaunchModal from './components/celebrate-launch-modal';

import './style.scss';

const Home = ( {
	canUserUseCustomerHome,
	hasWooCommerceInstalled,
	isJetpack,
	isPossibleJetpackConnectionProblem,
	isRequestingSitePlugins,
	isSiteLaunching,
	site,
	siteId,
	trackViewSiteAction,
	isSiteWooExpressEcommerceTrial,
	ssoModuleActive,
	fetchingJetpackModules,
	handleVerifyIcannEmail,
} ) => {
	const [ celebrateLaunchModalIsOpen, setCelebrateLaunchModalIsOpen ] = useState( false );
	const [ launchedSiteId, setLaunchedSiteId ] = useState( null );
	const queryClient = useQueryClient();
	const translate = useTranslate();

	const { data: layout, isLoading, error: homeLayoutError } = useHomeLayoutQuery( siteId );

	const { data: allDomains = [], isSuccess } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );

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

	useEffect( () => {
		if ( getQueryArgs().celebrateLaunch === 'true' && isSuccess ) {
			setCelebrateLaunchModalIsOpen( true );
		}
	}, [ isSuccess ] );

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

	if ( ! canUserUseCustomerHome ) {
		const title = translate( 'This page is not available on this site.' );
		return (
			<EmptyContent
				title={ preventWidows( title ) }
				illustration="/calypso/images/illustrations/error.svg"
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
			<Button href={ site.URL } onClick={ trackViewSiteAction } target="_blank">
				{ config.isEnabled( 'layout/dotcom-nav-redesign' ) &&
				'wp-admin' === site?.options?.wpcom_admin_interface
					? translate( 'View site' )
					: translate( 'Visit site' ) }
			</Button>
		</>
	);
	const header = (
		<div className="customer-home__heading">
			<NavigationHeader
				compactBreadcrumb={ false }
				navigationItems={ [] }
				mobileItem={ null }
				title={ translate( 'My Home' ) }
				subtitle={ translate( 'Your hub for next steps, support center, and quick links.' ) }
			>
				{ headerActions }
			</NavigationHeader>

			<div className="customer-home__site-content">
				<SiteIcon site={ site } size={ 58 } />
				<div className="customer-home__site-info">
					<div className="customer-home__site-title">{ site.name }</div>
					<ExternalLink
						href={ site.URL }
						className="customer-home__site-domain"
						onClick={ trackViewSiteAction }
					>
						<span className="customer-home__site-domain-text">{ site.domain }</span>
					</ExternalLink>
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
				showDismiss={ true }
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

	return (
		<Main wideLayout className="customer-home__main">
			<PageViewTracker path="/home/:site" title={ translate( 'My Home' ) } />
			<DocumentHead title={ translate( 'My Home' ) } />
			{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
			{ siteId && isJetpack && isPossibleJetpackConnectionProblem && (
				<JetpackConnectionHealthBanner siteId={ siteId } />
			) }
			{ header }
			{ ! isLoading && ! layout && homeLayoutError ? (
				<TrackComponentView
					eventName="calypso_customer_home_my_site_view_layout_error"
					eventProperties={ {
						site_id: siteId,
						error: homeLayoutError?.message ?? 'Layout is not available.',
					} }
				/>
			) : null }

			{ renderUnverifiedEmailNotice() }
			{ renderDnsSettingsDiagnosticNotice() }

			{ isLoading && <div className="customer-home__loading-placeholder"></div> }
			{ ! isLoading && layout && ! homeLayoutError ? (
				<>
					<Primary cards={ layout?.primary } />
					<div className="customer-home__layout">
						<div className="customer-home__layout-col customer-home__layout-col-left">
							<Secondary cards={ layout?.secondary } siteId={ siteId } />
						</div>
						<div className="customer-home__layout-col customer-home__layout-col-right">
							<Tertiary cards={ layout?.tertiary } />
						</div>
					</div>
				</>
			) : null }
			{ celebrateLaunchModalIsOpen && (
				<CelebrateLaunchModal
					setModalIsOpen={ setCelebrateLaunchModalIsOpen }
					site={ site }
					allDomains={ allDomains }
				/>
			) }
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</Main>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isClassicEditor = getSelectedEditor( state, siteId ) === 'classic';
	const installedWooCommercePlugin = getPluginOnSite( state, siteId, 'woocommerce' );

	return {
		site: getSelectedSite( state ),
		sitePlan: getSitePlan( state, siteId ),
		siteId,
		isJetpack: isJetpackSite( state, siteId ),
		isNew7DUser: isUserRegistrationDaysWithinRange( state, null, 0, 7 ),
		canUserUseCustomerHome: canCurrentUserUseCustomerHome( state, siteId ),
		isStaticHomePage:
			! isClassicEditor && 'page' === getSiteOption( state, siteId, 'show_on_front' ),
		hasWooCommerceInstalled: !! ( installedWooCommercePlugin && installedWooCommercePlugin.active ),
		isRequestingSitePlugins: isRequestingInstalledPlugins( state, siteId ),
		isSiteWooExpressEcommerceTrial: isSiteOnWooExpressEcommerceTrial( state, siteId ),
		ssoModuleActive: !! isJetpackModuleActive( state, siteId, 'sso' ),
		fetchingJetpackModules: !! isFetchingJetpackModules( state, siteId ),
		isSiteLaunching: getRequest( state, launchSite( siteId ) )?.isLoading ?? false,
	};
};

const trackViewSiteAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_my_site_view_site_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'my_site_view_site' )
	);

const mapDispatchToProps = {
	trackViewSiteAction,
	verifyIcannEmail,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { isStaticHomePage } = stateProps;
	return {
		...ownProps,
		...stateProps,
		trackViewSiteAction: () => dispatchProps.trackViewSiteAction( isStaticHomePage ),
		handleVerifyIcannEmail: dispatchProps.verifyIcannEmail,
	};
};

const connectHome = connect( mapStateToProps, mapDispatchToProps, mergeProps );

export default connectHome( withJetpackConnectionProblem( Home ) );
