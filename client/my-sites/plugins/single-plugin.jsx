import { isBusiness, isEcommerce, isEnterprise } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import EmptyContent from 'calypso/components/empty-content';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import MainComponent from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import formatNumberCompact from 'calypso/lib/format-number-compact';
import { userCan } from 'calypso/lib/site/utils';
import PluginNotices from 'calypso/my-sites/plugins/notices';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import PluginSections from 'calypso/my-sites/plugins/plugin-sections';
import PluginSectionsCustom from 'calypso/my-sites/plugins/plugin-sections/custom';
import PluginSiteList from 'calypso/my-sites/plugins/plugin-site-list';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { installPlugin } from 'calypso/state/plugins/installed/actions';
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
import {
	isJetpackSite as checkJetpackSite,
	isRequestingSites as checkRequestingSites,
} from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import NoPermissionsError from './no-permissions-error';

function SinglePlugin( props ) {
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const selectedSiteId = useSelector( getSelectedSiteId );
	const sites = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];

	const plugin = useSelector( ( state ) => getPluginOnSites( state, siteIds, props.pluginSlug ) );
	const wporgPlugin = useSelector( ( state ) => getWporgPlugin( state, props.pluginSlug ) );
	const isFetching = useSelector( ( state ) => isWporgPluginFetching( state, props.pluginSlug ) );
	const isFetched = useSelector( ( state ) => isWporgPluginFetched( state, props.pluginSlug ) );
	const selectedSite = useSelector( getSelectedSite );
	const isJetpackSite = useSelector(
		( state ) => selectedSiteId && checkJetpackSite( state, selectedSiteId )
	);
	const isRequestingSites = useSelector( checkRequestingSites );
	const requestingPluginsForSites = useSelector( ( state ) =>
		isRequestingForSites( state, siteIds )
	);
	const sitePlugin = useSelector(
		( state ) => selectedSiteId && getPluginOnSite( state, selectedSiteId, props.pluginSlug )
	);
	const userCanManagePlugins = useSelector( ( state ) =>
		selectedSiteId
			? canCurrentUser( state, selectedSiteId, 'manage_options' )
			: canCurrentUserManagePlugins( state )
	);

	const isWpcom = selectedSite && ! isJetpackSite;
	const analyticsPath = selectedSite ? '/plugins/:plugin/:site' : '/plugins/:plugin';

	const isPluginInstalledOnsite = ! requestingPluginsForSites ? !! sitePlugin : null;

	const fullPlugin = {
		...plugin,
		...wporgPlugin,
	};

	useEffect( () => {
		if ( ! isFetched ) {
			dispatch( wporgFetchPluginData( props.pluginSlug ) );
		}
	}, [ isFetched ] );

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
			<FixedNavigationHeader navigationItems={ getNavigationItems() } />
			<PluginNotices pluginId={ fullPlugin.id } sites={ sites } plugins={ [ fullPlugin ] } />

			<div className="single-plugin__page">
				<div className="single-plugin__layout single-plugin__top-section">
					<div
						className={ classNames( 'single-plugin__layout-col', 'single-plugin__layout-col-left', {
							'no-cta ': ! shouldDisplayCTA(
								selectedSite,
								props.pluginSlug,
								isPluginInstalledOnsite
							),
						} ) }
					>
						<div className="single-plugin__header">
							<div className="single-plugin__name">{ fullPlugin.name }</div>
							<div className="single-plugin__description">{ fullPlugin.description }</div>
							<div className="single-plugin__additional-info">
								<table>
									<thead>
										<tr>
											<th>{ translate( 'Developer' ) }</th>
											<th>{ translate( 'Ratings' ) }</th>
											<th>{ translate( 'Last updated' ) }</th>
										</tr>
									</thead>

									<tbody>
										<tr>
											<td>
												<a href={ fullPlugin.author_url }>{ fullPlugin.author_name }</a>
											</td>
											<td>
												<Rating rating={ fullPlugin.rating } />
											</td>
											<td>
												{ moment
													.utc( fullPlugin.last_updated, 'YYYY-MM-DD hh:mma' )
													.format( 'YYYY-MM-DD' ) }
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<div
						className={ classNames(
							'single-plugin__layout-col',
							'single-plugin__layout-col-right',
							{
								'no-cta': ! shouldDisplayCTA(
									selectedSite,
									props.pluginSlug,
									isPluginInstalledOnsite
								),
							}
						) }
					>
						<div className="single-plugin__header">
							<div className="single-plugin__price">{ translate( 'Free' ) }</div>
							<div className="single-plugin__install">
								<CTA
									slug={ props.pluginSlug }
									isPluginInstalledOnsite={ isPluginInstalledOnsite }
									fullPlugin={ fullPlugin }
								/>
							</div>
							<div className="single-plugin__t-and-c">
								{ translate(
									'By installing, you agree to WordPress.com’s Terms of Service and the Third-Party plug-in Terms.'
								) }
							</div>
						</div>
					</div>
				</div>

				<div className="single-plugin__sites-list">
					<SitesList
						fullPlugin={ fullPlugin }
						isPluginInstalledOnsite={ isPluginInstalledOnsite }
						{ ...props }
					/>
				</div>

				<div className="single-plugin__layout single-plugin__body">
					<div className="single-plugin__layout-col single-plugin__layout-col-left">
						{ fullPlugin.wporg ? (
							<PluginSections
								className="single-plugin__plugins-sections"
								plugin={ fullPlugin }
								isWpcom={ isWpcom }
								addBanner
								removeReadMore
							/>
						) : (
							<PluginSectionsCustom plugin={ fullPlugin } />
						) }
					</div>
					<div className="single-plugin__layout-col single-plugin__layout-col-right">
						<div className="single-plugin__plugin-details-title">
							{ translate( 'Plugin details' ) }
						</div>
						<div className="single-plugin__plugin-details-content">
							<div className="single-plugin__downloads">
								<div className="single-plugin__downloads-text title">
									{ translate( 'Downloads' ) }
								</div>
								<div className="single-plugin__downloads-value value">
									{ formatNumberCompact( fullPlugin.downloaded, 'en' ) }
								</div>
							</div>
							<div className="single-plugin__version">
								<div className="single-plugin__version-text title">{ translate( 'Version' ) }</div>
								<div className="single-plugin__version-value value">{ fullPlugin.version }</div>
							</div>
							<div className="single-plugin__tested">
								<div className="single-plugin__tested-text title">
									{ translate( 'Tested up to' ) }
								</div>
								<div className="single-plugin__tested-value value">{ fullPlugin.version }</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</MainComponent>
	);
}

function shouldDisplayCTA( selectedSite, slug, isPluginInstalledOnsite ) {
	return (
		isPluginInstalledOnsite === false &&
		selectedSite &&
		userCan( 'manage_options', selectedSite ) &&
		isCompatiblePlugin( slug )
	);
}

function onClickInstallPlugin( { dispatch, selectedSiteId, fullPlugin, slug } ) {
	dispatch( removePluginStatuses( 'completed', 'error' ) );
	dispatch( installPlugin( selectedSiteId, fullPlugin ) );

	dispatch( recordGoogleEvent( 'Plugins', 'Install on selected Site', 'Plugin Name', slug ) );
	dispatch(
		recordGoogleEvent( 'calypso_plugin_install_click_from_plugin_info', {
			site: selectedSiteId,
			plugin: slug,
		} )
	);
}

function CTA( { slug, isPluginInstalledOnsite, fullPlugin } ) {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );

	const selectedSiteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();

	if ( ! shouldDisplayCTA( selectedSite, slug, isPluginInstalledOnsite ) ) {
		return null;
	}

	if (
		isBusiness( selectedSite.plan ) ||
		isEnterprise( selectedSite.plan ) ||
		isEcommerce( selectedSite.plan )
	) {
		return (
			<Button
				className="single-plugin__install-button"
				onClick={ () => onClickInstallPlugin( { dispatch, selectedSiteId, fullPlugin, slug } ) }
			>
				{ translate( 'Install and activate' ) }
			</Button>
		);
	}

	return (
		<Button className="single-plugin__install-button">
			{ translate( 'Upgrade and install' ) }
		</Button>
	);
}

/* TODO: add the stars icons */
function Rating( { rating } ) {
	// const inverseRating = 100 - Math.round( rating / 10 ) * 10;
	// const noFillOutlineCount = Math.floor( inverseRating / 20 ); // (5 - noFillOutlineCount) gives the number of stars to add

	return rating / 20;
}

function SitesList( { fullPlugin: plugin, isPluginInstalledOnsite, ...props } ) {
	const translate = useTranslate();

	const sites = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];

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

	if ( props.siteUrl && isPluginInstalledOnsite ) {
		<PluginSiteList
			className="single-plugin__installed-on"
			title={ translate( 'Installed on', {
				comment: 'header for list of sites a plugin is installed on',
			} ) }
			sites={ sites }
			plugin={ plugin }
		/>;
	}

	const notInstalledSites = sitesWithoutPlugin.map( ( siteId ) =>
		sites.find( ( site ) => site.ID === siteId )
	);

	return (
		<div>
			<PluginSiteList
				className="single-plugin__installed-on"
				title={ translate( 'Installed on', {
					comment: 'header for list of sites a plugin is installed on',
				} ) }
				sites={ sitesWithPlugin }
				plugin={ plugin }
			/>
			{ plugin.wporg && (
				<PluginSiteList
					className="single-plugin__not-installed-on"
					title={ translate( 'Available sites', {
						comment: 'header for list of sites a plugin can be installed on',
					} ) }
					sites={ notInstalledSites }
					plugin={ plugin }
				/>
			) }
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
	return <MainComponent wideLayout>{ /* TODO: Create Placeholder */ }</MainComponent>;
}

export default SinglePlugin;
