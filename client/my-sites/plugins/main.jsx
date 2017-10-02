/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { find, isEmpty, some } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PluginItem from './plugin-item/plugin-item';
import DocumentHead from 'components/data/document-head';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Search from 'components/search';
import URLSearch from 'lib/mixins/url-search';
import EmptyContent from 'components/empty-content';
import PluginsStore from 'lib/plugins/store';
import { fetchPluginData as wporgFetchPluginData } from 'state/plugins/wporg/actions';
import WporgPluginsSelectors from 'state/plugins/wporg/selectors';
import PluginsList from './plugins-list';
import { recordGoogleEvent } from 'state/analytics/actions';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import WpcomPluginPanel from 'my-sites/plugins-wpcom';
import PluginsBrowser from './plugins-browser';
import NonSupportedJetpackVersionNotice from './not-supported-jetpack-version';
import NoPermissionsError from './no-permissions-error';
import {
	canCurrentUser,
	canCurrentUserManagePlugins
} from 'state/selectors';
import {
	canJetpackSiteManage,
	canJetpackSiteUpdateFiles,
	isJetpackSite,
	isRequestingSites
} from 'state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug
} from 'state/ui/selectors';
import { getSelectedOrAllSitesWithPlugins } from 'state/selectors';
import HeaderButton from 'components/header-button';
import { isEnabled } from 'config';

const PluginsMain = React.createClass( {
	mixins: [ URLSearch ],

	getInitialState() {
		return this.getPluginsState( this.props );
	},

	componentDidMount() {
		PluginsStore.on( 'change', this.refreshPlugins );
	},

	componentWillUnmount() {
		PluginsStore.removeListener( 'change', this.refreshPlugins );
	},

	componentWillReceiveProps( nextProps ) {
		this.refreshPlugins( nextProps );
	},

	getPluginsFromStore( nextProps, sites ) {
		const props = nextProps || this.props;
		let	plugins = null;
		if ( ! props.selectedSiteSlug ) {
			plugins = PluginsStore.getPlugins( sites.filter( site => site.visible ), props.filter );
		} else {
			plugins = PluginsStore.getPlugins( sites, props.filter );
		}

		if ( ! plugins ) {
			return plugins;
		}

		if ( props && props.search ) {
			plugins = plugins.filter( this.matchSearchTerms.bind( this, props.search ) );
		}

		return this.addWporgDataToPlugins( plugins );
	},

	// plugins for Jetpack sites require additional data from the wporg-data store
	addWporgDataToPlugins( plugins ) {
		return plugins.map( plugin => {
			const pluginData = WporgPluginsSelectors.getPlugin( this.props.wporgPlugins, plugin.slug );
			if ( ! pluginData ) {
				this.props.wporgFetchPluginData( plugin.slug );
			}
			return Object.assign( {}, plugin, pluginData );
		} );
	},

	getPluginsState( nextProps ) {
		const sites = this.props.sites,
			pluginUpdate = PluginsStore.getPlugins( sites, 'updates' );
		return {
			plugins: this.getPluginsFromStore( nextProps, sites ),
			pluginUpdateCount: pluginUpdate && pluginUpdate.length,
			selectedAction: 'Actions'
		};
	},

	refreshPlugins( nextProps ) {
		this.setState( this.getPluginsState( nextProps ) );
	},

	matchSearchTerms( search, plugin ) {
		search = search.toLowerCase();
		return [ 'name', 'description', 'author' ].some( attribute =>
			plugin[ attribute ] && plugin[ attribute ].toLowerCase().indexOf( search ) !== -1
		);
	},

	getFilters() {
		const { translate } = this.props;
		const siteFilter = this.props.selectedSiteSlug ? '/' + this.props.selectedSiteSlug : '';

		return [
			{
				title: translate( 'All', { context: 'Filter label for plugins list' } ),
				path: '/plugins/manage' + siteFilter,
				id: 'all'
			},
			{
				title: translate( 'Active', { context: 'Filter label for plugins list' } ),
				path: '/plugins/active' + siteFilter,
				id: 'active'
			},
			{
				title: translate( 'Inactive', { context: 'Filter label for plugins list' } ),
				path: '/plugins/inactive' + siteFilter,
				id: 'inactive'
			},
			{
				title: translate( 'Updates', { context: 'Filter label for plugins list' } ),
				path: '/plugins/updates' + siteFilter,
				id: 'updates'
			}
		];
	},

	isFetchingPlugins() {
		return this.props.sites.some( PluginsStore.isFetchingSite );
	},

	getSelectedText() {
		const found = find( this.getFilters(), filterItem => this.props.filter === filterItem.id );
		if ( 'undefined' !== typeof found ) {
			return found.title;
		}
		return '';
	},

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
	},

	getEmptyContentUpdateData() {
		const { translate } = this.props;
		const emptyContentData = { illustration: '/calypso/images/illustrations/illustration-ok.svg' },
			{ selectedSite } = this.props;

		if ( selectedSite ) {
			emptyContentData.title = translate( 'All plugins on %(siteName)s are {{span}}up to date.{{/span}}', {
				textOnly: true,
				args: { siteName: selectedSite.title },
				components: { span: <span className="plugins__plugin-list-state" /> },
				comment: 'The span tags prevents single words from showing on a single line.'
			} );
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
				emptyContentData.title = translate( 'Plugins can\'t be updated on %(siteName)s.', {
					textOnly: true,
					args: { siteName: selectedSite.title }
				} );
			} else {
				// buisness plan sites
				emptyContentData.title = translate( 'Plugins are updated automatically on %(siteName)s.', {
					textOnly: true,
					args: { siteName: selectedSite.title }
				} );
			}
		} else {
			emptyContentData.title = translate( 'No updates are available.', { textOnly: true } );
			emptyContentData.illustration = '/calypso/images/illustrations/illustration-empty-results.svg';
			emptyContentData.actionURL = '/plugins';
		}

		return emptyContentData;
	},

	getEmptyContentData() {
		const { translate } = this.props;
		let emptyContentData = { illustration: '/calypso/images/illustrations/illustration-empty-results.svg', };

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
	},

	getUpdatesTabVisibility() {
		const { selectedSite } = this.props;

		if ( selectedSite ) {
			return this.props.selectedSiteIsJetpack && this.props.canSelectedJetpackSiteUpdateFiles;
		}

		return some(
			this.props.sites,
			site => site && this.props.isJetpackSite( site.ID ) && this.props.canJetpackSiteUpdateFiles( site.ID )
		);
	},

	shouldShowPluginListPlaceholders() {
		const { plugins } = this.state;

		return isEmpty( plugins ) && this.isFetchingPlugins();
	},

	renderDocumentHead() {
		return <DocumentHead title={ this.props.translate( 'Plugins', { textOnly: true } ) } />;
	},

	renderPluginsContent() {
		const { plugins = [] } = this.state;
		const { filter, search } = this.props;

		const showInstalledPluginList = ! isEmpty( plugins ) || this.isFetchingPlugins();
		const showSuggestedPluginsList = filter === 'all' || ( ! showInstalledPluginList && search );

		if ( ! showInstalledPluginList && ! search ) {
			const emptyContentData = this.getEmptyContentData();
			if ( emptyContentData ) {
				return <EmptyContent
					title={ emptyContentData.title }
					illustration={ emptyContentData.illustration }
					actionURL={ emptyContentData.actionURL }
					action={ emptyContentData.action } />;
			}
		}

		const installedPluginsList = showInstalledPluginList && (
			<PluginsList
				header={ this.props.translate( 'Installed Plugins' ) }
				plugins={ plugins }
				pluginUpdateCount={ this.state.pluginUpdateCount }
				isPlaceholder={ this.shouldShowPluginListPlaceholders() }
			/>
		);

		const morePluginsHeader = showInstalledPluginList && showSuggestedPluginsList && (
			<h3 className="plugins__more-header">More Plugins</h3>
		);

		let searchTitle;
		if ( search ) {
			searchTitle = this.props.translate( 'Suggested plugins for: %(searchQuery)s', {
				textOnly: true,
				args: {
					searchQuery: search,
				},
			} );
		}

		const suggestedPluginsList = showSuggestedPluginsList && (
			<PluginsBrowser
				hideSearchForm
				path={ this.props.context.path }
				search={ search }
				searchTitle={ searchTitle }
			/>
		);

		return (
			<div>
				{ installedPluginsList }
				{ morePluginsHeader }
				{ suggestedPluginsList }
			</div>
		);
	},

	getMockPluginItems() {
		const plugins = [ {
			slug: 'akismet',
			name: 'Akismet',
			icon: '//ps.w.org/akismet/assets/icon-256x256.png',
			wporg: true
		}, {
			slug: 'wp-super-cache',
			name: 'WP Super Cache',
			icon: '//ps.w.org/wp-super-cache/assets/icon-256x256.png',
			wporg: true
		}, {
			slug: 'jetpack',
			name: 'Jetpack by WordPress.com',
			icon: '//ps.w.org/jetpack/assets/icon-256x256.png',
			wporg: true
		} ];
		const selectedSite = {
			slug: 'no-slug',
			canUpdateFiles: true,
			name: 'Not a real site'
		};

		return plugins.map( plugin => {
			return <PluginItem
				key={ 'plugin-item-mock-' + plugin.slug }
				plugin={ plugin }
				sites={ [] }
				selectedSite={ selectedSite }
				progress={ [] }
				isMock={ true } />;
		} );
	},

	handleAddPluginButtonClick() {
		this.props.recordGoogleEvent( 'Plugins', 'Clicked Add New Plugins' );
	},

	renderAddPluginButton() {
		const { selectedSiteSlug, translate } = this.props;
		const browserUrl = '/plugins' + ( selectedSiteSlug ? '/' + selectedSiteSlug : '' );

		return (
			<HeaderButton
				icon="plus"
				label={ translate( 'Add Plugin' ) }
				aria-label={ translate( 'Browse all plugins', { context: 'button label' } ) }
				href={ browserUrl }
				onClick={ this.handleAddPluginButtonClick }
			/>
		);
	},

	handleUploadPluginButtonClick() {
		this.props.recordGoogleEvent( 'Plugins', 'Clicked Plugin Upload Link' );
	},

	renderUploadPluginButton() {
		if ( ! isEnabled( 'manage/plugins/upload' ) ) {
			return null;
		}

		const { selectedSiteSlug, translate } = this.props;
		const uploadUrl = '/plugins/upload' + ( selectedSiteSlug ? '/' + selectedSiteSlug : '' );

		return (
			<HeaderButton
				icon="cloud-upload"
				label={ translate( 'Upload Plugin' ) }
				aria-label={ translate( 'Upload Plugin' ) }
				href={ uploadUrl }
				onClick={ this.handleUploadPluginButtonClick }
			/>
		);
	},

	render() {
		const {
			category,
			search,
			selectedSite,
			selectedSiteId,
		} = this.props;

		if ( ! this.props.isRequestingSites && ! this.props.userCanManagePlugins ) {
			return <NoPermissionsError title={ this.props.translate( 'Plugins', { textOnly: true } ) } />;
		}

		if ( selectedSite && ! this.props.selectedSiteIsJetpack ) {
			return (
				<Main wideLayout>
					{ this.renderDocumentHead() }
					<SidebarNavigation />
					<WpcomPluginPanel { ...{
						category,
						search,
					} } />
				</Main>
			);
		}

		if ( this.props.selectedSiteIsJetpack && ! this.props.canSelectedJetpackSiteManage ) {
			return (
				<Main>
					{ this.renderDocumentHead() }
					<SidebarNavigation />
					<JetpackManageErrorPage
						template="optInManage"
						siteId={ selectedSiteId }
						title={ this.props.translate( 'Looking to manage this site\'s plugins?' ) }
						section="plugins"
						featureExample={ this.getMockPluginItems() } />
				</Main>
			);
		}

		const navItems = this.getFilters().map( filterItem => {
			if ( 'updates' === filterItem.id && ! this.getUpdatesTabVisibility() ) {
				return null;
			}

			const attr = {
				key: filterItem.id,
				path: filterItem.path,
				selected: filterItem.id === this.props.filter,
			};

			if ( 'updates' === filterItem.id ) {
				attr.count = this.state.pluginUpdateCount;
			}
			return (
				<NavItem { ...attr } >
					{ filterItem.title }
				</NavItem>
			);
		} );

		return (
			<Main wideLayout>
				<NonSupportedJetpackVersionNotice />
				{ this.renderDocumentHead() }
				<SidebarNavigation />
				<div className="plugins__header">
					<SectionNav selectedText={ this.getSelectedText() }>
						<NavTabs>
							{ navItems }
						</NavTabs>
						<Search
							pinned
							fitsContainer
							onSearch={ this.doSearch }
							initialValue={ this.props.search }
							ref="url-search"
							analyticsGroup="Plugins"
							placeholder={ this.getSearchPlaceholder() } />
					</SectionNav>
					<div className="plugins__header-buttons">
						{ this.renderAddPluginButton() }
						{ this.renderUploadPluginButton() }
					</div>
				</div>
				{ this.renderPluginsContent() }
			</Main>
		);
	}
} );

export default connect(
	state => {
		const selectedSite = getSelectedSite( state );
		const selectedSiteId = getSelectedSiteId( state );
		return {
			sites: getSelectedOrAllSitesWithPlugins( state ),
			selectedSite,
			selectedSiteId,
			selectedSiteSlug: getSelectedSiteSlug( state ),
			selectedSiteIsJetpack: selectedSite && isJetpackSite( state, selectedSiteId ),
			canSelectedJetpackSiteManage: selectedSite && canJetpackSiteManage( state, selectedSiteId ),
			canSelectedJetpackSiteUpdateFiles: selectedSite && canJetpackSiteUpdateFiles( state, selectedSiteId ),
			canJetpackSiteUpdateFiles: siteId => canJetpackSiteUpdateFiles( state, siteId ),
			isJetpackSite: siteId => isJetpackSite( state, siteId ),
			wporgPlugins: state.plugins.wporg.items,
			isRequestingSites: isRequestingSites( state ),
			userCanManagePlugins: ( selectedSiteId
				? canCurrentUser( state, selectedSiteId, 'manage_options' )
				: canCurrentUserManagePlugins( state ) )
		};
	},
	{ wporgFetchPluginData, recordGoogleEvent }
)( localize( PluginsMain ) );
