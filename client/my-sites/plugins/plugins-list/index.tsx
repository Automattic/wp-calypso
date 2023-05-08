import { recordTracksEvent } from '@automattic/calypso-analytics';
import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { localize, translate } from 'i18n-calypso';
import { isEqual, reduce } from 'lodash';
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
} from 'calypso/state/plugins/installed/selectors-ts';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import getSites from 'calypso/state/selectors/get-sites';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import PluginManagementV2 from '../plugin-management-v2';
import { getPluginActionDailogMessage, getSitePlugin, handleUpdatePlugins } from '../utils';
import type { SiteDetails } from '@automattic/data-stores';
import type { Plugin, PluginFilter, PluginStatus } from 'calypso/state/plugins/installed/types';

import './style.scss';

interface Props {
	hasManagePlugins?: boolean;
	header: string;
	inProgressStatuses: PluginStatus[];
	isPlaceholder: boolean;
	plugins: Plugin[];
	selectedSite?: SiteDetails;
	selectedSiteSlug?: string;
	siteIsAtomic?: boolean;
	siteIsJetpack?: boolean;
	searchTerm: string;
	recordGoogleEvent: typeof recordGoogleEvent;
	allSites: ReturnType< typeof getSites >;
	pluginsOnSites: ReturnType< typeof getPluginsOnSites >;
	removePluginStatuses: typeof removePluginStatuses;
	translate: typeof translate;
	removePlugin: typeof removePlugin;
	updatePlugin: typeof updatePlugin;
	activatePlugin: typeof activatePlugin;
	deactivatePlugin: typeof deactivatePlugin;
	enableAutoupdatePlugin: typeof enableAutoupdatePlugin;
	warningNotice: typeof warningNotice;
	disableAutoupdatePlugin: typeof disableAutoupdatePlugin;
	isJetpackCloud: boolean;
	isLoading: boolean;
	requestPluginsError: boolean;
	filter: PluginFilter;
}

interface State {
	disconnectJetpackNotice: boolean;
	removeJetpackNotice: boolean;
	bulkManagementActive: boolean;
	selectedPlugins: { [ pluginSlug: string ]: boolean };
}

type Action =
	| 'updating'
	| 'activating'
	| 'deactivating'
	| 'enablingAutoupdates'
	| 'disablingAutoupdates'
	| 'removing';

type BulkAction =
	| 'activate'
	| 'deactivate'
	| 'enableAutoupdates'
	| 'disableAutoupdates'
	| 'update'
	| 'remove';

export class PluginsList extends Component< Props, State > {
	static defaultProps = {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		recordGoogleEvent: () => {},
	};

	checkPropsChange( nextProps: Props, propArr: ( keyof Props )[] ) {
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

	shouldComponentUpdate( nextProps: Props, nextState: State ) {
		const propsToCheck = [ 'plugins', 'sites', 'selectedSite' ] as ( keyof Props )[];
		if ( this.checkPropsChange( nextProps, propsToCheck ) ) {
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

	state: State = {
		disconnectJetpackNotice: false,
		removeJetpackNotice: false,
		bulkManagementActive: false,
		selectedPlugins: {},
	};

	isSelected = ( { slug }: { slug: string } ) => {
		return !! this.state.selectedPlugins[ slug ];
	};

	togglePlugin = ( plugin: Plugin ) => {
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

	canBulkSelect( plugin: Plugin ) {
		const { autoupdate: canAutoupdate, activation: canActivate } =
			this.getAllowedPluginActions( plugin );
		return canAutoupdate || canActivate;
	}

	setBulkSelectionState = ( plugins: Plugin[], selectionState: boolean ) => {
		const slugsToBeUpdated = reduce(
			plugins,
			( slugs, plugin ) => {
				slugs[ plugin.slug ] = !! ( this.canBulkSelect( plugin ) && selectionState );
				return slugs;
			},
			{} as { [ pluginSlug: string ]: boolean }
		);

		this.setState( {
			selectedPlugins: Object.assign( {}, this.state.selectedPlugins, slugsToBeUpdated ),
		} );
	};

	filterSelection = {
		active: ( plugin: Plugin ) => {
			if ( this.isSelected( plugin ) ) {
				return Object.keys( plugin.sites ).some( ( siteId ) => {
					const sitePlugin = getSitePlugin( plugin, siteId, this.props.pluginsOnSites );
					return sitePlugin?.active;
				} );
			}
			return false;
		},
		inactive: ( plugin: Plugin ) => {
			if ( this.isSelected( plugin ) && plugin.slug !== 'jetpack' ) {
				return Object.keys( plugin.sites ).some( ( siteId ) => {
					const sitePlugin = getSitePlugin( plugin, siteId, this.props.pluginsOnSites );
					return ! sitePlugin?.active;
				} );
			}
			return false;
		},
		updates: ( plugin: Plugin ) => {
			if ( this.isSelected( plugin ) ) {
				return Object.keys( plugin.sites ).some( ( siteId ) => {
					const sitePlugin = getSitePlugin( plugin, siteId, this.props.pluginsOnSites );
					const site = this.props.allSites.find( ( s ) => s && s.ID === parseInt( siteId ) );
					return site && sitePlugin?.update?.new_version && site.canUpdateFiles;
				} );
			}
			return false;
		},
		selected: ( plugin: Plugin ) => {
			return this.isSelected( plugin );
		},
	};

	getSelected() {
		return this.props.plugins.filter( this.filterSelection.selected.bind( this ) );
	}

	siteSuffix() {
		return this.props.selectedSiteSlug ? '/' + this.props.selectedSiteSlug : '';
	}

	recordEvent( eventAction: string, includeSelectedPlugins = false ) {
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

	doActionOverSelected(
		actionName: Action,
		action: ( siteId: number, plugin: Plugin ) => void,
		selectedPlugins?: Plugin[]
	) {
		if ( ! selectedPlugins ) {
			selectedPlugins = this.props.plugins.filter( this.isSelected );
		}
		const isDeactivatingOrRemovingAndJetpackSelected = ( slug: string ) =>
			[ 'deactivating', 'activating', 'removing' ].includes( actionName ) && 'jetpack' === slug;

		const flattenArrays = ( full: any[], partial: any[] ) => [ ...full, ...partial ];
		this.removePluginStatuses();
		const pluginAndSiteObjects = selectedPlugins
			.filter( ( plugin: Plugin ) => ! isDeactivatingOrRemovingAndJetpackSelected( plugin.slug ) ) // ignore sites that are deactivating, activating or removing jetpack
			.map( ( p: Plugin ) => {
				return Object.keys( p.sites ).map( ( siteId ) => {
					const site = this.props.allSites.find( ( s ) => s && s.ID === parseInt( siteId ) );
					return {
						site,
						plugin: p,
					};
				} );
			} ) // list of plugins -> list of plugin+site objects
			.reduce( flattenArrays, [] ); // flatten the list into one big list of plugin+site objects

		pluginAndSiteObjects.forEach( ( { plugin, site }: { plugin: Plugin; site: SiteDetails } ) =>
			action( site.ID, plugin )
		);

		const pluginSlugs = [
			...new Set( pluginAndSiteObjects.map( ( { plugin }: { plugin: Plugin } ) => plugin.slug ) ),
		].join( ',' );

		const siteIds = [
			...new Set( pluginAndSiteObjects.map( ( { site }: { site: SiteDetails } ) => site.ID ) ),
		].join( ',' );

		recordTracksEvent( 'calypso_plugins_bulk_action_execute', {
			action: actionName,
			plugins: pluginSlugs,
			sites: siteIds,
		} );
	}

	pluginHasUpdate = ( plugin: Plugin ) => {
		return Object.keys( plugin.sites ).some( ( siteId ) => {
			const sitePlugin = getSitePlugin( plugin, siteId, this.props.pluginsOnSites );
			const site = this.props.allSites.find( ( s ) => s && s.ID === parseInt( siteId ) );
			return sitePlugin?.update && site?.canUpdateFiles;
		} );
	};

	updateSelected = ( accepted: boolean ) => {
		if ( accepted ) {
			this.doActionOverSelected( 'updating', this.props.updatePlugin );
			this.recordEvent( 'Clicked Update Plugin(s)', true );
		}
	};

	updatePlugin = ( selectedPlugin: Plugin ) => {
		handleUpdatePlugins( [ selectedPlugin ], this.props.updatePlugin, this.props.pluginsOnSites );
		this.removePluginStatuses();
		this.recordEvent( 'Clicked Update Plugin(s)', true );
	};

	activateSelected = ( accepted: boolean ) => {
		if ( accepted ) {
			this.doActionOverSelected( 'activating', this.props.activatePlugin );
			this.recordEvent( 'Clicked Activate Plugin(s)', true );
		}
	};

	deactivateSelected = ( accepted: boolean ) => {
		if ( accepted ) {
			this.doActionOverSelected( 'deactivating', this.props.deactivatePlugin );
			this.recordEvent( 'Clicked Deactivate Plugin(s)', true );
		}
	};

	deactiveAndDisconnectSelected = ( accepted: boolean ) => {
		if ( accepted ) {
			let waitForDeactivate = false;

			this.doActionOverSelected( 'deactivating', ( site, plugin ) => {
				waitForDeactivate = true;
				this.props.deactivatePlugin( site, plugin );
			} );

			if ( waitForDeactivate && this.props.selectedSite ) {
				this.setState( { disconnectJetpackNotice: true } );
			}

			this.recordEvent( 'Clicked Deactivate Plugin(s) and Disconnect Jetpack', true );
		}
	};

	setAutoupdateSelected = ( accepted: boolean ) => {
		if ( accepted ) {
			this.doActionOverSelected( 'enablingAutoupdates', this.props.enableAutoupdatePlugin );
			this.recordEvent( 'Clicked Enable Autoupdate Plugin(s)', true );
		}
	};

	unsetAutoupdateSelected = ( accepted: boolean ) => {
		if ( accepted ) {
			this.doActionOverSelected( 'disablingAutoupdates', this.props.disableAutoupdatePlugin );
			this.recordEvent( 'Clicked Disable Autoupdate Plugin(s)', true );
		}
	};

	bulkActionDialog = ( actionName: BulkAction, selectedPlugin?: Plugin ) => {
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
					( accepted: boolean ) => this.activateSelected( accepted ),
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
						? ( accepted: boolean ) => this.deactiveAndDisconnectSelected( accepted )
						: ( accepted: boolean ) => this.deactivateSelected( accepted ),
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
					( accepted: boolean ) => this.setAutoupdateSelected( accepted ),
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
					( accepted: boolean ) => this.unsetAutoupdateSelected( accepted ),
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
					( accepted: boolean ) => this.updateSelected( accepted ),
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
						? ( accepted: boolean ) => this.removeSelectedWithJetpack( accepted, selectedPlugins )
						: ( accepted: boolean ) => this.removeSelected( accepted, selectedPlugins ),
					heading,
					null,
					dialogOptions
				);
				break;
			}
		}
	};

	removePluginDialog = ( selectedPlugin?: Plugin ) => {
		this.bulkActionDialog( 'remove', selectedPlugin );
	};

	removeSelected = ( accepted: boolean, selectedPlugins: Plugin[] ) => {
		if ( accepted ) {
			this.doActionOverSelected( 'removing', this.props.removePlugin, selectedPlugins );
			this.recordEvent( 'Clicked Remove Plugin(s)', true );
		}
	};

	removeSelectedWithJetpack = ( accepted: boolean, selectedPlugins: Plugin[] ) => {
		if ( accepted ) {
			if ( selectedPlugins.length === 1 ) {
				this.setState( { removeJetpackNotice: true } );
				this.recordEvent( 'Clicked Remove Plugin(s) and Remove Jetpack', true );
			} else {
				let waitForRemove = false;
				this.doActionOverSelected( 'removing', ( site, plugin ) => {
					waitForRemove = true;
					this.props.removePlugin( site, plugin );
				} );

				if ( waitForRemove && this.props.selectedSite ) {
					this.setState( { removeJetpackNotice: true } );
					this.recordEvent( 'Clicked Remove Plugin(s) and Remove Jetpack', true );
				}
			}
		}
	};

	maybeShowDisconnectNotice() {
		const { translate } = this.props;

		if ( this.state.disconnectJetpackNotice && ! this.props.inProgressStatuses.length ) {
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
	}

	maybeShowRemoveNotice() {
		const { translate } = this.props;

		if ( this.state.removeJetpackNotice && ! this.props.inProgressStatuses.length ) {
			this.setState( {
				removeJetpackNotice: false,
			} );

			this.props.warningNotice( translate( 'Jetpack must be removed via wp-admin.' ) );
		}
	}

	getPluginsSites() {
		const { plugins } = this.props;
		return plugins.reduce( ( sites, plugin ) => {
			Object.keys( plugin.sites ).map( ( pluginSiteId ) => {
				if ( ! sites.find( ( site ) => site && site.ID === Number( pluginSiteId ) ) ) {
					const pluginSite = this.props.allSites.find(
						( s ) => s && s.ID === parseInt( pluginSiteId )
					);
					if ( pluginSite ) {
						sites.push( pluginSite );
					}
				}
			} );

			return sites;
		}, [] as SiteDetails[] );
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
			const updateA = Object.values( a.sites ).some( ( site ) => !! site.update );
			const updateB = Object.values( b.sites ).some( ( site ) => !! site.update );
			return Number( updateB ) - Number( updateA );
		} );

		return plugins;
	}

	getAllowedPluginActions( plugin: Plugin ) {
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
	( state, { plugins }: { plugins: Plugin[] } ) => {
		const selectedSite = getSelectedSite( state );
		return {
			allSites: getSites( state ),
			pluginsOnSites: getPluginsOnSites( state, plugins ),
			selectedSite,
			selectedSiteSlug: getSelectedSiteSlug( state ),
			hasManagePlugins: siteHasFeature(
				state,
				selectedSite?.ID ?? null,
				WPCOM_FEATURES_MANAGE_PLUGINS
			),
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
