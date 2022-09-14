import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { isEmpty, isEqual, range, reduce, sortBy } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import SectionHeader from 'calypso/components/section-header';
import acceptDialog from 'calypso/lib/accept';
import PluginNotices from 'calypso/my-sites/plugins/notices';
import PluginItem from 'calypso/my-sites/plugins/plugin-item/plugin-item';
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
		pluginUpdateCount: PropTypes.number,
		selectedSite: PropTypes.object,
		selectedSiteSlug: PropTypes.string,
		siteIsAtomic: PropTypes.bool,
		siteIsJetpack: PropTypes.bool,
	};

	static defaultProps = {
		recordGoogleEvent: () => {},
	};

	shouldComponentUpdate( nextProps, nextState ) {
		const propsToCheck = [ 'plugins', 'sites', 'selectedSite', 'pluginUpdateCount' ];
		if ( checkPropsChange.call( this, nextProps, propsToCheck ) ) {
			return true;
		}

		if ( this.props.isPlaceholder !== nextProps.isPlaceholder ) {
			return true;
		}

		if ( this.props.searchTerm !== nextProps.searchTerm ) {
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
					const sitePlugin = this.getSitePlugin( plugin, siteId );
					return sitePlugin?.active;
				} );
			}
			return false;
		},
		inactive( plugin ) {
			if ( this.isSelected( plugin ) && plugin.slug !== 'jetpack' ) {
				return Object.keys( plugin.sites ).some( ( siteId ) => {
					const sitePlugin = this.getSitePlugin( plugin, siteId );
					return ! sitePlugin?.active;
				} );
			}
			return false;
		},
		updates( plugin ) {
			if ( this.isSelected( plugin ) ) {
				return Object.keys( plugin.sites ).some( ( siteId ) => {
					const sitePlugin = this.getSitePlugin( plugin, siteId );
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
		this.props.removePluginStatuses( 'completed', 'error' );
	}

	doActionOverSelected( actionName, action, selectedPlugins ) {
		if ( ! selectedPlugins ) {
			selectedPlugins = this.props.plugins.filter( this.isSelected );
		}
		const isDeactivatingOrRemovingAndJetpackSelected = ( { slug } ) =>
			[ 'deactivating', 'activating', 'removing' ].includes( actionName ) && 'jetpack' === slug;

		const flattenArrays = ( full, partial ) => [ ...full, ...partial ];
		this.removePluginStatuses();
		selectedPlugins
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
			.reduce( flattenArrays, [] ) // flatten the list into one big list of plugin+site objects
			.forEach( ( { plugin, site } ) => action( site.ID, plugin ) );
	}

	getSitePlugin = ( plugin, siteId ) => {
		return {
			...plugin,
			...this.props.pluginsOnSites[ plugin.slug ]?.sites[ siteId ],
		};
	};

	pluginHasUpdate = ( plugin ) => {
		return Object.keys( plugin.sites ).some( ( siteId ) => {
			const sitePlugin = this.getSitePlugin( plugin, siteId );
			const site = this.props.allSites.find( ( s ) => s.ID === parseInt( siteId ) );
			return sitePlugin?.update && site?.canUpdateFiles;
		} );
	};

	handleUpdatePlugins = ( plugins ) => {
		this.removePluginStatuses();
		plugins
			// only consider plugins needing an update
			.filter( ( plugin ) => plugin.update )
			.forEach( ( plugin ) => {
				Object.entries( plugin.sites )
					// only consider the sites where the those plugins are installed
					.filter( ( [ , sitePlugin ] ) => sitePlugin.update?.new_version )
					.forEach( ( [ siteId ] ) => {
						const sitePlugin = this.getSitePlugin( plugin, siteId );
						return this.props.updatePlugin( siteId, sitePlugin );
					} );
			} );
	};

	updateAllPlugins = () => {
		this.handleUpdatePlugins( this.props.plugins );
		this.recordEvent( 'Clicked Update all Plugins', true );
	};

	updateSelected = ( accepted ) => {
		if ( accepted ) {
			this.doActionOverSelected( 'updating', this.props.updatePlugin );
			this.recordEvent( 'Clicked Update Plugin(s)', true );
		}
	};

	updatePlugin = ( selectedPlugin ) => {
		this.handleUpdatePlugins( [ selectedPlugin ] );
		this.recordEvent( 'Clicked Update Plugin(s)', true );
	};

	activateSelected = ( accepted ) => {
		if ( accepted ) {
			this.doActionOverSelected( 'activating', this.props.activatePlugin );
			this.recordEvent( 'Clicked Activate Plugin(s)', true );
		}
	};

	deactivateSelected = ( accepted ) => {
		if ( accepted ) {
			this.doActionOverSelected( 'deactivating', this.props.deactivatePlugin );
			this.recordEvent( 'Clicked Deactivate Plugin(s)', true );
		}
	};

	deactiveAndDisconnectSelected = ( accepted, selectedPlugins ) => {
		if ( accepted ) {
			if (
				selectedPlugins.length === 1 &&
				selectedPlugins.some( ( { slug } ) => slug === 'jetpack' )
			) {
				this.showDisconnectionNotice();
			} else {
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
		}
	};

	setAutoupdateSelected = ( accepted ) => {
		if ( accepted ) {
			this.doActionOverSelected( 'enablingAutoupdates', this.props.enableAutoupdatePlugin );
			this.recordEvent( 'Clicked Enable Autoupdate Plugin(s)', true );
		}
	};

	unsetAutoupdateSelected = ( accepted ) => {
		if ( accepted ) {
			this.doActionOverSelected( 'disablingAutoupdates', this.props.disableAutoupdatePlugin );
			this.recordEvent( 'Clicked Disable Autoupdate Plugin(s)', true );
		}
	};

	getConfirmationText( selectedPlugins, actionText, actionPreposition ) {
		const pluginsList = {};
		const sitesList = {};
		let pluginName;
		let siteName;
		const { translate } = this.props;

		selectedPlugins.forEach( ( plugin ) => {
			pluginsList[ plugin.slug ] = true;
			pluginName = plugin.name || plugin.slug;

			Object.keys( plugin.sites ).forEach( ( siteId ) => {
				const site = this.props.allSites.find( ( s ) => s.ID === parseInt( siteId ) );
				if ( site.canUpdateFiles ) {
					sitesList[ site.ID ] = true;
					siteName = site.title;
				}
			} );
		} );

		const pluginsListSize = Object.keys( pluginsList ).length;
		const siteListSize = Object.keys( sitesList ).length;
		const combination =
			( siteListSize > 1 ? 'n sites' : '1 site' ) +
			' ' +
			( pluginsListSize > 1 ? 'n plugins' : '1 plugin' );

		switch ( combination ) {
			case '1 site 1 plugin':
				return translate(
					'You are about to %(actionText)s {{em}}%(plugin)s %(actionPreposition)s %(site)s{{/em}}.',
					{
						components: {
							em: <em />,
						},
						args: {
							actionText: actionText,
							actionPreposition: actionPreposition,
							plugin: pluginName,
							site: siteName,
						},
					}
				);

			case '1 site n plugins':
				return translate(
					'You are about to %(actionText)s {{em}}%(numberOfPlugins)d plugins %(actionPreposition)s %(site)s{{/em}}.',
					{
						components: {
							em: <em />,
						},
						args: {
							actionText: actionText,
							actionPreposition: actionPreposition,
							numberOfPlugins: pluginsListSize,
							site: siteName,
						},
					}
				);

			case 'n sites 1 plugin':
				return translate(
					'You are about to %(actionText)s {{em}}%(plugin)s %(actionPreposition)s %(numberOfSites)d sites{{/em}}.',
					{
						components: {
							em: <em />,
						},
						args: {
							actionText: actionText,
							actionPreposition: actionPreposition,
							plugin: pluginName,
							numberOfSites: siteListSize,
						},
					}
				);

			case 'n sites n plugins':
				return translate(
					'You are about to %(actionText)s {{em}}%(numberOfPlugins)d plugins %(actionPreposition)s %(numberOfSites)d sites{{/em}}.',
					{
						components: {
							em: <em />,
						},
						args: {
							actionText: actionText,
							actionPreposition: actionPreposition,
							numberOfPlugins: pluginsListSize,
							numberOfSites: siteListSize,
						},
					}
				);
		}
	}

	bulkActionDialog = ( actionName, selectedPlugin ) => {
		const { plugins, translate } = this.props;
		const selectedPlugins = selectedPlugin ? [ selectedPlugin ] : plugins.filter( this.isSelected );
		const pluginsCount = selectedPlugins.length;

		const isJetpackIncluded = selectedPlugins.some( ( { slug } ) => slug === 'jetpack' );

		const translationArgs = {
			args: { pluginsCount },
			count: pluginsCount,
		};

		switch ( actionName ) {
			case 'activate':
				acceptDialog(
					<div>
						<span>{ this.getConfirmationText( selectedPlugins, 'activate', 'on' ) }</span>
					</div>,
					( accepted ) => this.activateSelected( accepted ),
					translate(
						'Activate %(pluginsCount)d plugin',
						'Activate %(pluginsCount)d plugins',
						translationArgs
					)
				);
				break;
			case 'deactivate':
				acceptDialog(
					<div>
						<span>{ this.getConfirmationText( selectedPlugins, 'deactivate', 'on' ) }</span>
					</div>,
					isJetpackIncluded
						? ( accepted ) => this.deactiveAndDisconnectSelected( accepted, selectedPlugins )
						: ( accepted ) => this.deactivateSelected( accepted ),
					translate(
						'Deactivate %(pluginsCount)d plugin',
						'Deactivate %(pluginsCount)d plugins',
						translationArgs
					)
				);
				break;
			case 'enableAutoupdates':
				acceptDialog(
					<div>
						<span>
							{ this.getConfirmationText( selectedPlugins, 'enable autoupdates for', 'on' ) }
						</span>
					</div>,
					( accepted ) => this.setAutoupdateSelected( accepted ),
					translate(
						'Enable autoupdates for %(pluginsCount)d plugin',
						'Enable autoupdates for %(pluginsCount)d plugins',
						translationArgs
					)
				);
				break;
			case 'disableAutoupdates':
				acceptDialog(
					<div>
						<span>
							{ this.getConfirmationText( selectedPlugins, 'disable autoupdates for', 'on' ) }
						</span>
					</div>,
					( accepted ) => this.unsetAutoupdateSelected( accepted ),
					translate(
						'Disable autoupdates for %(pluginsCount)d plugin',
						'Disable autoupdates for %(pluginsCount)d plugins',
						translationArgs
					)
				);
				break;
			case 'update':
				acceptDialog(
					<div>
						<span>{ this.getConfirmationText( selectedPlugins, 'update', 'on' ) }</span>
					</div>,
					( accepted ) => this.updateSelected( accepted ),
					translate(
						'Update %(pluginsCount)d plugin',
						'Update %(pluginsCount)d plugins',
						translationArgs
					)
				);
		}
	};

	removePluginDialog = ( selectedPlugin ) => {
		const { plugins, translate } = this.props;

		const selectedPlugins = selectedPlugin ? [ selectedPlugin ] : plugins.filter( this.isSelected );
		const isJetpackIncluded = selectedPlugins.some( ( { slug } ) => slug === 'jetpack' );

		const message = (
			<div>
				<span>{ this.getConfirmationText( selectedPlugins, 'remove', 'from' ) }</span>
				<span>
					{ translate(
						'{{p}}This will deactivate the plugins and delete all associated files and data.{{/p}}',
						{
							components: {
								p: <p />,
							},
						}
					) }
				</span>
				<span>{ translate( 'Do you want to continue?' ) }</span>
			</div>
		);

		acceptDialog(
			message,
			isJetpackIncluded
				? ( accepted ) => this.removeSelectedWithJetpack( accepted, selectedPlugins )
				: ( accepted ) => this.removeSelected( accepted, selectedPlugins ),
			translate( 'Remove', { context: 'Verb. Presented to user as a label for a button.' } )
		);
	};

	removeSelected = ( accepted, selectedPlugins ) => {
		if ( accepted ) {
			this.doActionOverSelected( 'removing', this.props.removePlugin, selectedPlugins );
			this.recordEvent( 'Clicked Remove Plugin(s)', true );
		}
	};

	removeSelectedWithJetpack = ( accepted, selectedPlugins ) => {
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
		if ( this.state.disconnectJetpackNotice && ! this.props.inProgressStatuses.length ) {
			this.setState( {
				disconnectJetpackNotice: false,
			} );

			this.showDisconnectionNotice();
		}
	}

	showDisconnectionNotice() {
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
				if ( ! sites.find( ( site ) => site.ID === pluginSiteId ) ) {
					const pluginSite = this.props.allSites.find( ( s ) => s.ID === parseInt( pluginSiteId ) );
					sites.push( pluginSite );
				}
			} );

			return sites;
		}, [] );
	}

	// Renders
	render() {
		const itemListClasses = classNames( 'plugins-list__elements', {
			'is-bulk-editing': this.state.bulkManagementActive,
		} );

		const selectedSiteSlug = this.props.selectedSiteSlug ? this.props.selectedSiteSlug : '';

		if ( this.props.isPlaceholder && ! this.props.isJetpackCloud ) {
			return (
				<div className="plugins-list">
					<SectionHeader
						key="plugins-list__section-placeholder"
						label={ this.props.header }
						className="plugins-list__section-actions is-placeholder"
					/>
					<Card className={ itemListClasses }>{ this.renderPlaceholders() }</Card>
				</div>
			);
		}

		if ( isEmpty( this.props.plugins ) && ! this.props.isJetpackCloud ) {
			return null;
		}

		return (
			<div className="plugins-list">
				<QueryProductsList />
				{ ! this.props.isJetpackCloud && (
					<PluginNotices sites={ this.getPluginsSites() } plugins={ this.props.plugins } />
				) }
				<PluginsListHeader
					label={ this.props.header }
					isBulkManagementActive={ this.state.bulkManagementActive }
					isWpcom={ ! this.props.isJetpackCloud }
					selectedSiteSlug={ selectedSiteSlug }
					plugins={ this.props.plugins }
					selected={ this.getSelected() }
					toggleBulkManagement={ this.toggleBulkManagement }
					updateAllPlugins={ this.updateAllPlugins }
					updateSelected={ this.updateSelected }
					pluginUpdateCount={ this.props.pluginUpdateCount }
					activateSelected={ this.activateSelected }
					deactiveAndDisconnectSelected={ this.deactiveAndDisconnectSelected }
					deactivateSelected={ this.deactivateSelected }
					setAutoupdateSelected={ this.setAutoupdateSelected }
					unsetAutoupdateSelected={ this.unsetAutoupdateSelected }
					removePluginNotice={ () => this.removePluginDialog() }
					setSelectionState={ this.setBulkSelectionState }
					activatePluginNotice={ () => this.bulkActionDialog( 'activate' ) }
					deactivatePluginNotice={ () => this.bulkActionDialog( 'deactivate' ) }
					autoupdateEnablePluginNotice={ () => this.bulkActionDialog( 'enableAutoupdates' ) }
					autoupdateDisablePluginNotice={ () => this.bulkActionDialog( 'disableAutoupdates' ) }
					updatePluginNotice={ () => this.bulkActionDialog( 'update' ) }
					haveActiveSelected={ this.props.plugins.some( this.filterSelection.active.bind( this ) ) }
					haveInactiveSelected={ this.props.plugins.some(
						this.filterSelection.inactive.bind( this )
					) }
					haveUpdatesSelected={ this.props.plugins.some(
						this.filterSelection.updates.bind( this )
					) }
				/>
				{ this.props.isJetpackCloud ? (
					<PluginManagementV2
						plugins={ this.getPlugins() }
						isLoading={ this.props.isLoading }
						selectedSite={ this.props.selectedSite }
						searchTerm={ this.props.searchTerm }
						isBulkManagementActive={ this.state.bulkManagementActive }
						pluginUpdateCount={ this.props.pluginUpdateCount }
						toggleBulkManagement={ this.toggleBulkManagement }
						updateAllPlugins={ this.updateAllPlugins }
						removePluginNotice={ this.removePluginDialog }
						updatePlugin={ this.updatePlugin }
					/>
				) : (
					<>
						<Card className={ itemListClasses }>
							{ this.orderPluginsByUpdates( this.props.plugins ).map( this.renderPlugin ) }
						</Card>
					</>
				) }
			</div>
		);
	}

	getPlugins() {
		return this.props.plugins.map( ( plugin ) => {
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

	orderPluginsByUpdates( plugins ) {
		return sortBy( plugins, ( plugin ) => {
			// Bring the plugins requiring updates to the front of the array
			return this.pluginHasUpdate( plugin ) ? 0 : 1;
		} );
	}

	renderPlugin = ( plugin ) => {
		const selectThisPlugin = this.togglePlugin.bind( this, plugin );
		const allowedPluginActions = this.getAllowedPluginActions( plugin );
		const isSelectable =
			this.state.bulkManagementActive &&
			( allowedPluginActions.autoupdate || allowedPluginActions.activation );
		const sites = Object.keys( plugin.sites ).map( ( siteId ) => {
			const site = this.props.allSites.find( ( s ) => s.ID === parseInt( siteId ) );

			return {
				...site,
				...plugin.sites[ siteId ],
			};
		} );
		return (
			<PluginItem
				key={ plugin.slug }
				plugin={ plugin }
				sites={ sites }
				progress={ this.props.inProgressStatuses.filter(
					( status ) => status.pluginId === plugin.id
				) }
				isSelected={ this.isSelected( plugin ) }
				isSelectable={ isSelectable }
				onClick={ selectThisPlugin }
				selectedSite={ this.props.selectedSite }
				pluginLink={ '/plugins/' + encodeURIComponent( plugin.slug ) + this.siteSuffix() }
				allowedActions={ allowedPluginActions }
				isAutoManaged={ ! allowedPluginActions.autoupdate }
			/>
		);
	};

	renderPlaceholders() {
		const placeholderCount = 18;
		return range( placeholderCount ).map( ( i ) => <PluginItem key={ 'placeholder-' + i } /> );
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
