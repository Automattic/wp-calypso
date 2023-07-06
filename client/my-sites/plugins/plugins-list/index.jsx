import { recordTracksEvent } from '@automattic/calypso-analytics';
import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { isEqual, reduce } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import acceptDialog from 'calypso/lib/accept';
import PluginsListHeader from 'calypso/my-sites/plugins/plugin-list-header';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { warningNotice } from 'calypso/state/notices/actions';
import {
	activatePlugin,
	deactivatePlugin,
	disableAutoupdatePlugin,
	enableAutoupdatePlugin,
	removePlugin,
	updatePlugin,
} from 'calypso/state/plugins/installed/actions';
import {
	getPluginsOnSites,
	getPluginStatusesByType,
} from 'calypso/state/plugins/installed/selectors';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import getSites from 'calypso/state/selectors/get-sites';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import PluginManagementV2 from '../plugin-management-v2';
import { getPluginActionDailogMessage, getSitePlugin, handleUpdatePlugins } from '../utils';

import './style.scss';

function checkPropsChange( nextProps, propArr ) {
	let i;
	let prop;

	for ( i = 0; i < propArr.length; i++ ) {
		prop = propArr[ i ];

		if ( ! isEqual( nextProps[ prop ], this.props[ prop ] ) ) {
			return true;
		}
	}
	return false;
}

export class PluginsList extends Component {
	static propTypes = {
		plugins: PropTypes.arrayOf(
			PropTypes.shape( {
				sites: PropTypes.object,
				slug: PropTypes.string,
				name: PropTypes.string,
			} )
		).isRequired,
		hasManagePlugins: PropTypes.bool,
		header: PropTypes.string.isRequired,
		isPlaceholder: PropTypes.bool.isRequired,
		selectedSite: PropTypes.object,
		selectedSiteSlug: PropTypes.string,
		siteIsAtomic: PropTypes.bool,
		siteIsJetpack: PropTypes.bool,
	};

	static defaultProps = {
		recordGoogleEvent: () => {},
	};

	shouldComponentUpdate( nextProps, nextState ) {
		const propsToCheck = [ 'plugins', 'sites', 'selectedSite' ];
		if ( checkPropsChange.call( this, nextProps, propsToCheck ) ) {
			return true;
		}

		if ( this.props.isPlaceholder !== nextProps.isPlaceholder ) {
			return true;
		}

		if ( this.props.searchTerm !== nextProps.searchTerm ) {
			return true;
		}

		if ( this.props.filter !== nextProps.filter ) {
			return true;
		}

		if ( this.state.bulkManagementActive !== nextState.bulkManagementActive ) {
			return true;
		}

		if ( this.state.disconnectJetpackNotice !== nextState.disconnectJetpackNotice ) {
			return true;
		}

		if ( this.state.removeJetpackNotice !== nextState.removeJetpackNotice ) {
			return true;
		}

		if ( ! isEqual( this.state.selectedPlugins, nextState.selectedPlugins ) ) {
			return true;
		}

		if ( ! isEqual( this.props.inProgressStatuses, nextProps.inProgressStatuses ) ) {
			return true;
		}

		return false;
	}

	componentDidUpdate() {
		this.maybeShowDisconnectNotice();
		this.maybeShowRemoveNotice();
	}

	state = {
		disconnectJetpackNotice: false,
		removeJetpackNotice: false,
		bulkManagementActive: false,
		selectedPlugins: {},
	};

	isSelected = ( { slug } ) => {
		return !! this.state.selectedPlugins[ slug ];
	};

	togglePlugin = ( plugin ) => {
		const { slug } = plugin;
		const { selectedPlugins } = this.state;
		const oldValue = selectedPlugins[ slug ];
		const eventAction =
			'Clicked to ' + this.isSelected( plugin ) ? 'Deselect' : 'Select' + 'Single Plugin';
		this.setState( {
			selectedPlugins: Object.assign( {}, selectedPlugins, { [ slug ]: ! oldValue } ),
		} );
		this.props.recordGoogleEvent( 'Plugins', eventAction, 'Plugin Name', slug );
	};

	canBulkSelect( plugin ) {
		const { autoupdate: canAutoupdate, activation: canActivate } =
			this.getAllowedPluginActions( plugin );
		return canAutoupdate || canActivate;
	}

	setBulkSelectionState = ( plugins, selectionState ) => {
		const slugsToBeUpdated = reduce(
			plugins,
			( slugs, plugin ) => {
				slugs[ plugin.slug ] = this.canBulkSelect( plugin ) && selectionState;
				return slugs;
			},
			{}
		);

		this.setState( {
			selectedPlugins: Object.assign( {}, this.state.selectedPlugins, slugsToBeUpdated ),
		} );
	};

	filterSelection = {
		active( plugin ) {
			if ( this.isSelected( plugin ) ) {
				return Object.keys( plugin.sites ).some( ( siteId ) => {
					const sitePlugin = getSitePlugin( plugin, siteId, this.props.pluginsOnSites );
					return sitePlugin?.active;
				} );
			}
			return false;
		},
		inactive( plugin ) {
			if ( this.isSelected( plugin ) && plugin.slug !== 'jetpack' ) {
				return Object.keys( plugin.sites ).some( ( siteId ) => {
					const sitePlugin = getSitePlugin( plugin, siteId, this.props.pluginsOnSites );
					return ! sitePlugin?.active;
				} );
			}
			return false;
		},
		updates( plugin ) {
			if ( this.isSelected( plugin ) ) {
				return Object.keys( plugin.sites ).some( ( siteId ) => {
					const sitePlugin = getSitePlugin( plugin, siteId, this.props.pluginsOnSites );
					const site = this.props.allSites.find( ( s ) => s.ID === parseInt( siteId ) );
					return sitePlugin?.update?.new_version && site.canUpdateFiles;
				} );
			}
			return false;
		},
		selected( plugin ) {
			return this.isSelected( plugin );
		},
	};

	getSelected() {
		return this.props.plugins.filter( this.filterSelection.selected.bind( this ) );
	}

	siteSuffix() {
		return this.props.selectedSiteSlug ? '/' + this.props.selectedSiteSlug : '';
	}

	recordEvent( eventAction, includeSelectedPlugins ) {
		eventAction += this.props.selectedSite ? '' : ' on Multisite';
		if ( includeSelectedPlugins ) {
			const pluginSlugs = this.getSelected().map( ( plugin ) => plugin.slug );
			this.props.recordGoogleEvent( 'Plugins', eventAction, 'Plugins', pluginSlugs );
		} else {
			this.props.recordGoogleEvent( 'Plugins', eventAction );
		}
	}

	// Actions
	toggleBulkManagement = () => {
		const activateBulkManagement = ! this.state.bulkManagementActive;

		if ( activateBulkManagement ) {
			this.setBulkSelectionState( this.props.plugins, true );
			this.setState( { bulkManagementActive: true } );
			this.recordEvent( 'Clicked Manage' );
		} else {
			this.setState( { bulkManagementActive: false } );
			this.removePluginStatuses();
			this.recordEvent( 'Clicked Manage Done' );
		}
	};

	removePluginStatuses() {
		this.props.removePluginStatuses( 'completed', 'error', 'up-to-date' );
	}

	doActionOverSelected( actionName, action, selectedPlugins ) {
		if ( ! selectedPlugins ) {
			selectedPlugins = this.props.plugins.filter( this.isSelected );
		}
		const isDeactivatingOrRemovingAndJetpackSelected = ( { slug } ) =>
			[ 'deactivating', 'activating', 'removing' ].includes( actionName ) && 'jetpack' === slug;

		const flattenArrays = ( full, partial ) => [ ...full, ...partial ];
		this.removePluginStatuses();
		const pluginAndSiteObjects = selectedPlugins
			.filter( ( plugin ) => ! isDeactivatingOrRemovingAndJetpackSelected( plugin ) ) // ignore sites that are deactivating, activating or removing jetpack
			.map( ( p ) => {
				return Object.keys( p.sites ).map( ( siteId ) => {
					const site = this.props.allSites.find( ( s ) => s.ID === parseInt( siteId ) );
					return {
						site,
						plugin: p,
					};
				} );
			} ) // list of plugins -> list of plugin+site objects
			.reduce( flattenArrays, [] ); // flatten the list into one big list of plugin+site objects

		pluginAndSiteObjects.forEach( ( { plugin, site } ) => action( site.ID, plugin ) );

		const pluginSlugs = [
			...new Set( pluginAndSiteObjects.map( ( { plugin } ) => plugin.slug ) ),
		].join( ',' );

		const siteIds = [ ...new Set( pluginAndSiteObjects.map( ( { site } ) => site.ID ) ) ].join(
			','
		);

		recordTracksEvent( 'calypso_plugins_bulk_action_execute', {
			action: actionName,
			plugins: pluginSlugs,
			sites: siteIds,
		} );
	}

	pluginHasUpdate = ( plugin ) => {
		return Object.keys( plugin.sites ).some( ( siteId ) => {
			const sitePlugin = getSitePlugin( plugin, siteId, this.props.pluginsOnSites );
			const site = this.props.allSites.find( ( s ) => s.ID === parseInt( siteId ) );
			return sitePlugin?.update && site?.canUpdateFiles;
		} );
	};

	updateSelected = ( accepted ) => {
		if ( ! accepted ) {
			return;
		}

		this.recordEvent( 'Clicked Update Plugin(s)', true );
		this.doActionOverSelected( 'updating', this.props.updatePlugin );
	};

	updatePlugin = ( selectedPlugin ) => {
		this.recordEvent( 'Clicked Update Plugin(s)', true );

		handleUpdatePlugins( [ selectedPlugin ], this.props.updatePlugin, this.props.pluginsOnSites );
		this.removePluginStatuses();
	};

	activateSelected = ( accepted ) => {
		if ( ! accepted ) {
			return;
		}

		this.recordEvent( 'Clicked Activate Plugin(s)', true );
		this.doActionOverSelected( 'activating', this.props.activatePlugin );
	};

	deactivateSelected = ( accepted ) => {
		if ( ! accepted ) {
			return;
		}

		this.recordEvent( 'Clicked Deactivate Plugin(s)', true );
		this.doActionOverSelected( 'deactivating', this.props.deactivatePlugin );
	};

	deactiveAndDisconnectSelected = ( accepted ) => {
		if ( ! accepted ) {
			return;
		}

		this.recordEvent( 'Clicked Deactivate Plugin(s) and Disconnect Jetpack', true );

			let waitForDeactivate = false;

			this.doActionOverSelected( 'deactivating', ( site, plugin ) => {
				waitForDeactivate = true;
				this.props.deactivatePlugin( site, plugin );
			} );

			if ( waitForDeactivate && this.props.selectedSite ) {
				this.setState( { disconnectJetpackNotice: true } );
			}
	};

	setAutoupdateSelected = ( accepted ) => {
		if ( ! accepted ) {
			return;
		}

		this.recordEvent( 'Clicked Enable Autoupdate Plugin(s)', true );
		this.doActionOverSelected( 'enablingAutoupdates', this.props.enableAutoupdatePlugin );
	};

	unsetAutoupdateSelected = ( accepted ) => {
		if ( ! accepted ) {
			return;
		}

		this.recordEvent( 'Clicked Disable Autoupdate Plugin(s)', true );
		this.doActionOverSelected( 'disablingAutoupdates', this.props.disableAutoupdatePlugin );
	};

	bulkActionDialog = ( actionName, selectedPlugin ) => {
		const { plugins, translate, allSites } = this.props;
		const selectedPlugins = selectedPlugin ? [ selectedPlugin ] : plugins.filter( this.isSelected );
		const pluginsCount = selectedPlugins.length;

		const isJetpackIncluded = selectedPlugins.some( ( { slug } ) => slug === 'jetpack' );

		const dialogOptions = {
			additionalClassNames: 'plugins__confirmation-modal',
			...( actionName === 'remove' && { isScary: true } ),
		};

		let pluginName;
		const hasOnePlugin = pluginsCount === 1;

		if ( hasOnePlugin ) {
			const [ { name, slug } ] = selectedPlugins;
			pluginName = name || slug;
		}

		switch ( actionName ) {
			case 'activate': {
				const heading = hasOnePlugin
					? translate( 'Activate %(pluginName)s', { args: { pluginName } } )
					: translate( 'Activate %(pluginsCount)d plugins', { args: { pluginsCount } } );
				acceptDialog(
					getPluginActionDailogMessage( allSites, selectedPlugins, heading, 'activate' ),
					( accepted ) => this.activateSelected( accepted ),
					heading,
					null,
					dialogOptions
				);
				break;
			}
			case 'deactivate': {
				const heading = hasOnePlugin
					? translate( 'Deactivate %(pluginName)s', { args: { pluginName } } )
					: translate( 'Deactivate %(pluginsCount)d plugins', { args: { pluginsCount } } );
				acceptDialog(
					getPluginActionDailogMessage( allSites, selectedPlugins, heading, 'deactivate' ),
					isJetpackIncluded
						? ( accepted ) => this.deactiveAndDisconnectSelected( accepted )
						: ( accepted ) => this.deactivateSelected( accepted ),
					heading,
					null,
					dialogOptions
				);
				break;
			}
			case 'enableAutoupdates': {
				const heading = hasOnePlugin
					? translate( 'Enable autoupdate for %(pluginName)s', { args: { pluginName } } )
					: translate( 'Enable autoupdates for %(pluginsCount)d plugins', {
							args: { pluginsCount },
					  } );
				acceptDialog(
					getPluginActionDailogMessage(
						allSites,
						selectedPlugins,
						heading,
						'enable autoupdates for'
					),
					( accepted ) => this.setAutoupdateSelected( accepted ),
					heading,
					null,
					dialogOptions
				);
				break;
			}
			case 'disableAutoupdates': {
				const heading = hasOnePlugin
					? translate( 'Disable autoupdate for %(pluginName)s', { args: { pluginName } } )
					: translate( 'Disable autoupdates for %(pluginsCount)d plugins', {
							args: { pluginsCount },
					  } );
				acceptDialog(
					getPluginActionDailogMessage(
						allSites,
						selectedPlugins,
						heading,
						'disable autoupdates for'
					),
					( accepted ) => this.unsetAutoupdateSelected( accepted ),
					heading,
					null,
					dialogOptions
				);
				break;
			}
			case 'update': {
				const heading = hasOnePlugin
					? translate( 'Update %(pluginName)s', { args: { pluginName } } )
					: translate( 'Update %(pluginsCount)d plugins', {
							args: { pluginsCount },
					  } );
				acceptDialog(
					getPluginActionDailogMessage( allSites, selectedPlugins, heading, 'update' ),
					( accepted ) => this.updateSelected( accepted ),
					heading,
					null,
					dialogOptions
				);
				break;
			}
			case 'remove': {
				const heading = hasOnePlugin
					? translate( 'Remove %(pluginName)s', { args: { pluginName } } )
					: translate( 'Remove %(pluginsCount)d plugins', {
							args: { pluginsCount },
					  } );
				acceptDialog(
					getPluginActionDailogMessage(
						allSites,
						selectedPlugins,
						heading,
						'deactivate and delete'
					),
					isJetpackIncluded
						? ( accepted ) => this.removeSelectedWithJetpack( accepted, selectedPlugins )
						: ( accepted ) => this.removeSelected( accepted, selectedPlugins ),
					heading,
					null,
					dialogOptions
				);
				break;
			}
		}
	};

	removePluginDialog = ( selectedPlugin ) => {
		this.bulkActionDialog( 'remove', selectedPlugin );
	};

	removeSelected = ( accepted, selectedPlugins ) => {
		if ( ! accepted ) {
			return;
		}

		this.recordEvent( 'Clicked Remove Plugin(s)', true );
		this.doActionOverSelected( 'removing', this.props.removePlugin, selectedPlugins );
	};

	removeSelectedWithJetpack = ( accepted, selectedPlugins ) => {
		if ( ! accepted ) {
			return;
		}

		this.recordEvent( 'Clicked Remove Plugin(s) and Remove Jetpack', true );

			if ( selectedPlugins.length === 1 ) {
				this.setState( { removeJetpackNotice: true } );
			return;
		}

				let waitForRemove = false;
				this.doActionOverSelected( 'removing', ( site, plugin ) => {
					waitForRemove = true;
					this.props.removePlugin( site, plugin );
				} );

				if ( waitForRemove && this.props.selectedSite ) {
					this.setState( { removeJetpackNotice: true } );
		}
	};

	maybeShowDisconnectNotice() {
		if ( ! this.state.disconnectJetpackNotice ) {
			return;
		}

		if ( this.props.inProgressStatuses.length > 0 ) {
			return;
		}

			this.setState( {
				disconnectJetpackNotice: false,
			} );

		const { translate } = this.props;
			this.props.warningNotice(
				translate(
					'Jetpack cannot be deactivated from WordPress.com. {{link}}Manage connection{{/link}}',
					{
						components: {
							link: <a href={ '/settings/manage-connection/' + this.props.selectedSiteSlug } />,
						},
					}
				)
			);
		}

	maybeShowRemoveNotice() {
		if ( ! this.state.removeJetpackNotice ) {
			return;
		}

		if ( this.props.inProgressStatuses.length > 0 ) {
			return;
		}

			this.setState( {
				removeJetpackNotice: false,
			} );

		const { translate } = this.props;
			this.props.warningNotice( translate( 'Jetpack must be removed via wp-admin.' ) );
		}

	getPluginsSites() {
		const { plugins } = this.props;
		return plugins.reduce( ( sites, plugin ) => {
			Object.keys( plugin.sites ).map( ( pluginSiteId ) => {
				if ( ! sites.find( ( site ) => site.ID === pluginSiteId ) ) {
					const pluginSite = this.props.allSites.find( ( s ) => s.ID === parseInt( pluginSiteId ) );
					sites.push( pluginSite );
				}
			} );

			return sites;
		}, [] );
	}

	render() {
		const selectedSiteSlug = this.props.selectedSiteSlug ? this.props.selectedSiteSlug : '';

		return (
			<div className="plugins-list">
				<QueryProductsList />
				<PluginsListHeader
					label={ this.props.header }
					isBulkManagementActive={ this.state.bulkManagementActive }
					selectedSiteSlug={ selectedSiteSlug }
					plugins={ this.props.plugins }
					selected={ this.getSelected() }
					toggleBulkManagement={ this.toggleBulkManagement }
					updateSelected={ this.updateSelected }
					deactiveAndDisconnectSelected={ this.deactiveAndDisconnectSelected }
					setAutoupdateSelected={ this.setAutoupdateSelected }
					unsetAutoupdateSelected={ this.unsetAutoupdateSelected }
					removePluginNotice={ () => this.removePluginDialog() }
					setSelectionState={ this.setBulkSelectionState }
					activatePluginNotice={ () => this.bulkActionDialog( 'activate' ) }
					deactivatePluginNotice={ () => this.bulkActionDialog( 'deactivate' ) }
					autoupdateEnablePluginNotice={ () => this.bulkActionDialog( 'enableAutoupdates' ) }
					autoupdateDisablePluginNotice={ () => this.bulkActionDialog( 'disableAutoupdates' ) }
					updatePluginNotice={ () => this.bulkActionDialog( 'update' ) }
					isJetpackCloud={ this.props.isJetpackCloud }
				/>
				<PluginManagementV2
					plugins={ this.getPlugins() }
					isLoading={ this.props.isLoading }
					selectedSite={ this.props.selectedSite }
					searchTerm={ this.props.searchTerm }
					filter={ this.props.filter }
					isBulkManagementActive={ this.state.bulkManagementActive }
					toggleBulkManagement={ this.toggleBulkManagement }
					removePluginNotice={ this.removePluginDialog }
					updatePlugin={ this.updatePlugin }
					isJetpackCloud={ this.props.isJetpackCloud }
					requestError={ this.props.requestPluginsError }
				/>
			</div>
		);
	}

	getPlugins() {
		const plugins = this.props.plugins.map( ( plugin ) => {
			const selectThisPlugin = this.togglePlugin.bind( this, plugin );
			const allowedPluginActions = this.getAllowedPluginActions( plugin );
			const isSelectable =
				this.state.bulkManagementActive &&
				( allowedPluginActions.autoupdate || allowedPluginActions.activation );

			return {
				...plugin,
				...{ onClick: selectThisPlugin, isSelected: this.isSelected( plugin ), isSelectable },
			};
		} );

		// Plugins which require an update sort first, otherwise the original order is kept.
		plugins.sort( ( a, b ) => {
			const updateA = !! a.update;
			const updateB = !! b.update;
			return Number( updateB ) - Number( updateA );
		} );

		return plugins;
	}

	getAllowedPluginActions( plugin ) {
		const { hasManagePlugins, siteIsAtomic, siteIsJetpack, selectedSite } = this.props;
		const autoManagedPlugins = [ 'jetpack', 'vaultpress', 'akismet' ];
		const isManagedPlugin = siteIsAtomic && autoManagedPlugins.includes( plugin.slug );
		const canManagePlugins =
			! selectedSite || ( siteIsJetpack && ! siteIsAtomic ) || ( siteIsAtomic && hasManagePlugins );

		return {
			autoupdate: ! isManagedPlugin && canManagePlugins,
			activation: ! isManagedPlugin && canManagePlugins,
		};
	}
}

export default connect(
	( state, { plugins } ) => {
		const selectedSite = getSelectedSite( state );
		return {
			allSites: getSites( state ),
			pluginsOnSites: getPluginsOnSites( state, plugins ),
			selectedSite,
			selectedSiteSlug: getSelectedSiteSlug( state ),
			hasManagePlugins: siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_MANAGE_PLUGINS ),
			inProgressStatuses: getPluginStatusesByType( state, 'inProgress' ),
			siteIsAtomic: isSiteAutomatedTransfer( state, selectedSite?.ID ),
			siteIsJetpack: isJetpackSite( state, selectedSite?.ID ),
		};
	},
	{
		activatePlugin,
		deactivatePlugin,
		disableAutoupdatePlugin,
		enableAutoupdatePlugin,
		recordGoogleEvent,
		removePlugin,
		removePluginStatuses,
		updatePlugin,
		warningNotice,
	}
)( localize( PluginsList ) );
