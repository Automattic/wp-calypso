/**
 * External dependencies
 */
import React from 'react';
import debugModule from 'debug';
import classNames from 'classnames';
import some from 'lodash/collection/some';
import find from 'lodash/collection/find';
import filter from 'lodash/collection/filter';
import reject from 'lodash/collection/reject';
import assign from 'lodash/object/assign';
import property from 'lodash/utility/property';
import isEmpty from 'lodash/lang/isEmpty';
import get from 'lodash/object/get';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import pluginsAccessControl from 'my-sites/plugins/access-control';
import { isBusiness } from 'lib/products-values';
import PluginItem from './plugin-item/plugin-item';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import NoResults from 'my-sites/no-results';
import Search from 'components/search';
import URLSearch from 'lib/mixins/url-search';
import EmptyContent from 'components/empty-content';
import PluginsStore from 'lib/plugins/store';
import PluginsDataStore from 'lib/plugins/wporg-data/store';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import PlanNudge from 'components/plans/plan-nudge';
import FeatureExample from 'components/feature-example';
import PluginsList from './plugins-list';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:my-sites:plugins' );

export default React.createClass( {

	displayName: 'Plugins',

	mixins: [ URLSearch ],

	getInitialState() {
		return this.getPluginsState( this.props );
	},

	componentDidMount() {
		debug( 'Plugins React component mounted.' );
		this.props.sites.on( 'change', this.refreshPlugins );
		PluginsStore.on( 'change', this.refreshPlugins );
		PluginsDataStore.on( 'change', this.refreshPlugins );
	},

	componentWillUnmount() {
		this.props.sites.removeListener( 'change', this.refreshPlugins );
		PluginsStore.removeListener( 'change', this.refreshPlugins );
		PluginsDataStore.removeListener( 'change', this.refreshPlugins );
	},

	componentWillReceiveProps( nextProps ) {
		this.refreshPlugins( nextProps );
	},

	getPluginsFromStore( nextProps, sites ) {
		const props = nextProps || this.props;
		let	plugins = null;
		if ( ! props.sites.selected ) {
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
			if ( ! plugin.wpcom ) {
				return assign( {}, plugin, PluginsDataStore.get( plugin.slug ) );
			}
			return plugin;
		} );
	},

	getJetpackPlugins() {
		return reject( this.state.plugins, property( 'wpcom' ) );
	},

	getWpcomPlugins() {
		return filter( this.state.plugins, property( 'wpcom' ) );
	},

	getPluginsState( nextProps ) {
		const sites = this.state && this.state.bulkManagement ? this.props.sites.getSelectedOrAllWithPlugins() : this.props.sites.getSelectedOrAll(),
			pluginUpdate = PluginsStore.getPlugins( sites, 'updates' );

		return {
			accessError: pluginsAccessControl.hasRestrictedAccess(),
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
		const siteFilter = this.props.sites.selected ? '/' + this.props.sites.selected : '';

		return [
			{
				title: this.translate( 'All', { context: 'Filter label for plugins list' } ),
				path: '/plugins' + siteFilter,
				id: 'all'
			},
			{
				title: this.translate( 'Active', { context: 'Filter label for plugins list' } ),
				path: '/plugins/active' + siteFilter,
				id: 'active'
			},
			{
				title: this.translate( 'Inactive', { context: 'Filter label for plugins list' } ),
				path: '/plugins/inactive' + siteFilter,
				id: 'inactive'
			},
			{
				title: this.translate( 'Updates', { context: 'Filter label for plugins list' } ),
				path: '/plugins/updates' + siteFilter,
				id: 'updates'
			}
		];
	},

	getSelectedText() {
		const found = find( this.getFilters(), filterItem => this.props.filter === filterItem.id );
		if ( 'undefined' !== typeof found ) {
			return found.title;
		}
		return '';
	},

	getSearchPlaceholder() {
		switch ( this.props.filter ) {
			case 'active':
				return this.translate( 'Search All…', { textOnly: true } );

			case 'inactive':
				return this.translate( 'Search Inactive…', { textOnly: true } );

			case 'updates':
				return this.translate( 'Search Updates…', { textOnly: true } );

			case 'all':
				return this.translate( 'Search All…', { textOnly: true } );
		}
	},

	getEmptyContentUpdateData() {
		let emptyContentData = { illustration: '/calypso/images/drake/drake-ok.svg' },
			selectedSite = this.props.sites.getSelectedSite();

		if ( selectedSite ) {
			emptyContentData.title = this.translate( 'All plugins on %(siteName)s are {{span}}up to date.{{/span}}', {
				textOnly: true,
				args: { siteName: selectedSite.title },
				components: { span: <span className="plugins__plugin-list-state" /> },
				comment: 'The span tags prevents single words from showing on a single line.'
			} );
		} else {
			emptyContentData.title = this.translate( 'All plugins are up to date.', { textOnly: true } );
		}

		if ( this.getUpdatesTabVisibility() ) {
			return emptyContentData;
		}

		emptyContentData.action = this.translate( 'All Plugins', { textOnly: true } );

		if ( selectedSite ) {
			emptyContentData.actionURL = '/plugins/' + selectedSite.slug;
			if ( selectedSite.jetpack ) {
				emptyContentData.illustration = '/calypso/images/drake/drake-jetpack.svg';
				emptyContentData.title = this.translate( 'Plugins can\'t be updated on %(siteName)s.', {
					textOnly: true,
					args: { siteName: selectedSite.title }
				} );
			} else {
				// buisness plan sites
				emptyContentData.title = this.translate( 'Plugins are updated automatically on %(siteName)s.', {
					textOnly: true,
					args: { siteName: selectedSite.title }
				} );
			}
		} else {
			emptyContentData.title = this.translate( 'No updates are available.', { textOnly: true } );
			emptyContentData.illustration = '/calypso/images/drake/drake-empty-results.svg';
			emptyContentData.actionURL = '/plugins';
		}

		return emptyContentData;
	},

	getEmptyContentData() {
		let emptyContentData = { illustration: '/calypso/images/drake/drake-empty-results.svg', };

		switch ( this.props.filter ) {
			case 'inactive':
				emptyContentData.title = this.translate( 'No plugins are inactive.', { textOnly: true } );
				break;
			case 'updates':
				emptyContentData = this.getEmptyContentUpdateData();
				break;
			default:
				emptyContentData.title = this.translate( 'No plugins match that filter.', { textOnly: true } );
		}
		return emptyContentData;
	},

	getUpdatesTabVisibility() {
		const selectedSite = this.props.sites.getSelectedSite();

		if ( selectedSite ) {
			return selectedSite.jetpack && selectedSite.canUpdateFiles;
		}

		return some( this.props.sites.getSelectedOrAllWithPlugins(), site => site && site.jetpack && site.canUpdateFiles );
	},

	shouldShowPluginListPlaceholders( isWpCom ) {
		const { plugins } = this.state;
		const { sites } = this.props;

		let showPlaceholders = isEmpty( plugins );

		if ( showPlaceholders && isWpCom === get( sites.getSelectedSite(), 'jetpack' ) ) {
			return false;
		}
		return showPlaceholders;
	},

	renderPluginsContent() {
		const plugins = this.state.plugins || [];

		if ( isEmpty( plugins ) ) {
			if ( this.props.search ) {
				return <NoResults text={ this.translate( 'No plugins match your search for {{searchTerm/}}.', {
					textOnly: true,
					components: { searchTerm: <em>{ this.props.search }</em> }
				} ) } />
			}

			if ( 'inactive' === this.props.filter || 'updates' === this.props.filter ) {
				let emptyContentData = this.getEmptyContentData();
				return ( <EmptyContent
					title={ emptyContentData.title }
					illustration={ emptyContentData.illustration }
					actionURL={ emptyContentData.actionURL }
					action={ emptyContentData.action } />
				);
			}
		}
		return (
			<div className="plugins__lists">
				<PluginsList
					header={ this.translate( 'WordPress.com Plugins' ) }
					plugins={ this.getWpcomPlugins() }
					isWpCom= { true }
					sites={ this.props.sites }
					selectedSite={ this.props.sites.getSelectedSite() }
					isPlaceholder= { this.shouldShowPluginListPlaceholders( true ) } />
				<PluginsList
					header={ this.translate( 'Jetpack Plugins' ) }
					plugins={ this.getJetpackPlugins() }
					isWpCom={ false }
					sites={ this.props.sites }
					selectedSite={ this.props.sites.getSelectedSite() }
					pluginUpdateCount={ this.state.pluginUpdateCount }
					isPlaceholder= { this.shouldShowPluginListPlaceholders( false ) } />
			</div>
		);
	},

	getMockPluginItems() {
		const plugins = [ {
			slug: 'akismet',
			name: 'Akismet',
			wporg: true,
			icon: '//ps.w.org/akismet/assets/icon-256x256.png'
		}, {
			slug: 'wp-super-cache',
			name: 'WP Super Cache',
			wporg: true,
			icon: '//ps.w.org/wp-super-cache/assets/icon-256x256.png'
		}, {
			slug: 'jetpack',
			name: 'Jetpack by WordPress.com',
			wporg: true,
			icon: '//ps.w.org/jetpack/assets/icon-256x256.png'
		} ];
		const selectedSite = {
			slug: 'no-slug',
			canUpdateFiles: true,
			name: 'Not a real site'
		}

		return plugins.map( plugin => {
			return <PluginItem
				key={ 'plugin-item-mock-' + plugin.slug }
				plugin={ plugin }
				sites={ [] }
				selectedSite={ selectedSite }
				progress={ [] }
				isMock={ true } />
		} );
	},

	render() {
		if ( this.state.accessError ) {
			return (
				<Main>
					<SidebarNavigation />
					<EmptyContent { ...this.state.accessError } />
					{ this.state.accessError.featureExample ? <FeatureExample>{ this.state.accessError.featureExample }</FeatureExample> : null }
				</Main>
			);
		}

		const selectedSite = this.props.sites.getSelectedSite();
		if ( abtest( 'businessPluginsNudge' ) === 'nudge' && selectedSite && ! selectedSite.jetpack && ! isBusiness( selectedSite.plan ) ) {
			return (
				<Main>
					<SidebarNavigation />
					<PlanNudge currentProductId={ selectedSite.plan.product_id } selectedSiteSlug={ selectedSite.slug } />
				</Main>
			);
		}

		if ( selectedSite && selectedSite.jetpack && ! selectedSite.canManage() ) {
			return (
				<Main>
					<SidebarNavigation />
					<JetpackManageErrorPage
						template="optInManage"
						site={ this.props.sites.getSelectedSite() }
						title={ this.translate( 'Looking to manage this site\'s plugins?' ) }
						section="plugins"
						featureExample={ this.getMockPluginItems() } />
				</Main>
			);
		}

		const containerClass = classNames( {
			'main-column': true,
			plugins: true,
			'search-open': this.getSearchOpen()
		} );

		return (
			<Main className={ containerClass }>
				<SidebarNavigation />
				<SectionNav selectedText={ this.getSelectedText() }>
					<NavTabs>
						{ this.getFilters().map( filterItem => {
							if ( 'updates' === filterItem.id && ! this.getUpdatesTabVisibility() ) {
								return null;
							}

							let attr = {
								key: filterItem.id,
								path: filterItem.path,
								selected: filterItem.id === this.props.filter,
							}

							if ( 'updates' === filterItem.id ) {
								attr.count = this.state.pluginUpdateCount;
							}
							return (
								<NavItem { ...attr } >
									{ filterItem.title }
								</NavItem>
							);
						} ) }
					</NavTabs>

					<Search
						pinned
						onSearch={ this.doSearch }
						initialValue={ this.props.search }
						ref="url-search"
						analyticsGroup="Plugins"
						placeholder={ this.getSearchPlaceholder() } />
				</SectionNav>
				{ this.renderPluginsContent() }
			</Main>
		);
	}
} );
