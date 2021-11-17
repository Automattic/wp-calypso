import { isBusiness, isEcommerce, isEnterprise } from '@automattic/calypso-products';
import { Button, Dialog } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import DocumentHead from 'calypso/components/data/document-head';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import EmptyContent from 'calypso/components/empty-content';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import MainComponent from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { formatNumberMetric } from 'calypso/lib/format-number-compact';
import { userCan } from 'calypso/lib/site/utils';
import PluginNotices from 'calypso/my-sites/plugins/notices';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import PluginRatings from 'calypso/my-sites/plugins/plugin-ratings/';
import PluginSections from 'calypso/my-sites/plugins/plugin-sections';
import PluginSectionsCustom from 'calypso/my-sites/plugins/plugin-sections/custom';
import PluginSiteList from 'calypso/my-sites/plugins/plugin-site-list';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import {
	getEligibility,
	isEligibleForAutomatedTransfer,
} from 'calypso/state/automated-transfer/selectors';
import {
	getPluginOnSite,
	getPluginOnSites,
	getSiteObjectsWithPlugin,
	getSitesWithoutPlugin,
	isRequestingForSites,
} from 'calypso/state/plugins/installed/selectors';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import {
	isFetching as isWporgPluginFetching,
	isFetched as isWporgPluginFetched,
	getPlugin as getWporgPlugin,
} from 'calypso/state/plugins/wporg/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import canCurrentUserManagePlugins from 'calypso/state/selectors/can-current-user-manage-plugins';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { default as checkVipSite } from 'calypso/state/selectors/is-vip-site';
import {
	isJetpackSite,
	isRequestingSites as checkRequestingSites,
} from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import NoPermissionsError from './no-permissions-error';

function PluginDetails( props ) {
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	// Site information.
	const selectedSite = useSelector( getSelectedSite );
	const sitesWithPlugins = useSelector( getSelectedOrAllSitesWithPlugins );
	const sites = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];
	const isRequestingSites = useSelector( checkRequestingSites );
	const requestingPluginsForSites = useSelector( ( state ) =>
		isRequestingForSites( state, siteIds )
	);
	const analyticsPath = selectedSite ? '/plugins/:plugin/:site' : '/plugins/:plugin';

	// Plugin information.
	const plugin = useSelector( ( state ) => getPluginOnSites( state, siteIds, props.pluginSlug ) );
	const wporgPlugin = useSelector( ( state ) => getWporgPlugin( state, props.pluginSlug ) );
	const isFetching = useSelector( ( state ) => isWporgPluginFetching( state, props.pluginSlug ) );
	const isFetched = useSelector( ( state ) => isWporgPluginFetched( state, props.pluginSlug ) );
	const sitePlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSite?.ID, props.pluginSlug )
	);
	const userCanManagePlugins = useSelector( ( state ) =>
		selectedSite?.ID
			? canCurrentUser( state, selectedSite?.ID, 'manage_options' )
			: canCurrentUserManagePlugins( state )
	);

	const isPluginInstalledOnsite =
		sitesWithPlugins.length && ! requestingPluginsForSites ? !! sitePlugin : false;

	// Site type.
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isVip = useSelector( ( state ) => checkVipSite( state, selectedSite?.ID ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const isWpcom = selectedSite && ! isJetpack;
	const isJetpackSelfHosted = selectedSite && isJetpack && ! isAtomic;

	// Eligibilities for Simple Sites.
	const { eligibilityHolds, eligibilityWarnings } = useSelector( ( state ) =>
		getEligibility( state, selectedSite?.ID )
	);
	const isEligible = useSelector( ( state ) =>
		isEligibleForAutomatedTransfer( state, selectedSite?.ID )
	);
	const hasEligibilityMessages =
		! isJetpack && ( eligibilityHolds || eligibilityWarnings || isEligible );

	const fullPlugin = {
		...plugin,
		...wporgPlugin,
	};

	const tags = Object.values( fullPlugin?.tags || {} )
		.slice( 0, 3 )
		.join( ' · ' );

	useEffect( () => {
		if ( ! isFetched ) {
			dispatch( wporgFetchPluginData( props.pluginSlug ) );
		}
	}, [ isFetched, props.pluginSlug, dispatch ] );

	const existingPlugin = useMemo( () => {
		if ( isFetching || ! isFetched ) {
			return 'unknown';
		}
		if ( fullPlugin && fullPlugin.fetched ) {
			return true;
		}

		// If the plugin has at least one site then we know it exists
		const pluginSites = Object.values( fullPlugin.sites );
		if ( pluginSites && pluginSites[ 0 ] ) {
			return true;
		}

		if ( requestingPluginsForSites ) {
			return 'unknown';
		}

		return false;
	}, [ isFetching, isFetched, fullPlugin, requestingPluginsForSites ] );

	const getNavigationItems = () => {
		// ToDo:
		// - add "Search Results" breadcrumb if prev page was search results
		// - change the first breadcrumb if prev page wasn't plugins page (eg activity log)
		const navigationItems = [
			{ label: translate( 'Plugins' ), href: `/plugins/${ selectedSite?.slug || '' }` },
			{ label: fullPlugin.name },
		];

		return navigationItems;
	};

	const getPageTitle = () => {
		return translate( '%(pluginName)s Plugin', {
			args: { pluginName: fullPlugin.name },
			textOnly: true,
			context: 'Page title: Plugin detail',
		} );
	};

	if ( ! isRequestingSites && ! userCanManagePlugins ) {
		return <NoPermissionsError title={ getPageTitle() } />;
	}

	if ( existingPlugin === 'unknown' ) {
		return <PluginPlaceholder />;
	}

	if ( existingPlugin === false ) {
		return <PluginDoesNotExistView />;
	}

	return (
		<MainComponent wideLayout>
			<DocumentHead title={ getPageTitle() } />
			<PageViewTracker path={ analyticsPath } title="Plugins > Plugin Details" />
			<QueryJetpackPlugins siteIds={ siteIds } />
			<SidebarNavigation />
			<QueryEligibility siteId={ selectedSite?.ID } />
			<FixedNavigationHeader navigationItems={ getNavigationItems() } />
			<PluginNotices
				pluginId={ fullPlugin.id }
				sites={ sitesWithPlugins }
				plugins={ [ fullPlugin ] }
			/>

			<div className="plugin-details__page">
				<div className="plugin-details__layout plugin-details__top-section">
					<div
						className={ classNames(
							'plugin-details__layout-col',
							'plugin-details__layout-col-left',
							{
								'no-cta ': ! shouldDisplayCTA(
									selectedSite,
									props.pluginSlug,
									isPluginInstalledOnsite,
									isJetpackSelfHosted
								),
							}
						) }
					>
						<div className="plugin-details__tags">{ tags }</div>
						<div className="plugin-details__header">
							<div className="plugin-details__name">{ fullPlugin.name }</div>
							<div className="plugin-details__description">
								{ fullPlugin.short_description || fullPlugin.description }
							</div>
							<div className="plugin-details__additional-info">
								<div className="plugin-details__info">
									<div className="plugin-details__info-title">{ translate( 'Developer' ) }</div>
									<div className="plugin-details__info-value">
										<a href={ fullPlugin.author_url }>{ fullPlugin.author_name }</a>
									</div>
								</div>
								{ !! fullPlugin.rating && (
									<div className="plugin-details__info">
										<div className="plugin-details__info-title">{ translate( 'Ratings' ) }</div>
										<div className="plugin-details__info-value">
											<PluginRatings rating={ fullPlugin.rating } />
										</div>
									</div>
								) }
								<div className="plugin-details__info">
									<div className="plugin-details__info-title">{ translate( 'Last updated' ) }</div>
									<div className="plugin-details__info-value">
										{ moment.utc( fullPlugin.last_updated, 'YYYY-MM-DD hh:mma' ).format( 'LL' ) }
									</div>
								</div>
								<div className="plugin-details__info">
									<div className="plugin-details__info-title">{ translate( 'Version' ) }</div>
									<div className="plugin-details__info-value">{ fullPlugin.version }</div>
								</div>
							</div>
						</div>
					</div>
					<div
						className={ classNames(
							'plugin-details__layout-col',
							'plugin-details__layout-col-right',
							{
								'no-cta': ! shouldDisplayCTA(
									selectedSite,
									props.pluginSlug,
									isPluginInstalledOnsite,
									isJetpackSelfHosted
								),
							}
						) }
					>
						<div className="plugin-details__header">
							<div className="plugin-details__price">{ translate( 'Free' ) }</div>
							<div className="plugin-details__install">
								<CTA
									slug={ props.pluginSlug }
									isPluginInstalledOnsite={ isPluginInstalledOnsite }
									isJetpackSelfHosted={ isJetpackSelfHosted }
									selectedSite={ selectedSite }
									isJetpack={ isJetpack }
									isVip={ isVip }
									hasEligibilityMessages={ hasEligibilityMessages }
								/>
							</div>
							<div className="plugin-details__t-and-c">
								{ translate(
									'By installing, you agree to {{a}}WordPress.com’s Terms of Service{{/a}} and the Third-Party plugin Terms.',
									{
										components: {
											a: (
												<a
													target="_blank"
													rel="noopener noreferrer"
													href="https://wordpress.com/tos/"
												/>
											),
										},
									}
								) }
							</div>
						</div>
					</div>
				</div>

				{ ! isJetpackSelfHosted && ! isCompatiblePlugin( props.pluginSlug ) && (
					<Notice
						text={ translate(
							'Incompatible plugin: This plugin is not supported on WordPress.com.'
						) }
						status="is-warning"
						showDismiss={ false }
					>
						<NoticeAction href="https://wordpress.com/support/incompatible-plugins/">
							{ translate( 'More info' ) }
						</NoticeAction>
					</Notice>
				) }

				<SitesList
					fullPlugin={ fullPlugin }
					isPluginInstalledOnsite={ isPluginInstalledOnsite }
					{ ...props }
				/>

				<div className="plugin-details__layout plugin-details__body">
					<div className="plugin-details__layout-col plugin-details__layout-col-left">
						{ fullPlugin.wporg ? (
							<PluginSections
								className="plugin-details__plugins-sections"
								plugin={ fullPlugin }
								isWpcom={ isWpcom }
								addBanner
								removeReadMore
							/>
						) : (
							<PluginSectionsCustom plugin={ fullPlugin } />
						) }
					</div>
					<div className="plugin-details__layout-col plugin-details__layout-col-right">
						<div className="plugin-details__plugin-details-title">
							{ translate( 'Plugin details' ) }
						</div>
						<div className="plugin-details__plugin-details-content">
							<div className="plugin-details__active-installs">
								<div className="plugin-details__active-installs-text title">
									{ translate( 'Active installations' ) }
								</div>
								<div className="plugin-details__active-installs-value value">
									{ formatNumberMetric( fullPlugin.active_installs, 'en' ) }
								</div>
							</div>
							<div className="plugin-details__tested">
								<div className="plugin-details__tested-text title">
									{ translate( 'Tested up to' ) }
								</div>
								<div className="plugin-details__tested-value value">{ fullPlugin.tested }</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</MainComponent>
	);
}

function shouldDisplayCTA( selectedSite, slug, isPluginInstalledOnsite, isJetpackSelfHosted ) {
	if ( ! isJetpackSelfHosted && ! isCompatiblePlugin( slug ) ) {
		// Check for WordPress.com compatibility.
		return false;
	}

	if ( ! selectedSite || ! userCan( 'manage_options', selectedSite ) ) {
		// Check if user can manage plugins.
		return false;
	}

	return ! isPluginInstalledOnsite;
}

function CTA( {
	slug,
	isPluginInstalledOnsite,
	isJetpackSelfHosted,
	selectedSite,
	isJetpack,
	isVip,
	hasEligibilityMessages,
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ showEligibility, setShowEligibility ] = useState( false );

	if ( ! shouldDisplayCTA( selectedSite, slug, isPluginInstalledOnsite, isJetpackSelfHosted ) ) {
		return null;
	}

	const shouldUpgrade = ! (
		isBusiness( selectedSite.plan ) ||
		isEnterprise( selectedSite.plan ) ||
		isEcommerce( selectedSite.plan ) ||
		isJetpack ||
		isVip
	);

	return (
		<>
			<Dialog
				isVisible={ showEligibility }
				title={ translate( 'Eligibility' ) }
				onClose={ () => setShowEligibility( false ) }
			>
				<EligibilityWarnings
					standaloneProceed
					onProceed={ () =>
						onClickInstallPlugin( {
							dispatch,
							selectedSite,
							slug,
							upgradeAndInstall: shouldUpgrade,
						} )
					}
				/>
			</Dialog>
			<Button
				className="plugin-details__install-button"
				onClick={ () => {
					if ( hasEligibilityMessages ) {
						return setShowEligibility( true );
					}
					onClickInstallPlugin( {
						dispatch,
						selectedSite,
						slug,
						upgradeAndInstall: shouldUpgrade,
					} );
				} }
			>
				{ shouldUpgrade ? translate( 'Upgrade and install' ) : translate( 'Install and activate' ) }
			</Button>
		</>
	);
}

function onClickInstallPlugin( { dispatch, selectedSite, slug, upgradeAndInstall } ) {
	dispatch( removePluginStatuses( 'completed', 'error' ) );

	dispatch( recordGoogleEvent( 'Plugins', 'Install on selected Site', 'Plugin Name', slug ) );
	dispatch(
		recordGoogleEvent( 'calypso_plugin_install_click_from_plugin_info', {
			site: selectedSite?.ID,
			plugin: slug,
		} )
	);

	const installPluginURL = `/marketplace/${ slug }/install/${ selectedSite.slug }`;
	if ( upgradeAndInstall ) {
		page( `/checkout/${ selectedSite.slug }/business?redirect_to=${ installPluginURL }#step2` );
	} else {
		page( installPluginURL );
	}
}

function SitesList( { fullPlugin: plugin, isPluginInstalledOnsite, ...props } ) {
	const translate = useTranslate();

	const sitesWithPlugins = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sitesWithPlugins ) ) ];

	const isFetching = useSelector( ( state ) => isWporgPluginFetching( state, props.pluginSlug ) );
	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, props.pluginSlug )
	);
	const sitesWithoutPlugin = useSelector( ( state ) =>
		getSitesWithoutPlugin( state, siteIds, props.pluginSlug )
	);

	if ( isFetching || ( props.siteUrl && ! isPluginInstalledOnsite ) ) {
		return null;
	}

	const notInstalledSites = sitesWithoutPlugin.map( ( siteId ) =>
		sitesWithPlugins.find( ( site ) => site.ID === siteId )
	);

	return (
		<div className="plugin-details__sites-list-background">
			<div className="plugin-details__sites-list">
				<PluginSiteList
					className="plugin-details__installed-on"
					title={ translate( 'Installed on %d site', 'Installed on %d sites', {
						args: [ sitesWithPlugin.length ],
						count: sitesWithPlugin.length,
						comment: 'header for list of sites a plugin is installed on',
					} ) }
					sites={ sitesWithPlugin }
					plugin={ plugin }
					titlePrimary
					showAdditionalHeaders
				/>
				{ plugin.wporg && (
					<PluginSiteList
						className="plugin-details__not-installed-on"
						title={ translate( 'Available on %d site', 'Available on %d sites', {
							comment: 'header for list of sites a plugin can be installed on',
							args: [ notInstalledSites.length ],
							count: notInstalledSites.length,
						} ) }
						sites={ notInstalledSites }
						plugin={ plugin }
					/>
				) }
			</div>
		</div>
	);
}

function PluginDoesNotExistView() {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const actionUrl = '/plugins' + ( selectedSite ? '/' + selectedSite.slug : '' );
	const action = translate( 'Browse all plugins' );

	return (
		<MainComponent wideLayout>
			<EmptyContent
				title={ translate( "Oops! We can't find this plugin!" ) }
				line={ translate( "The plugin you are looking for doesn't exist." ) }
				actionURL={ actionUrl }
				action={ action }
				illustration="/calypso/images/illustrations/illustration-404.svg"
			/>
		</MainComponent>
	);
}

function PluginPlaceholder() {
	return (
		<MainComponent wideLayout>
			<div className="plugin-details__page">
				<div className="plugin-details__layout plugin-details__top-section is-placeholder">
					<div className="plugin-details__layout-col plugin-details__layout-col-left">
						<div className="plugin-details__tags">...</div>
						<div className="plugin-details__header">
							<div className="plugin-details__name">...</div>
							<div className="plugin-details__description">...</div>
							<div className="plugin-details__additional-info">...</div>
						</div>
					</div>
					<div className="plugin-details__layout-col plugin-details__layout-col-right">
						<div className="plugin-details__header">
							<div className="plugin-details__price">...</div>
							<div className="plugin-details__install">...</div>
							<div className="plugin-details__t-and-c">...</div>
						</div>
					</div>
				</div>
			</div>
		</MainComponent>
	);
}

export default PluginDetails;
