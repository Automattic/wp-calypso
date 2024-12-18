import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { localize, translate } from 'i18n-calypso';
import { isEqual, reduce } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
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
import { PluginActions } from '../hooks/types';
import { withShowPluginActionDialog } from '../hooks/use-show-plugin-action-dialog';
import { PluginsListHeader } from '../plugin-list-header';
import PluginManagementV2 from '../plugin-management-v2';
import { handleUpdatePlugins } from '../utils';
import PluginsListDataViews from './plugins-list-dataviews';

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
		onSearch: PropTypes.func,
	};

	static defaultProps = {
		recordGoogleEvent: () => {},
	};

	componentWillMount() {
		if ( this.props.newBulkPluginManagement ) {
			import( './style.scss' );
		} else {
			import( './style-compatibilty.scss' );
		}
	}

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

	getSelected() {
		return this.props.plugins.filter( this.isSelected.bind( this ) );
	}

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

	recordEvent( eventAction, includeSelectedPlugins ) {
		eventAction += this.props.selectedSite ? '' : ' on Multisite';
		if ( includeSelectedPlugins ) {
			const pluginSlugs = this.props.newBulkPluginManagement
				? this.state.selectedPlugins.map( ( plugin ) => plugin.slug )
				: this.getSelected().map( ( plugin ) => plugin.slug );

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
		if ( ! selectedPlugins && ! this.props.newBulkPluginManagement ) {
			selectedPlugins = this.props.plugins.filter( this.isSelected );
		}

		const isDeactivatingOrRemovingAndJetpackSelected = ( { slug } ) =>
			[ 'deactivating', 'activating', 'removing' ].includes( actionName ) && 'jetpack' === slug;

		this.removePluginStatuses();

		const pluginAndSiteObjects = (
			this.props.newBulkPluginManagement ? this.state.selectedPlugins : selectedPlugins
		)
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
			.flat(); // flatten the list into one big list of plugin+site objects

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

	bulkActionDialog = ( actionName, selectedPlugins ) => {
		const { plugins, allSites, showPluginActionDialog } = this.props;

		if ( ! this.props.newBulkPluginManagement ) {
			selectedPlugins = selectedPlugins ? [ selectedPlugins ] : plugins.filter( this.isSelected );
		}

		const isJetpackIncluded = selectedPlugins.some( ( { slug } ) => slug === 'jetpack' );

		const ALL_ACTION_CALLBACKS = {
			[ PluginActions.ACTIVATE ]: this.activateSelected,
			[ PluginActions.DEACTIVATE ]: isJetpackIncluded
				? this.deactivateAndDisconnectSelected
				: this.deactivateSelected,
			[ PluginActions.REMOVE ]: isJetpackIncluded
				? ( accepted ) => this.removeSelectedWithJetpack( accepted, selectedPlugins )
				: ( accepted ) => this.removeSelected( accepted, selectedPlugins ),
			[ PluginActions.UPDATE ]: this.updateSelected,
			[ PluginActions.ENABLE_AUTOUPDATES ]: this.setAutoupdateSelected,
			[ PluginActions.DISABLE_AUTOUPDATES ]: this.unsetAutoupdateSelected,
		};

		if ( actionName === PluginActions.UPDATE ) {
			//filter out sites that don't have an update available
			selectedPlugins = selectedPlugins.map( ( plugin ) => {
				const filteredSites = Object.fromEntries(
					Object.entries( plugin.sites ).filter( ( [ , site ] ) => site.update?.new_version )
				);
				return { ...plugin, sites: filteredSites };
			} );
		}

		if ( this.props.newBulkPluginManagement ) {
			this.setState( {
				selectedPlugins,
			} );
		}

		const selectedActionCallback = ALL_ACTION_CALLBACKS[ actionName ];
		showPluginActionDialog( actionName, selectedPlugins, allSites, selectedActionCallback );
	};

	removePluginDialog = ( selectedPlugin ) => {
		this.bulkActionDialog( PluginActions.REMOVE, selectedPlugin );
	};

	/** BEGIN BULK ACTION DIALOG CALLBACKS */

	activateSelected = ( accepted ) => {
		if ( ! accepted ) {
			return;
		}

		this.recordEvent( 'Clicked Activate Plugin(s)', true );
		this.doActionOverSelected( 'activating', this.props.activatePlugin );
	};

	deactivateAndDisconnectSelected = ( accepted ) => {
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

	deactivateSelected = ( accepted ) => {
		if ( ! accepted ) {
			return;
		}

		this.recordEvent( 'Clicked Deactivate Plugin(s)', true );
		this.doActionOverSelected( 'deactivating', this.props.deactivatePlugin );
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

	removeSelected = ( accepted, selectedPlugins ) => {
		if ( ! accepted ) {
			return;
		}

		this.recordEvent( 'Clicked Remove Plugin(s)', true );
		this.doActionOverSelected( 'removing', this.props.removePlugin, selectedPlugins );
	};

	updateSelected = ( accepted ) => {
		if ( ! accepted ) {
			return;
		}

		this.recordEvent( 'Clicked Update Plugin(s)', true );
		this.doActionOverSelected( 'updating', this.props.updatePlugin );
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

	/** END BULK ACTION DIALOG CALLBACKS */

	updatePlugin = ( selectedPlugin ) => {
		this.recordEvent( 'Clicked Update Plugin(s)', true );

		handleUpdatePlugins( [ selectedPlugin ], this.props.updatePlugin, this.props.pluginsOnSites );
		this.removePluginStatuses();
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

		this.props.warningNotice( translate( 'Jetpack must be removed via wp-admin.' ) );
	}

	render() {
		if ( this.props.newBulkPluginManagement ) {
			return (
				<PluginsListDataViews
					currentPlugins={ this.props.plugins }
					initialSearch={ this.props.searchTerm }
					isLoading={ this.props.isLoading }
					onSearch={ this.props.onSearch }
					bulkActionDialog={ this.bulkActionDialog }
				/>
			);
		}

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
					deactiveAndDisconnectSelected={ this.deactivateAndDisconnectSelected }
					setAutoupdateSelected={ this.setAutoupdateSelected }
					unsetAutoupdateSelected={ this.unsetAutoupdateSelected }
					removePluginNotice={ () => this.removePluginDialog() }
					setSelectionState={ this.setBulkSelectionState }
					activatePluginNotice={ () => this.bulkActionDialog( PluginActions.ACTIVATE ) }
					deactivatePluginNotice={ () => this.bulkActionDialog( PluginActions.DEACTIVATE ) }
					autoupdateEnablePluginNotice={ () =>
						this.bulkActionDialog( PluginActions.ENABLE_AUTOUPDATES )
					}
					autoupdateDisablePluginNotice={ () =>
						this.bulkActionDialog( PluginActions.DISABLE_AUTOUPDATES )
					}
					updatePluginNotice={ () => this.bulkActionDialog( PluginActions.UPDATE ) }
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
		const newBulkPluginManagement = config.isEnabled( 'bulk-plugin-management' );

		return {
			allSites: getSites( state ),
			// This is critical and destroys the performance of the page
			// TODO: Remove when launched
			pluginsOnSites: newBulkPluginManagement ? [] : getPluginsOnSites( state, plugins ),
			selectedSite,
			newBulkPluginManagement,
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
)( withShowPluginActionDialog( localize( PluginsList ) ) );
