/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import find from 'lodash/find';
import includes from 'lodash/includes';
import negate from 'lodash/negate';
import range from 'lodash/range';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import acceptDialog from 'lib/accept';
import DisconnectJetpackDialog from 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-dialog';
import PluginItem from 'my-sites/plugins/plugin-item/plugin-item';
import PluginsActions from 'lib/plugins/actions';
import PluginsListHeader from 'my-sites/plugins/plugin-list-header';
import PluginsLog from 'lib/plugins/log-store';
import PluginNotices from 'lib/plugins/notices';
import SectionHeader from 'components/section-header';

function checkPropsChange( nextProps, propArr ) {
	var i, prop;

	for ( i = 0; i < propArr.length; i++ ) {
		prop = propArr[ i ];

		if ( ! isEqual( nextProps[ prop ], this.props[ prop ] ) ) {
			return true;
		}
	}
	return false;
}

export default React.createClass( {
	displayName: 'PluginsList',

	mixins: [ PluginNotices ],

	propTypes: {
		plugins: PropTypes.arrayOf( PropTypes.shape( {
			sites: PropTypes.array,
			slug: PropTypes.string,
			name: PropTypes.string,
		} ) ).isRequired,
		header: PropTypes.string.isRequired,
		sites: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
		pluginUpdateCount: PropTypes.number,
		isPlaceholder: PropTypes.bool.isRequired,
	},

	shouldComponentUpdate( nextProps, nextState ) {
		var propsToCheck = [ 'plugins', 'sites', 'selectedSite', 'pluginUpdateCount', '' ];
		if ( checkPropsChange.call( this, nextProps, propsToCheck ) ) {
			return true;
		}

		if ( this.props.isPlaceholder !== nextProps.isPlaceholder ) {
			return true;
		}

		if ( this.state.bulkManagementActive !== nextState.bulkManagementActive ) {
			return true;
		}

		if ( this.state.disconnectJetpackDialog !== nextState.disconnectJetpackDialog ) {
			return true;
		}

		if ( ! isEqual( this.state.selectedPlugins, nextState.selectedPlugins ) ) {
			return true;
		}
		if ( this.shouldComponentUpdateNotices( this.state.notices, nextState.notices) ) {
			return true;
		}

		return false;
	},

	getInitialState() {
		return {
			disconnectJetpackDialog: false,
			bulkManagementActive: false,
			selectedPlugins: {}
		};
	},

	componentDidMount() {
		PluginsLog.on( 'change', this.showDisconnectDialog );
	},

	componentWillUnmount() {
		PluginsLog.removeListener( 'change', this.showDisconnectDialog );
	},

	isSelected( { slug } ) {
		return !! this.state.selectedPlugins[ slug ];
	},

	togglePlugin( plugin ) {
		const { slug } = plugin;
		const { selectedPlugins } = this.state;
		const oldValue = selectedPlugins[ slug ];
		this.setState( { selectedPlugins: Object.assign( {}, selectedPlugins, { [ slug ]: ! oldValue } ) } );
		analytics.ga.recordEvent( 'Plugins', 'Clicked to ' + this.isSelected( plugin ) ? 'Deselect' : 'Select' + 'Single Plugin', 'Plugin Name', slug );
	},

	setBulkSelectionState( plugins, selectionState ) {
		let slugsToBeUpdated = {};
		plugins.forEach( plugin => slugsToBeUpdated[ plugin.slug] = this.hasNoSitesThatCanManage( plugin ) ? false : selectionState );

		this.setState( { selectedPlugins: Object.assign( {}, this.state.selectedPlugins, slugsToBeUpdated ) } );
	},

	getPluginBySlug( slug ) {
		const { plugins } = this.props;
		return find( plugins, plugin => plugin.slug === slug );
	},

	filterSelection: {
		active( plugin ) {
			if ( this.isSelected( plugin ) ) {
				return plugin.sites.some( site => site.plugin && site.plugin.active );
			}
			return false;
		},
		inactive( plugin ) {
			if ( this.isSelected( plugin ) ) {
				return plugin.sites.some( site => site.plugin && ! site.plugin.active );
			}
			return false;
		},
		updates( plugin ) {
			if ( this.isSelected( plugin ) ) {
				return plugin.sites.some( site => site.plugin && site.plugin.update && site.plugin.update.new_version && site.canUpdateFiles );
			}
			return false;
		},
		selected( plugin ) {
			return this.isSelected( plugin );
		}
	},

	hasNoSitesThatCanManage( plugin ) {
		return ! plugin.sites.some( site => includes( site.modules || [], 'manage' ) );
	},

	getSelected() {
		return this.props.plugins.filter( this.filterSelection.selected.bind( this ) );
	},

	siteSuffix() {
		return ( this.props.selectedSite || this.props.sites.get().length === 1 ) ? '/' + this.props.sites.selected : '';
	},

	recordEvent( eventAction, includeSelectedPlugins ) {
		eventAction += ( this.props.selectedSite ? '' : ' on Multisite' );
		if ( includeSelectedPlugins ) {
			const pluginSlugs = this.getSelected().map( plugin => plugin.slug );
			analytics.ga.recordEvent( 'Plugins', eventAction, 'Plugins', pluginSlugs );
		} else {
			analytics.ga.recordEvent( 'Plugins', eventAction );
		}
	},

	// Actions
	toggleBulkManagement() {
		const activateBulkManagement = ! this.state.bulkManagementActive;

		if ( activateBulkManagement ) {
			this.setBulkSelectionState( this.props.plugins, true );
			this.setState( { bulkManagementActive: true } );
			this.recordEvent( 'Clicked Manage' );
		} else {
			this.setState( { bulkManagementActive: false } );
			this.removePluginsNotices();
			this.recordEvent( 'Clicked Manage Done' );
		}
	},

	removePluginsNotices() {
		const { notices: { completed, errors } = {} } = this.state;
		if ( completed || errors ) {
			PluginsActions.removePluginsNotices( [ ...completed, ...errors ] );
		}
	},

	doActionOverSelected( actionName, action ) {
		const isDeactivatingAndJetpackSelected = ( { slug } ) => 'deactivating' === actionName && 'jetpack' === slug;
		const flattenArrays = ( full, partial ) => [ ...full, ...partial ];
		this.removePluginsNotices();

		this.props.plugins
			.filter( this.isSelected ) // only use selected sites
			.filter( negate( isDeactivatingAndJetpackSelected ) ) // ignore sites that are deactiving
			.map( p => p.sites ) // list of plugins -> list of list of sites
			.reduce( flattenArrays, [] ) // flatten the list into one big list of sites
			.forEach( site => action( site, site.plugin ) );
	},

	updateAllPlugins() {
		this.removePluginsNotices();
		this.props.plugins.forEach( plugin => {
			plugin.sites.forEach( site => PluginsActions.updatePlugin( site, site.plugin ) );
		} );
		this.recordEvent( 'Clicked Update all Plugins', true );
	},

	updateSelected() {
		this.doActionOverSelected( 'updating', PluginsActions.updatePlugin );
		this.recordEvent( 'Clicked Update Plugin(s)', true );
	},

	activateSelected() {
		this.doActionOverSelected( 'activating', PluginsActions.activatePlugin );
		this.recordEvent( 'Clicked Activate Plugin(s)', true );
	},

	deactivateSelected() {
		this.doActionOverSelected( 'deactivating', PluginsActions.deactivatePlugin );
		this.recordEvent( 'Clicked Deactivate Plugin(s)', true );
	},

	deactiveAndDisconnectSelected() {
		let waitForDeactivate = false;

		this.doActionOverSelected( 'deactivating', ( site, plugin ) => {
			waitForDeactivate = true;
			PluginsActions.deactivatePlugin( site, plugin );
		} );

		if ( waitForDeactivate ) {
			this.setState( { disconnectJetpackDialog: true } );
		} else {
			this.refs.dialog.open();
		}

		this.recordEvent( 'Clicked Deactivate Plugin(s) and Disconnect Jetpack', true );
	},

	setAutoupdateSelected() {
		this.doActionOverSelected( 'enablingAutoupdates', PluginsActions.enableAutoUpdatesPlugin );
		this.recordEvent( 'Clicked Enable Autoupdate Plugin(s)', true );
	},

	unsetAutoupdateSelected() {
		this.doActionOverSelected( 'disablingAutoupdates', PluginsActions.disableAutoUpdatesPlugin );
		this.recordEvent( 'Clicked Disable Autoupdate Plugin(s)', true );
	},

	getConfirmationText() {
		let pluginsList = {},
			sitesList = {},
			pluginName,
			siteName;

		this.props.plugins
			.filter( this.isSelected )
			.forEach( ( plugin ) => {
				pluginsList[ plugin.slug ] = true;
				pluginName = plugin.name || plugin.slug;

				plugin.sites.forEach( ( site ) => {
					if ( site.canUpdateFiles ) {
						sitesList[ site.ID ] = true;
						siteName = site.title;
					}
				} );
			} );

		const pluginsListSize = Object.keys( pluginsList ).length;
		const siteListSize = Object.keys( sitesList ).length;
		const combination = ( siteListSize > 1 ? 'n sites' : '1 site' ) + ' ' + ( pluginsListSize > 1 ? 'n plugins' : '1 plugin' );

		switch ( combination ) {
			case '1 site 1 plugin':
				return this.translate( 'You are about to remove {{em}}%(plugin)s from %(site)s{{/em}}.{{p}}This will deactivate the plugin and delete all associated files and data.{{/p}}', {
					components: {
						em: <em />,
						p: <p />
					},
					args: {
						plugin: pluginName,
						site: siteName
					}
				} );
				break;
			case '1 site n plugins':
				return this.translate( 'You are about to remove {{em}}%(numberOfPlugins)d plugins from %(site)s{{/em}}.{{p}}This will deactivate the plugins and delete all associated files and data.{{/p}}', {
					components: {
						em: <em />,
						p: <p />
					},
					args: {
						numberOfPlugins: pluginsListSize,
						site: siteName
					}
				} );
				break;
			case 'n sites 1 plugin':
				return this.translate( 'You are about to remove {{em}}%(plugin)s from %(numberOfSites)d sites{{/em}}.{{p}}This will deactivate the plugin and delete all associated files and data.{{/p}}', {
					components: {
						em: <em />,
						p: <p />
					},
					args: {
						plugin: pluginName,
						numberOfSites: siteListSize
					}
				} );
				break;
			case 'n sites n plugins':
				return this.translate( 'You are about to remove {{em}}%(numberOfPlugins)d plugins from %(numberOfSites)d sites{{/em}}.{{p}}This will deactivate the plugins and delete all associated files and data.{{/p}}', {
					components: {
						em: <em />,
						p: <p />
					},
					args: {
						numberOfPlugins: pluginsListSize,
						numberOfSites: siteListSize
					}
				} );
				break;
		}
	},

	removePluginDialog() {
		const message = (
			<div>
				<span>{ this.getConfirmationText() }</span>
				<span>{ this.translate( 'Do you want to continue?' ) }</span>
			</div>
		);

		acceptDialog(
			message,
			this.removeSelected,
			this.translate( 'Remove', { context: 'Verb. Presented to user as a label for a button.' } )
		);
	},

	removeSelected( accepted ) {
		if ( accepted ) {
			this.doActionOverSelected( 'removing', PluginsActions.removePlugin );
			this.recordEvent( 'Clicked Remove Plugin(s)', true );
		}
	},

	showDisconnectDialog() {
		if ( this.state.disconnectJetpackDialog && ! this.state.notices.inProgress.length ) {
			this.setState( { disconnectJetpackDialog: false } );
			this.refs.dialog.open();
		}
	},

	// Renders
	render() {
		const itemListClasses = classNames( 'list-cards-compact', 'plugins-list', {
			'is-bulk-editing': this.state.bulkManagementActive
		} );

		const selectedSiteSlug = this.props.sites.getSelectedSite() ? this.props.sites.getSelectedSite().slug : '';

		if ( this.props.isPlaceholder ) {
			return (
				<div className="plugins-list">
					<SectionHeader key="plugins-list__section-placeholder" label={ this.props.header } className="plugins-list__section-actions is-placeholder" />
					<div className={ itemListClasses }>{ this.renderPlaceholders() }</div>
				</div>
				)
		}

		if ( isEmpty( this.props.plugins ) ) {
			return null;
		}

		return (
			<div className="plugins-list" >
				<PluginsListHeader label={ this.props.header }
					isBulkManagementActive={ this.state.bulkManagementActive }
					selectedSiteSlug={ selectedSiteSlug }
					plugins={ this.props.plugins }
					selected={ this.getSelected() }
					toggleBulkManagement={ this.toggleBulkManagement }
					updateAllPlugins={ this.updateAllPlugins }
					updateSelected= { this.updateSelected }
					pluginUpdateCount={ this.props.pluginUpdateCount }
					activateSelected={ this.activateSelected }
					deactiveAndDisconnectSelected={ this.deactiveAndDisconnectSelected }
					deactivateSelected={ this.deactivateSelected }
					setAutoupdateSelected={ this.setAutoupdateSelected }
					unsetAutoupdateSelected={ this.unsetAutoupdateSelected }
					removePluginNotice={ this.removePluginDialog }
					setSelectionState={ this.setBulkSelectionState }
					haveActiveSelected={ this.props.plugins.some( this.filterSelection.active.bind( this ) ) }
					haveInactiveSelected={ this.props.plugins.some( this.filterSelection.inactive.bind( this ) ) }
					haveUpdatesSelected= { this.props.plugins.some( this.filterSelection.updates.bind( this ) ) } />
				<div className={ itemListClasses }>{ this.props.plugins.map( this.renderPlugin ) }</div>
				<DisconnectJetpackDialog ref="dialog" site={ this.props.site } sites={ this.props.sites } redirect="/plugins" />
			</div>
		);
	},

	renderPlugin( plugin ) {
		const selectThisPlugin = this.togglePlugin.bind( this, plugin );
		return (
			<PluginItem
				key={ plugin.slug }
				hasAllNoManageSites={ this.hasNoSitesThatCanManage( plugin ) }
				plugin={ plugin }
				sites={ plugin.sites }
				progress={ this.state.notices.inProgress.filter( log => log.plugin.slug === plugin.slug ) }
				errors={ this.state.notices.errors.filter( log => log.plugin && log.plugin.slug === plugin.slug ) }
				notices={ this.state.notices }
				isSelected={ this.isSelected( plugin ) }
				isSelectable={ this.state.bulkManagementActive }
				onClick={ selectThisPlugin }
				selectedSite={ this.props.selectedSite }
				pluginLink={ '/plugins/' + encodeURIComponent( plugin.slug ) + this.siteSuffix() } />
		);
	},

	renderPlaceholders() {
		const placeholderCount = 16;
		return range( placeholderCount ).map( i => <PluginItem key={ 'placeholder-' + i } /> );
	}
} );
