import {
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
	WPCOM_FEATURES_MANAGE_PLUGINS,
	WPCOM_FEATURES_UPLOAD_PLUGINS,
} from '@automattic/calypso-products/src';
import { Button } from '@automattic/components';
import { subscribeIsWithinBreakpoint, isWithinBreakpoint } from '@automattic/viewport';
import { Icon, upload } from '@wordpress/icons';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { capitalize, find, flow, isEmpty } from 'lodash';
import page from 'page';
import { Component } from 'react';
import { connect } from 'react-redux';
import Count from 'calypso/components/count';
import DocumentHead from 'calypso/components/data/document-head';
import QueryAllJetpackSitesPlugins from 'calypso/components/data/query-all-jetpack-sites-plugins';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import EmptyContent from 'calypso/components/empty-content';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import Main from 'calypso/components/main';
import Search from 'calypso/components/search';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import urlSearch from 'calypso/lib/url-search';
import { getVisibleSites, siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getPlugins,
	isRequestingForSites,
	isRequestingForAllSites,
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
import PluginsList from './plugins-list';

import './style.scss';

export class PluginsMain extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			isMobile: isWithinBreakpoint( '<960px' ),
		};
	}

	componentDidUpdate( prevProps ) {
		const {
			currentPlugins,
			hasJetpackSites: hasJpSites,
			selectedSiteIsJetpack,
			selectedSiteSlug,
			hasInstallPurchasedPlugins,
			hasManagePlugins,
		} = this.props;

		currentPlugins.map( ( plugin ) => {
			const pluginData = this.props.wporgPlugins?.[ plugin.slug ];
			if ( ! pluginData ) {
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
	}

	componentDidMount() {
		// Change the isMobile state when the size of the browser changes.
		this.unsubscribe = subscribeIsWithinBreakpoint( '<960px', ( isMobile ) => {
			this.setState( { isMobile } );
		} );
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	getCurrentPlugins() {
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

	getFilters() {
		const { translate, search } = this.props;
		const siteFilter = `${ this.props.selectedSiteSlug ? '/' + this.props.selectedSiteSlug : '' }${
			search ? '?s=' + search : ''
		}`;

		return [
			{
				title:
					isWithinBreakpoint( '<480px' ) && this.props.isJetpackCloud
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

	getSelectedText() {
		const found = find( this.getFilters(), ( filterItem ) => this.props.filter === filterItem.id );
		if ( 'undefined' !== typeof found ) {
			const count = this.getPluginCount( found.id );
			return { title: found.title, count };
		}
		return '';
	}

	getSearchPlaceholder() {
		const { translate } = this.props;

		switch ( this.props.filter ) {
			case 'active':
				return translate( 'Search All…', { textOnly: true } );

			case 'inactive':
				return translate( 'Search Inactive…', { textOnly: true } );

			case 'updates':
				return translate( 'Search Updates…', { textOnly: true } );

			case 'all':
				return translate( 'Search All…', { textOnly: true } );
		}
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
		const { translate } = this.props;
		let emptyContentData = {
			illustration: '/calypso/images/illustrations/illustration-empty-results.svg',
		};

		switch ( this.props.filter ) {
			case 'active':
				emptyContentData.title = translate( 'No plugins are active.', { textOnly: true } );
				break;
			case 'inactive':
				emptyContentData.title = translate( 'No plugins are inactive.', { textOnly: true } );
				break;
			case 'updates':
				emptyContentData = this.getEmptyContentUpdateData();
				break;
			default:
				return null;
		}
		return emptyContentData;
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
		const { search, isJetpackCloud } = this.props;

		const currentPlugins = this.getCurrentPlugins();
		const showInstalledPluginList =
			isJetpackCloud || ! isEmpty( currentPlugins ) || this.isFetchingPlugins();

		if ( ! showInstalledPluginList && ! search ) {
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
				header={ this.props.translate( 'Installed Plugins' ) }
				plugins={ currentPlugins }
				pluginUpdateCount={ this.props.pluginUpdateCount }
				isPlaceholder={ this.shouldShowPluginListPlaceholders() }
				isLoading={ this.props.requestingPluginsForSites }
				isJetpackCloud={ this.props.isJetpackCloud }
				searchTerm={ search }
			/>
		);

		return <div>{ installedPluginsList }</div>;
	}

	handleAddPluginButtonClick = () => {
		this.props.recordGoogleEvent( 'Plugins', 'Clicked Add New Plugins' );
	};

	renderAddPluginButton() {
		const { selectedSiteSlug, translate } = this.props;
		const browserUrl = '/plugins' + ( selectedSiteSlug ? '/' + selectedSiteSlug : '' );

		return (
			<Button
				className="plugins__button"
				href={ browserUrl }
				onClick={ this.handleAddPluginButtonClick }
			>
				<span className="plugins__button-text">{ translate( 'Browse plugins' ) }</span>
			</Button>
		);
	}

	handleUploadPluginButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_click_plugin_upload' );
		this.props.recordGoogleEvent( 'Plugins', 'Clicked Plugin Upload Link' );
	};

	renderUploadPluginButton( isMobile ) {
		const { selectedSiteSlug, translate, hasUploadPlugins } = this.props;
		const uploadUrl = '/plugins/upload' + ( selectedSiteSlug ? '/' + selectedSiteSlug : '' );

		if ( ! hasUploadPlugins ) {
			return null;
		}

		return (
			<Button
				className="plugins__button"
				href={ uploadUrl }
				onClick={ this.handleUploadPluginButtonClick }
			>
				<Icon className="plugins__button-icon" icon={ upload } width={ 18 } height={ 18 } />
				{ ! isMobile && <span className="plugins__button-text">{ translate( 'Upload' ) }</span> }
			</Button>
		);
	}

	getNavigationItems() {
		const { search, selectedSiteSlug } = this.props;
		const navigationItems = [
			{
				label: this.props.translate( 'Plugins' ),
				href: `/plugins/${ selectedSiteSlug || '' }`,
				helpBubble: this.props.translate(
					'Add new functionality and integrations to your site with plugins.'
				),
			},
			{
				label: this.props.translate( 'Installed Plugins' ),
				href: `/plugins/manage/${ selectedSiteSlug || '' }`,
			},
		];
		if ( search ) {
			navigationItems.push( {
				label: this.props.translate( 'Search Results' ),
				href: `/plugins/${ selectedSiteSlug || '' }?s=${ search }`,
			} );
		}

		return navigationItems;
	}

	render() {
		if ( ! this.props.isRequestingSites && ! this.props.userCanManagePlugins ) {
			return <NoPermissionsError title={ this.props.translate( 'Plugins', { textOnly: true } ) } />;
		}

		const navItems = this.getFilters().map( ( filterItem ) => {
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

		const pageTitle = this.props.translate( 'Plugins', { textOnly: true } );

		const { isJetpackCloud, selectedSite } = this.props;

		const { title, count } = this.getSelectedText();

		const selectedTextContent = (
			<span>
				{ title }
				{ isJetpackCloud && count ? <Count count={ count } compact={ true } /> : null }
			</span>
		);

		const content = (
			<>
				<DocumentHead title={ pageTitle } />
				{ selectedSite ? (
					<QueryJetpackPlugins siteIds={ [ selectedSite.ID ] } />
				) : (
					<QueryAllJetpackSitesPlugins />
				) }
				<QuerySiteFeatures siteIds={ this.props.siteIds } />
				{ this.renderPageViewTracking() }
				{ ! isJetpackCloud && (
					<FixedNavigationHeader
						className="plugins__page-heading"
						navigationItems={ this.getNavigationItems() }
					>
						<div className="plugins__main-buttons">
							{ this.renderAddPluginButton() }
							{ this.renderUploadPluginButton( this.state.isMobile ) }
						</div>
					</FixedNavigationHeader>
				) }
				<div className={ classNames( { 'plugins__top-container': isJetpackCloud } ) }>
					<div
						className={ classNames( {
							'plugins__content-wrapper': isJetpackCloud,
						} ) }
					>
						{ isJetpackCloud && (
							<div className="plugins__page-title-container">
								<h2 className="plugins__page-title">{ pageTitle }</h2>
								<div className="plugins__page-subtitle">
									{ this.props.selectedSite
										? this.props.translate( 'Manage all plugins installed on %(selectedSite)s', {
												args: {
													selectedSite: this.props.selectedSite.domain,
												},
										  } )
										: this.props.translate( 'Manage plugins installed on all sites' ) }
								</div>
							</div>
						) }
						<div
							className={ classNames( 'plugins__main', {
								'plugins__jetpack-cloud': isJetpackCloud,
							} ) }
						>
							<div className="plugins__main-header">
								<SectionNav
									applyUpdatedStyles={ isJetpackCloud }
									selectedText={ selectedTextContent }
									className={ classNames( {
										'is-jetpack-cloud': isJetpackCloud,
									} ) }
								>
									<NavTabs
										selectedText={ isJetpackCloud && title }
										selectedCount={ isJetpackCloud && count }
									>
										{ navItems }
									</NavTabs>
									{ ! isJetpackCloud && (
										<Search
											pinned
											fitsContainer
											onSearch={ this.props.doSearch }
											initialValue={ this.props.search }
											ref={ `url-search` }
											analyticsGroup="Plugins"
											placeholder={ this.getSearchPlaceholder() }
										/>
									) }
								</SectionNav>
							</div>
						</div>
					</div>
				</div>
				{ isJetpackCloud ? (
					<div className="plugins__main-content">
						<div className="plugins__content-wrapper">
							<div className="plugins__search">
								<Search
									hideFocus
									isOpen
									onSearch={ this.props.doSearch }
									initialValue={ this.props.search }
									hideClose={ ! this.props.search }
									ref={ `url-search` }
									analyticsGroup="Plugins"
									placeholder={ this.props.translate( 'Search plugins' ) }
								/>
							</div>
							{ this.renderPluginsContent() }
						</div>
					</div>
				) : (
					this.renderPluginsContent()
				) }
			</>
		);

		return isJetpackCloud ? content : <Main wideLayout>{ content }</Main>;
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
			const visibleSiteIds = siteObjectsToSiteIds( getVisibleSites( sites ) ) ?? [];
			const siteIds = siteObjectsToSiteIds( sites ) ?? [];
			const pluginsWithUpdates = getPlugins( state, siteIds, 'updates' );
			const allPlugins = getPlugins( state, siteIds, 'all' );
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
				selectedSiteSlug: getSelectedSiteSlug( state ),
				selectedSiteIsJetpack: selectedSite && isJetpackSite( state, selectedSiteId ),
				siteIds,
				canSelectedJetpackSiteUpdateFiles:
					selectedSite && canJetpackSiteUpdateFiles( state, selectedSiteId ),
				wporgPlugins: getAllWporgPlugins( state ),
				isRequestingSites: isRequestingSites( state ),
				currentPlugins: getPlugins( state, siteIds, filter ),
				currentPluginsOnVisibleSites: getPlugins( state, visibleSiteIds, filter ),
				pluginUpdateCount: pluginsWithUpdates && pluginsWithUpdates.length,
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
			};
		},
		{ wporgFetchPluginData, recordTracksEvent, recordGoogleEvent }
	)
)( PluginsMain );
