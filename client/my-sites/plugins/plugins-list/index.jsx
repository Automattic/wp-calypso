/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import isEmpty from 'lodash/lang/isEmpty';
import some from 'lodash/collection/some';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import acceptDialog from 'lib/accept';
import DisconnectJetpackDialog from 'my-sites/plugins/disconnect-jetpack/disconnect-jetpack-dialog';
import PluginItem from 'my-sites/plugins/plugin-item/plugin-item';
import PluginsActions from 'lib/plugins/actions';
import PluginsListHeader from 'my-sites/plugins/plugin-list-header';
import PluginsLog from 'lib/plugins/log-store';
import SectionHeader from 'components/section-header';

export default React.createClass( {
	displayName: 'PluginsList',

	propTypes: {
		plugins: PropTypes.array,
		header: PropTypes.string,
		isWpCom: PropTypes.bool,
		notices: PropTypes.object,
		sites: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
		pluginUpdateCount: PropTypes.number,
		isPlaceholder: PropTypes.bool,
	},

	getInitialState() {
		return {
			disconnectJetpackDialog: false,
			bulkManagement: false,
			selectedPlugins: {}
		};
	},

	componentDidMount() {
		PluginsLog.on( 'change', this.showDisconnectDialog );
	},

	componentWillUnmount() {
		PluginsLog.removeListener( 'change', this.showDisconnectDialog );
	},

	isSelected( plugin ) {
		return !! this.state.selectedPlugins[ plugin.slug ];
	},

	togglePlugin( plugin ) {
		let selectedPlugins = Object.assign( {}, this.state.selectedPlugins );
		selectedPlugins[ plugin.slug ] = ! this.state.selectedPlugins[ plugin.slug ];
		this.setState( { selectedPlugins } );
		analytics.ga.recordEvent( 'Plugins', 'Clicked to ' + this.isSelected( plugin ) ? 'Deselect' : 'Select' + 'Single Plugin', 'Plugin Name', plugin.slug );
	},

	setBulkSelectionState( plugins, selectionState ) {
		let slugsToBeUpdated = {};
		plugins.forEach( plugin => slugsToBeUpdated[ plugin.slug] = selectionState );

		let selectedPlugins = Object.assign( {}, this.state.selectedPlugins, slugsToBeUpdated );

		this.setState( { selectedPlugins } );
	},

	getPluginBySlug( slug ) {
		for ( let i = 0, l = this.props.plugins.lenght; i < l; i++ ) {
			if ( this.props.plugins[ i ].slug === slug ) {
				return this.props.plugins[ i ];
			}
		}
		return false;
	},

	filterSelection: {
		active( plugin ) {
			if ( this.isSelected( plugin ) ) {
				return some( plugin.sites, site => site.plugin && site.plugin.active );
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
				return plugin.sites.some( site => site.plugin && site.plugin.update && site.canUpdateFiles );
			}
			return false;
		},
		selected( plugin ) {
			return this.isSelected( plugin );
		}
	},

	getPluginUpdateCount() {
		if ( this.props.isWpCom ) {
			return 0;
		}
		return this.props.pluginUpdateCount;
	},

	getSelected() {
		if ( ! this.props.plugins ) {
			return [];
		}
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
		const bulkManagement = ! this.state.bulkManagement;

		this.setState( {
			bulkManagement
		} );

		if ( bulkManagement ) {
			this.recordEvent( 'Clicked Manage' );
		} else {
			//PluginsActions.selectPlugins( this.props.sites, 'none' );
			if ( this.props.notices && ( this.props.notices.completed || this.props.notices.errors ) ) {
				PluginsActions.removePluginsNotices( this.props.notices.completed.concat( this.props.notices.errors ) );
			}
			this.recordEvent( 'Clicked Manage Done' );
		}
	},

	doActionOverSelected( actionName, action ) {
		PluginsActions.removePluginsNotices( this.props.notices.completed.concat( this.props.notices.errors ) );
		this.props.plugins.forEach( plugin => {
			if ( this.isSelected( plugin ) ) {
				// Ignore the user trying to deactive Jetpack.
				// Dialog to confirm the disconnection will be handled after.
				if ( 'deactivating' === actionName && plugin.slug === 'jetpack' ) {
					return;
				}
				plugin.sites.forEach( site => action( site, site.plugin ) );
			}
		}, this );
	},

	updateAllPlugins() {
		PluginsActions.removePluginsNotices( this.props.notices.completed.concat( this.props.notices.errors ) );
		this.props.plugins.forEach( plugin => {
			plugin.sites.forEach( site => PluginsActions.updatePlugin( site, site.plugin ) );
		} );
		this.recordEvent( 'Clicked Update all Plugins', true );
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
		var waitForDeactivate = false;

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
			.filter( plugin => this.isSelected( plugin ) )
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

	removePluginNotice() {
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
		if ( this.state.disconnectJetpackDialog && ! this.props.notices.inProgress.length ) {
			this.setState( { disconnectJetpackDialog: false } );
			this.refs.dialog.open();
		}
	},

	// Renders
	render() {
		const itemListClasses = classNames( 'list-cards-compact', 'plugins-list', {
			'is-bulk-editing': this.state.bulkManagement
		} );

		if ( this.props.isPlaceholder ) {
			return (
				<span>
					<SectionHeader key="plugins-list__section-placeholder" label={ this.props.header } className="plugins-list__section-actions is-placeholder" />
					<div className={ itemListClasses }>{ this.renderPlaceholders() }</div>
				</span>
				)
		}

		if ( isEmpty( this.props.plugins ) ) {
			return null;
		}

		return (
			<span>
				<PluginsListHeader label={ this.props.header }
					isWpCom={ this.props.isWpCom }
					isBulkManagementActive={ !! this.state.bulkManagement }
					sites={ this.props.sites }
					plugins={ this.props.plugins }
					selected={ this.getSelected() }
					toggleBulkManagement={ this.toggleBulkManagement }
					updateAllPlugins={ this.updateAllPlugins }
					pluginUpdateCount={ this.getPluginUpdateCount() }
					activateSelected={ this.activateSelected }
					deactiveAndDisconnectSelected={ this.deactiveAndDisconnectSelected }
					deactivateSelected={ this.deactivateSelected }
					setAutoupdateSelected={ this.setAutoupdateSelected }
					unsetAutoupdateSelected={ this.unsetAutoupdateSelected }
					removePluginNotice={ this.removePluginNotice }
					setSelectionState={ this.setBulkSelectionState }
					haveActiveSelected={ this.props.plugins.some( this.filterSelection.active.bind( this ) ) }
					haveInactiveSelected={ this.props.plugins.some( this.filterSelection.inactive.bind( this ) ) } />
				<div className={ itemListClasses }>{ this.renderPlugins() }</div>
				{ this.props.isWpCom
					? null
					: <DisconnectJetpackDialog ref="dialog" site={ this.props.site } sites={ this.props.sites } redirect="/plugins" />
				}
			</span>
		);
	},

	renderPlugins() {
		return this.props.plugins.map( plugin => {
			const selectThisPlugin = this.togglePlugin.bind( this, plugin );
			return (
				<PluginItem
					key={ plugin.slug }
					hasAllNoManageSites={ false }
					plugin={ plugin }
					sites={ plugin.sites }
					progress={ false }
					isSelected={ this.isSelected( plugin ) }
					isSelectable={ this.state.bulkManagement }
					onClick={ selectThisPlugin }
					selectedSite={ this.props.selectedSite }
					pluginLink={ '/plugins/' + encodeURIComponent( plugin.slug ) + ( plugin.wpcom ? '/business' : '' ) + this.siteSuffix() } />
			);
		} );
	},

	renderPlaceholders() {
		const placeholderCount = this.props.isWpCom ? 3 : 16;
		return [ ... Array( placeholderCount ).keys() ].map( i => <PluginItem key={ 'placeholder-' + i } /> );
	}
} );

