import { isFreePlanProduct } from '@automattic/calypso-products/src';
import { Button } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import SiteIcon from 'calypso/blocks/site-icon';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteChecklist from 'calypso/components/data/query-site-checklist';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import Main from 'calypso/components/main';
import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import useHomeLayoutQuery, { getCacheKey } from 'calypso/data/home/use-home-layout-query';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';
import { preventWidows } from 'calypso/lib/formatting';
import { getQueryArgs } from 'calypso/lib/query-args';
import Primary from 'calypso/my-sites/customer-home/locations/primary';
import Secondary from 'calypso/my-sites/customer-home/locations/secondary';
import Tertiary from 'calypso/my-sites/customer-home/locations/tertiary';
import WooCommerceHomePlaceholder from 'calypso/my-sites/customer-home/wc-home-placeholder';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';
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
	sitePlan,
	isNew7DUser,
	isSiteWooExpressEcommerceTrial,
	ssoModuleActive,
	fetchingJetpackModules,
} ) => {
	const [ celebrateLaunchModalIsOpen, setCelebrateLaunchModalIsOpen ] = useState( false );
	const [ launchedSiteId, setLaunchedSiteId ] = useState( null );
	const queryClient = useQueryClient();
	const translate = useTranslate();

	const { data: layout, isLoading, error: homeLayoutError } = useHomeLayoutQuery( siteId );

	const { data: allDomains = [], isSuccess } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );

	const detectedCountryCode = useSelector( getCurrentUserCountryCode );
	useEffect( () => {
		if ( ! isFreePlanProduct( sitePlan ) ) {
			return;
		}

		if ( ! [ 'US', 'GB', 'AU', 'JP' ].includes( detectedCountryCode ) ) {
			return;
		}

		if ( isNew7DUser ) {
			return;
		}

		addHotJarScript();

		if ( window && window.hj ) {
			window.hj( 'trigger', 'pnp_survey_1' );
		}
	}, [ detectedCountryCode, sitePlan, isNew7DUser ] );

	useEffect( () => {
		if ( getQueryArgs().celebrateLaunch === 'true' && isSuccess ) {
			setCelebrateLaunchModalIsOpen( true );
		}
	}, [ isSuccess ] );

	useEffect( () => {
		if ( ! isSiteLaunching && launchedSiteId === siteId ) {
			queryClient.invalidateQueries( getCacheKey( siteId ) );
			setLaunchedSiteId( null );
		}
	}, [ isSiteLaunching, launchedSiteId, queryClient, siteId ] );

	useEffect( () => {
		if ( isSiteLaunching ) {
			setLaunchedSiteId( siteId );
		}
	}, [ isSiteLaunching, siteId ] );

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

	const header = (
		<div className="customer-home__heading">
			<FormattedHeader
				brandFont
				headerText={ translate( 'My Home' ) }
				subHeaderText={ translate( 'Your hub for posting, editing, and growing your site.' ) }
				align="left"
				hasScreenOptions
			/>

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

			<div className="customer-home__view-site-button">
				<Button href={ site.URL } onClick={ trackViewSiteAction } target="_blank">
					{ translate( 'Visit site' ) }
				</Button>
			</div>
		</div>
	);

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
						siteId: siteId,
						error: homeLayoutError?.message ?? 'Layout is not available.',
					} }
				/>
			) : null }
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

Home.propTypes = {
	canUserUseCustomerHome: PropTypes.bool.isRequired,
	hasWooCommerceInstalled: PropTypes.bool.isRequired,
	isStaticHomePage: PropTypes.bool.isRequired,
	isRequestingSitePlugins: PropTypes.bool.isRequired,
	isSiteLaunching: PropTypes.bool.isRequired,
	site: PropTypes.object.isRequired,
	siteId: PropTypes.number.isRequired,
	trackViewSiteAction: PropTypes.func.isRequired,
	isSiteWooExpressEcommerceTrial: PropTypes.bool.isRequired,
	ssoModuleActive: PropTypes.bool.isRequired,
	fetchingJetpackModules: PropTypes.bool.isRequired,
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
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { isStaticHomePage } = stateProps;
	return {
		...ownProps,
		...stateProps,
		trackViewSiteAction: () => dispatchProps.trackViewSiteAction( isStaticHomePage ),
	};
};

const connectHome = connect( mapStateToProps, mapDispatchToProps, mergeProps );

export default connectHome( withJetpackConnectionProblem( withTrackingTool( 'HotJar' )( Home ) ) );
