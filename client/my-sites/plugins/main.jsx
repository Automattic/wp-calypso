import {
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
	WPCOM_FEATURES_MANAGE_PLUGINS,
	WPCOM_FEATURES_UPLOAD_PLUGINS,
} from '@automattic/calypso-products/src';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { Icon, upload } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { filter as capitalize, flow, isEmpty } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackSitesFeatures from 'calypso/components/data/query-jetpack-sites-features';
import QueryPlugins from 'calypso/components/data/query-plugins';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import NavigationHeader from 'calypso/components/navigation-header';
import MissingPaymentNotification from 'calypso/jetpack-cloud/components/missing-payment-notification';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import urlSearch from 'calypso/lib/url-search';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { appendBreadcrumb, updateBreadcrumbs } from 'calypso/state/breadcrumb/actions';
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
import hasJetpackSites from 'calypso/state/selectors/has-jetpack-sites';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite, isRequestingSites } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import NoPermissionsError from './no-permissions-error';
import PluginsList from './plugins-list';

import './style.scss';

export class PluginsMain extends Component {
	componentDidUpdate( prevProps ) {
		const {
			hasJetpackSites: hasJpSites,
			selectedSiteIsJetpack,
			selectedSiteSlug,
			hasInstallPurchasedPlugins,
			hasManagePlugins,
			search,
		} = this.props;

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
		return this.addWporgDataToPlugins( this.props.currentPlugins );
	}

	// plugins for Jetpack sites require additional data from the wporg-data store
	addWporgDataToPlugins( plugins ) {
		return plugins.map( ( plugin ) => {
			const pluginData = this.props.wporgPlugins?.[ plugin.slug ];
			return Object.assign( {}, plugin, pluginData );
		} );
	}

	isFetchingPlugins() {
		return this.props.requestingPluginsForSites;
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
		return (
			<PluginsList
				header={ this.props.translate( 'Manage Plugins' ) }
				plugins={ this.getCurrentPlugins() }
				isPlaceholder={ this.shouldShowPluginListPlaceholders() }
				isLoading={ this.props.requestingPluginsForSites || this.props.isLoadingSites }
				isJetpackCloud={ this.props.isJetpackCloud }
				searchTerm={ this.props.search }
				filter={ this.props.filter }
				requestPluginsError={ this.props.requestPluginsError }
				onSearch={ this.props.doSearch }
			/>
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

		const { isJetpackCloud, selectedSite } = this.props;

		let pageTitle;
		if ( isJetpackCloud ) {
			pageTitle = this.props.translate( 'Plugins', { textOnly: true } );
		} else {
			pageTitle = this.props.translate( 'Manage Plugins', { textOnly: true } );
		}

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
						</div>
					</div>
					{ this.renderPluginsContent() }
				</div>
			</>
		);
	}
}

export default flow(
	localize,
	urlSearch,
	connect(
		( state, { isJetpackCloud } ) => {
			const sites = getSelectedOrAllSitesWithPlugins( state );
			const selectedSite = getSelectedSite( state );
			const selectedSiteId = getSelectedSiteId( state );
			const siteIds = siteObjectsToSiteIds( sites ) ?? [];
			const isLoadingSites = isRequestingSites( state );
			const allPlugins = getPlugins( state, siteIds, 'all' );
			const pluginsWithUpdatesAndStatuses = getPluginsWithUpdateStatuses( state, allPlugins );

			const jetpackNonAtomic =
				isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId );
			const hasManagePlugins =
				siteHasFeature( state, selectedSiteId, WPCOM_FEATURES_MANAGE_PLUGINS ) || jetpackNonAtomic;
			const hasUploadPlugins =
				siteHasFeature( state, selectedSiteId, WPCOM_FEATURES_UPLOAD_PLUGINS ) || jetpackNonAtomic;
			const hasInstallPurchasedPlugins =
				siteHasFeature( state, selectedSiteId, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS ) ||
				jetpackNonAtomic;

			return {
				hasJetpackSites: hasJetpackSites( state ),
				sites,
				selectedSite,
				selectedSiteId,
				isLoadingSites,
				selectedSiteSlug: getSelectedSiteSlug( state ),
				selectedSiteIsJetpack: selectedSite && isJetpackSite( state, selectedSiteId ),
				siteIds,
				wporgPlugins: getAllWporgPlugins( state ),
				isRequestingSites: isRequestingSites( state ),
				currentPlugins: pluginsWithUpdatesAndStatuses,
				requestingPluginsForSites:
					isRequestingForSites( state, siteIds ) || isRequestingForAllSites( state ),
				userCanManagePlugins: selectedSiteId
					? canCurrentUser( state, selectedSiteId, 'manage_options' )
					: canCurrentUserManagePlugins( state ),
				hasManagePlugins: hasManagePlugins,
				hasUploadPlugins: hasUploadPlugins,
				hasInstallPurchasedPlugins: hasInstallPurchasedPlugins,
				isJetpackCloud,
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
