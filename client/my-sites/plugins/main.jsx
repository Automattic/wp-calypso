import config from '@automattic/calypso-config';
import {
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
	WPCOM_FEATURES_MANAGE_PLUGINS,
	WPCOM_FEATURES_UPLOAD_PLUGINS,
} from '@automattic/calypso-products/src';
import page from '@automattic/calypso-router';
import { Button, Count } from '@automattic/components';
import { subscribeIsWithinBreakpoint, isWithinBreakpoint } from '@automattic/viewport';
import { Icon, upload } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { capitalize, flow, isEmpty } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackSitesFeatures from 'calypso/components/data/query-jetpack-sites-features';
import QueryPlugins from 'calypso/components/data/query-plugins';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import EmptyContent from 'calypso/components/empty-content';
import NavigationHeader from 'calypso/components/navigation-header';
import Search from 'calypso/components/search';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import MissingPaymentNotification from 'calypso/jetpack-cloud/components/missing-payment-notification';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import urlSearch from 'calypso/lib/url-search';
import { getVisibleSites, siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { appendBreadcrumb, updateBreadcrumbs } from 'calypso/state/breadcrumb/actions';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';
import {
	getPlugins,
	isRequestingForSites,
	isRequestingForAllSites,
	requestPluginsError,
	getPluginsWithUpdateStatuses,
} from 'calypso/state/plugins/installed/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { getAllPlugins as getAllWporgPlugins } from 'calypso/state/plugins/wporg/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import canCurrentUserManagePlugins from 'calypso/state/selectors/can-current-user-manage-plugins';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import getUpdateableJetpackSites from 'calypso/state/selectors/get-updateable-jetpack-sites';
import hasJetpackSites from 'calypso/state/selectors/has-jetpack-sites';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	canJetpackSiteUpdateFiles,
	isJetpackSite,
	isRequestingSites,
} from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import NoPermissionsError from './no-permissions-error';
import UpdatePlugins from './plugin-management-v2/update-plugins';
import PluginsList from './plugins-list';

import './style.scss';

export class PluginsMain extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			isMobile: isWithinBreakpoint( '<960px' ),
		};
	}

	componentWillMount() {
		if ( ! config.isEnabled( 'bulk-plugin-management' ) ) {
			import( './style-compatibilty.scss' );
		}
	}

	componentDidUpdate( prevProps ) {
		const {
			currentPlugins,
			hasJetpackSites: hasJpSites,
			selectedSiteIsJetpack,
			selectedSiteSlug,
			hasInstallPurchasedPlugins,
			hasManagePlugins,
			search,
		} = this.props;

		currentPlugins.map( ( plugin ) => {
			const pluginData = this.props.wporgPlugins?.[ plugin.slug ];
			if ( ! pluginData && ! config.isEnabled( 'bulk-plugin-management' ) ) {
				this.props.wporgFetchPluginData( plugin.slug );
			}
		} );

		if (
			( prevProps.isRequestingSites && ! this.props.isRequestingSites ) ||
			prevProps.selectedSiteSlug !== selectedSiteSlug
		) {
			// Selected site is not a Jetpack site
			if (
				selectedSiteSlug &&
				( ! selectedSiteIsJetpack || ! ( hasInstallPurchasedPlugins || hasManagePlugins ) )
			) {
				page.redirect( `/plugins/${ selectedSiteSlug }` );
				return;
			}

			//  None of the other sites are Jetpack sites
			if ( ! selectedSiteSlug && ! hasJpSites ) {
				page.redirect( '/plugins' );
				return;
			}
		}

		if ( prevProps.search !== search ) {
			if ( search ) {
				this.props.appendBreadcrumb( {
					label: this.props.translate( 'Search Results' ),
					href: `/plugins/manage/${ selectedSiteSlug || '' }?s=${ search }`,
					id: 'plugins-site-search',
				} );
			} else {
				this.resetBreadcrumbs();
			}
		}
	}

	componentDidMount() {
		this.resetBreadcrumbs();

		// Change the isMobile state when the size of the browser changes.
		this.unsubscribe = subscribeIsWithinBreakpoint( '<960px', ( isMobile ) => {
			this.setState( { isMobile } );
		} );
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	resetBreadcrumbs() {
		const { selectedSiteSlug, search } = this.props;

		this.props.updateBreadcrumbs( [
			{
				label: this.props.translate( 'Plugins' ),
				href: `/plugins/${ selectedSiteSlug || '' }`,
			},
			{
				label: this.props.translate( 'Manage Plugins' ),
				href: `/plugins/manage/${ selectedSiteSlug || '' }`,
			},
		] );

		if ( search ) {
			this.props.appendBreadcrumb( {
				label: this.props.translate( 'Search Results' ),
				href: `/plugins/manage/${ selectedSiteSlug || '' }?s=${ search }`,
				id: 'plugins-site-search',
			} );
		}
	}

	getCurrentPlugins() {
		if ( config.isEnabled( 'bulk-plugin-management' ) ) {
			return this.addWporgDataToPlugins( this.props.currentPlugins );
		}

		const { currentPlugins, currentPluginsOnVisibleSites, search, selectedSiteSlug } = this.props;
		let plugins = selectedSiteSlug ? currentPlugins : currentPluginsOnVisibleSites;

		if ( ! plugins ) {
			return plugins;
		}

		if ( search ) {
			plugins = plugins.filter( this.matchSearchTerms.bind( this, search ) );
		}

		return this.addWporgDataToPlugins( plugins );
	}

	getFilters() {
		const { translate, search } = this.props;
		const siteFilter = `${ this.props.selectedSiteSlug ? '/' + this.props.selectedSiteSlug : '' }${
			search ? '?s=' + search : ''
		}`;

		return [
			{
				title: isWithinBreakpoint( '<480px' )
					? translate( 'All Plugins', { context: 'Filter label for plugins list' } )
					: translate( 'All', { context: 'Filter label for plugins list' } ),
				path: '/plugins/manage' + siteFilter,
				id: 'all',
			},
			{
				title: translate( 'Active', { context: 'Filter label for plugins list' } ),
				path: '/plugins/active' + siteFilter,
				id: 'active',
			},
			{
				title: translate( 'Inactive', { context: 'Filter label for plugins list' } ),
				path: '/plugins/inactive' + siteFilter,
				id: 'inactive',
			},
			{
				title: translate( 'Updates', { context: 'Filter label for plugins list' } ),
				path: '/plugins/updates' + siteFilter,
				id: 'updates',
			},
		];
	}

	getSelectedText() {
		const found = find( this.getFilters(), ( filterItem ) => this.props.filter === filterItem.id );
		if ( 'undefined' !== typeof found ) {
			const count = this.getPluginCount( found.id );
			return { title: found.title, count };
		}
		return '';
	}

	// plugins for Jetpack sites require additional data from the wporg-data store
	addWporgDataToPlugins( plugins ) {
		return plugins.map( ( plugin ) => {
			const pluginData = this.props.wporgPlugins?.[ plugin.slug ];
			return Object.assign( {}, plugin, pluginData );
		} );
	}

	matchSearchTerms( search, plugin ) {
		search = search.toLowerCase();
		return [ 'name', 'description', 'author' ].some(
			( attribute ) =>
				plugin[ attribute ] && plugin[ attribute ].toLowerCase().indexOf( search ) !== -1
		);
	}

	isFetchingPlugins() {
		return this.props.requestingPluginsForSites;
	}

	getPluginCount( filterId ) {
		let count;
		if ( 'updates' === filterId ) {
			count = this.props.pluginUpdateCount;
		}
		if ( 'all' === filterId ) {
			count = this.props.allPluginsCount;
		}
		if ( this.props.requestingPluginsForSites && ! count ) {
			return undefined;
		}
		return count;
	}

	getEmptyContentUpdateData() {
		const { translate } = this.props;
		const emptyContentData = { illustration: '/calypso/images/illustrations/illustration-ok.svg' };
		const { selectedSite } = this.props;

		if ( selectedSite ) {
			emptyContentData.title = translate(
				'All plugins on %(siteName)s are {{span}}up to date.{{/span}}',
				{
					textOnly: true,
					args: { siteName: selectedSite.title },
					components: { span: <span className="plugins__plugin-list-state" /> },
					comment: 'The span tags prevents single words from showing on a single line.',
				}
			);
		} else {
			emptyContentData.title = translate( 'All plugins are up to date.', { textOnly: true } );
		}

		if ( this.getUpdatesTabVisibility() ) {
			return emptyContentData;
		}

		emptyContentData.action = translate( 'All Plugins', { textOnly: true } );

		if ( selectedSite ) {
			emptyContentData.actionURL = '/plugins/' + selectedSite.slug;
			if ( this.props.selectedSiteIsJetpack ) {
				emptyContentData.illustration = '/calypso/images/illustrations/illustration-jetpack.svg';
				emptyContentData.title = translate( "Plugins can't be updated on %(siteName)s.", {
					textOnly: true,
					args: { siteName: selectedSite.title },
				} );
			} else {
				// buisness plan sites
				emptyContentData.title = translate( 'Plugins are updated automatically on %(siteName)s.', {
					textOnly: true,
					args: { siteName: selectedSite.title },
				} );
			}
		} else {
			emptyContentData.title = translate( 'No updates are available.', { textOnly: true } );
			emptyContentData.illustration =
				'/calypso/images/illustrations/illustration-empty-results.svg';
			emptyContentData.actionURL = '/plugins';
		}

		return emptyContentData;
	}

	getEmptyContentData() {
		const { filter } = this.props;
		if ( filter === 'update' ) {
			return this.getEmptyContentUpdateData();
		}

		const { translate } = this.props;
		const illustration = '/calypso/images/illustrations/illustration-empty-results.svg';
		if ( filter === 'active' ) {
			return {
				title: translate( 'No plugins are active.', { textOnly: true } ),
				illustration,
			};
		}

		if ( filter === 'inactive' ) {
			return {
				title: translate( 'No plugins are inactive.', { textOnly: true } ),
				illustration,
			};
		}

		return null;
	}

	getUpdatesTabVisibility() {
		const { selectedSite, updateableJetpackSites } = this.props;

		if ( selectedSite ) {
			return this.props.selectedSiteIsJetpack && this.props.canSelectedJetpackSiteUpdateFiles;
		}

		return updateableJetpackSites.length > 0;
	}

	shouldShowPluginListPlaceholders() {
		return isEmpty( this.getCurrentPlugins() ) && this.isFetchingPlugins();
	}

	renderPageViewTracking() {
		const { selectedSiteId, filter, selectedSiteIsJetpack } = this.props;

		const analyticsPageTitle = filter ? `Plugins > ${ capitalize( filter ) }` : 'Plugins';

		// 'All' view corresponds to '/plugins/manage' path.
		// Other filters appear unchanged in path (eg. Active -> /plugins/active)
		const currentFilter = filter === 'all' ? 'manage' : filter;

		const analyticsPath = selectedSiteId
			? `/plugins/${ currentFilter }/:site`
			: `/plugins/${ currentFilter }`;

		if ( selectedSiteId && ! selectedSiteIsJetpack ) {
			return null;
		}

		return <PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />;
	}

	renderPluginsContent() {
		if ( config.isEnabled( 'bulk-plugin-management' ) ) {
			return (
				<PluginsList
					header={ this.props.translate( 'Manage Plugins' ) }
					plugins={ this.getCurrentPlugins() }
					isPlaceholder={ this.shouldShowPluginListPlaceholders() }
					isLoading={ this.props.requestingPluginsForSites }
					isJetpackCloud={ this.props.isJetpackCloud }
					searchTerm={ this.props.search }
					filter={ this.props.filter }
					requestPluginsError={ this.props.requestPluginsError }
					activePlugins={ this.props.activePlugins }
					inactivePlugins={ this.props.inactivePlugins }
					onSearch={ this.props.doSearch }
				/>
			);
		}

		const currentPlugins = this.getCurrentPlugins();

		// Hide the search box only when the request to fetch plugins fail, and there are no sites.
		const searchPlugins = ! ( this.props.requestPluginsError && ! currentPlugins?.length ) && (
			<div className="plugins__search">
				<Search
					hideFocus
					isOpen
					onSearch={ this.props.doSearch }
					initialValue={ this.props.search }
					hideClose={ ! this.props.search }
					analyticsGroup="Plugins"
					placeholder={ this.props.translate( 'Search plugins' ) }
				/>
			</div>
		);

		const { search, isJetpackCloud } = this.props;

		const showInstalledPluginList =
			isJetpackCloud || ! isEmpty( currentPlugins ) || this.isFetchingPlugins();

		if ( ! showInstalledPluginList && ! search && ! this.props.requestPluginsError ) {
			const emptyContentData = this.getEmptyContentData();
			if ( emptyContentData ) {
				return (
					<EmptyContent
						title={ emptyContentData.title }
						illustration={ emptyContentData.illustration }
						actionURL={ emptyContentData.actionURL }
						action={ emptyContentData.action }
					/>
				);
			}
		}

		const installedPluginsList = showInstalledPluginList && (
			<PluginsList
				header={ this.props.translate( 'Manage Plugins' ) }
				plugins={ currentPlugins }
				isPlaceholder={ this.shouldShowPluginListPlaceholders() }
				isLoading={ this.props.requestingPluginsForSites }
				isJetpackCloud={ this.props.isJetpackCloud }
				searchTerm={ search }
				filter={ this.props.filter }
				requestPluginsError={ this.props.requestPluginsError }
			/>
		);

		return (
			<div>
				{ searchPlugins } { installedPluginsList }
			</div>
		);
	}

	handleAddPluginButtonClick = () => {
		this.props.recordGoogleEvent( 'Plugins', 'Clicked Add New Plugins' );
	};

	renderAddPluginButton() {
		const { selectedSiteSlug, translate } = this.props;
		const browserUrl = '/plugins' + ( selectedSiteSlug ? '/' + selectedSiteSlug : '' );

		return (
			<Button href={ browserUrl } onClick={ this.handleAddPluginButtonClick }>
				{ translate( 'Browse plugins' ) }
			</Button>
		);
	}

	handleUploadPluginButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_click_plugin_upload' );
		this.props.recordGoogleEvent( 'Plugins', 'Clicked Plugin Upload Link' );
	};

	renderUploadPluginButton() {
		const { selectedSiteSlug, translate, hasUploadPlugins } = this.props;
		const uploadUrl = '/plugins/upload' + ( selectedSiteSlug ? '/' + selectedSiteSlug : '' );

		if ( ! hasUploadPlugins ) {
			return null;
		}

		return (
			<Button href={ uploadUrl } onClick={ this.handleUploadPluginButtonClick }>
				<Icon className="plugins__button-icon" icon={ upload } width={ 18 } height={ 18 } />
				{ translate( 'Upload' ) }
			</Button>
		);
	}

	render() {
		if ( ! this.props.isRequestingSites && ! this.props.userCanManagePlugins ) {
			return <NoPermissionsError title={ this.props.translate( 'Plugins', { textOnly: true } ) } />;
		}

		let navItems = null;
		let selectedTextContent = null;
		const { title, count } = this.getSelectedText();

		if ( ! config.isEnabled( 'bulk-plugin-management' ) ) {
			navItems = this.getFilters().map( ( filterItem ) => {
				if ( 'updates' === filterItem.id && ! this.getUpdatesTabVisibility() ) {
					return null;
				}

				const attr = {
					key: filterItem.id,
					path: filterItem.path,
					selected: filterItem.id === this.props.filter,
					count: this.getPluginCount( filterItem.id ),
				};

				return <NavItem { ...attr }>{ filterItem.title }</NavItem>;
			} );

			selectedTextContent = (
				<span>
					{ title }
					{ count ? <Count count={ count } compact /> : null }
				</span>
			);
		}

		const { isJetpackCloud, selectedSite } = this.props;

		let pageTitle;
		if ( isJetpackCloud ) {
			pageTitle = this.props.translate( 'Plugins', { textOnly: true } );
		} else {
			pageTitle = this.props.translate( 'Manage Plugins', { textOnly: true } );
		}

		const currentPlugins = this.getCurrentPlugins();

		return (
			<>
				<DocumentHead title={ pageTitle } />
				<QueryPlugins siteId={ selectedSite?.ID } />
				{ this.props.siteIds && 1 === this.props.siteIds.length ? (
					<QuerySiteFeatures siteIds={ this.props.siteIds } />
				) : (
					<QueryJetpackSitesFeatures />
				) }
				{ this.renderPageViewTracking() }
				<div className="plugin-management-wrapper">
					{ ! isJetpackCloud && (
						<NavigationHeader
							navigationItems={ [] }
							title={ pageTitle }
							subtitle={
								this.props.selectedSite
									? this.props.translate( 'Manage all plugins installed on %(selectedSite)s', {
											args: {
												selectedSite: this.props.selectedSite.domain,
											},
									  } )
									: this.props.translate( 'Manage plugins installed on all sites' )
							}
						>
							{ ! isJetpackCloud && (
								<>
									{ this.renderAddPluginButton() }
									{ this.renderUploadPluginButton() }
									<UpdatePlugins isWpCom plugins={ currentPlugins } />
								</>
							) }
						</NavigationHeader>
					) }
					<div
						className={ clsx( 'plugins__top-container', {
							'plugins__top-container-jc': isJetpackCloud,
						} ) }
					>
						<div className="plugins__content-wrapper">
							<MissingPaymentNotification />

							{ isJetpackCloud && (
								<div className="plugins__page-title-container">
									<div className="plugins__header-left-content">
										<h2 className="plugins__page-title">{ pageTitle }</h2>
										<div className="plugins__page-subtitle">
											{ this.props.selectedSite
												? this.props.translate(
														'Manage all plugins installed on %(selectedSite)s',
														{
															args: {
																selectedSite: this.props.selectedSite.domain,
															},
														}
												  )
												: this.props.translate( 'Manage plugins installed on all sites' ) }
										</div>
									</div>
								</div>
							) }

							{ ! config.isEnabled( 'bulk-plugin-management' ) && (
								<div className="plugins__main plugins__main-updated">
									<div className="plugins__main-header">
										<SectionNav
											applyUpdatedStyles
											selectedText={ selectedTextContent }
											className="plugins-section-nav"
										>
											<NavTabs selectedText={ title } selectedCount={ count }>
												{ navItems }
											</NavTabs>
										</SectionNav>
									</div>
								</div>
							) }
						</div>
					</div>
					<div
						className={ clsx( 'plugins__main-content', {
							'plugins__main-content-jc': isJetpackCloud,
						} ) }
					>
						<div className="plugins__content-wrapper">{ this.renderPluginsContent() }</div>
					</div>
				</div>
			</>
		);
	}
}

export default flow(
	localize,
	urlSearch,
	connect(
		( state, { filter, isJetpackCloud } ) => {
			const sites = getSelectedOrAllSitesWithPlugins( state );
			const selectedSite = getSelectedSite( state );
			const selectedSiteId = getSelectedSiteId( state );
			const siteIds = siteObjectsToSiteIds( sites ) ?? [];
			const pluginsWithUpdates = getPlugins( state, siteIds, 'updates' );
			const activePlugins = getPlugins( state, siteIds, 'active' );
			const inactivePlugins = getPlugins( state, siteIds, 'inactive' );
			const allPlugins = getPlugins( state, siteIds, 'all' );
			const pluginsWithUpdatesAndStatuses = getPluginsWithUpdateStatuses(
				state,
				allPlugins,
				pluginsWithUpdates,
				inactivePlugins,
				activePlugins
			);

			const jetpackNonAtomic =
				isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId );
			const hasManagePlugins =
				siteHasFeature( state, selectedSiteId, WPCOM_FEATURES_MANAGE_PLUGINS ) || jetpackNonAtomic;
			const hasUploadPlugins =
				siteHasFeature( state, selectedSiteId, WPCOM_FEATURES_UPLOAD_PLUGINS ) || jetpackNonAtomic;
			const hasInstallPurchasedPlugins =
				siteHasFeature( state, selectedSiteId, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS ) ||
				jetpackNonAtomic;

			const breadcrumbs = getBreadcrumbs( state );

			return {
				hasJetpackSites: hasJetpackSites( state ),
				sites,
				selectedSite,
				selectedSiteId,
				selectedSiteSlug: getSelectedSiteSlug( state ),
				selectedSiteIsJetpack: selectedSite && isJetpackSite( state, selectedSiteId ),
				siteIds,
				canSelectedJetpackSiteUpdateFiles:
					selectedSite && canJetpackSiteUpdateFiles( state, selectedSiteId ),
				wporgPlugins: getAllWporgPlugins( state ),
				isRequestingSites: isRequestingSites( state ),
				currentPlugins: config.isEnabled( 'bulk-plugin-management' )
					? pluginsWithUpdatesAndStatuses
					: getPlugins( state, siteIds, filter ),
				currentPluginsOnVisibleSites: config.isEnabled( 'bulk-plugin-management' )
					? []
					: getPlugins( state, siteObjectsToSiteIds( getVisibleSites( sites ) ) ?? [], filter ),
				pluginsWithUpdates,
				pluginUpdateCount: pluginsWithUpdates && pluginsWithUpdates.length,
				activePlugins,
				inactivePlugins,
				allPluginsCount: allPlugins && allPlugins.length,
				requestingPluginsForSites:
					isRequestingForSites( state, siteIds ) || isRequestingForAllSites( state ),
				updateableJetpackSites: getUpdateableJetpackSites( state ),
				userCanManagePlugins: selectedSiteId
					? canCurrentUser( state, selectedSiteId, 'manage_options' )
					: canCurrentUserManagePlugins( state ),
				hasManagePlugins: hasManagePlugins,
				hasUploadPlugins: hasUploadPlugins,
				hasInstallPurchasedPlugins: hasInstallPurchasedPlugins,
				isJetpackCloud,
				breadcrumbs,
				requestPluginsError: requestPluginsError( state ),
			};
		},
		{
			wporgFetchPluginData,
			recordTracksEvent,
			recordGoogleEvent,
			appendBreadcrumb,
			updateBreadcrumbs,
		}
	)
)( PluginsMain );
