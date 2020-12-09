/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { find, get, includes, isEmpty, isEqual, negate, range, reduce, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import acceptDialog from 'calypso/lib/accept';
import { warningNotice } from 'calypso/state/notices/actions';
import PluginItem from 'calypso/my-sites/plugins/plugin-item/plugin-item';
import PluginsListHeader from 'calypso/my-sites/plugins/plugin-list-header';
import PluginNotices from 'calypso/my-sites/plugins/notices';
import { Card } from '@automattic/components';
import SectionHeader from 'calypso/components/section-header';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import {
	activatePlugin,
	deactivatePlugin,
	disableAutoupdatePlugin,
	enableAutoupdatePlugin,
	removePlugin,
	updatePlugin,
} from 'calypso/state/plugins/installed/actions';
import { getPluginStatusesByType } from 'calypso/state/plugins/installed/selectors';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';

/**
 * Style dependencies
 */
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

// eslint-disable-next-line react/prefer-es6-class
export const PluginsList = createReactClass( {
	displayName: 'PluginsList',

	propTypes: {
		plugins: PropTypes.arrayOf(
			PropTypes.shape( {
				sites: PropTypes.array,
				slug: PropTypes.string,
				name: PropTypes.string,
			} )
		).isRequired,
		header: PropTypes.string.isRequired,
		selectedSite: PropTypes.object,
		selectedSiteSlug: PropTypes.string,
		pluginUpdateCount: PropTypes.number,
		isPlaceholder: PropTypes.bool.isRequired,
	},

	getDefaultProps() {
		return {
			recordGoogleEvent: () => {},
		};
	},

	shouldComponentUpdate( nextProps, nextState ) {
		const propsToCheck = [ 'plugins', 'sites', 'selectedSite', 'pluginUpdateCount' ];
		if ( checkPropsChange.call( this, nextProps, propsToCheck ) ) {
			return true;
		}

		if ( this.props.isPlaceholder !== nextProps.isPlaceholder ) {
			return true;
		}

		if ( this.state.bulkManagementActive !== nextState.bulkManagementActive ) {
			return true;
		}

		if ( this.state.disconnectJetpackNotice !== nextState.disconnectJetpackNotice ) {
			return true;
		}

		if ( ! isEqual( this.state.selectedPlugins, nextState.selectedPlugins ) ) {
			return true;
		}

		if ( ! isEqual( this.props.inProgressStatuses, nextProps.inProgressStatuses ) ) {
			return true;
		}

		return false;
	},

	componentDidUpdate() {
		this.maybeShowDisconnectNotice();
	},

	getInitialState() {
		return {
			disconnectJetpackNotice: false,
			bulkManagementActive: false,
			selectedPlugins: {},
		};
	},

	isSelected( { slug } ) {
		return !! this.state.selectedPlugins[ slug ];
	},

	togglePlugin( plugin ) {
		const { slug } = plugin;
		const { selectedPlugins } = this.state;
		const oldValue = selectedPlugins[ slug ];
		const eventAction =
			'Clicked to ' + this.isSelected( plugin ) ? 'Deselect' : 'Select' + 'Single Plugin';
		this.setState( {
			selectedPlugins: Object.assign( {}, selectedPlugins, { [ slug ]: ! oldValue } ),
		} );
		this.props.recordGoogleEvent( 'Plugins', eventAction, 'Plugin Name', slug );
	},

	canBulkSelect( plugin ) {
		const { autoupdate: canAutoupdate, activation: canActivate } = this.getAllowedPluginActions(
			plugin
		);
		return canAutoupdate || canActivate;
	},

	setBulkSelectionState( plugins, selectionState ) {
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
	},

	getPluginBySlug( slug ) {
		const { plugins } = this.props;
		return find( plugins, ( plugin ) => plugin.slug === slug );
	},

	filterSelection: {
		active( plugin ) {
			if ( this.isSelected( plugin ) && plugin.slug !== 'jetpack' ) {
				return plugin.sites.some( ( site ) => site.plugin && site.plugin.active );
			}
			return false;
		},
		inactive( plugin ) {
			if ( this.isSelected( plugin ) && plugin.slug !== 'jetpack' ) {
				return plugin.sites.some( ( site ) => site.plugin && ! site.plugin.active );
			}
			return false;
		},
		updates( plugin ) {
			if ( this.isSelected( plugin ) ) {
				return plugin.sites.some(
					( site ) =>
						site.plugin &&
						site.plugin.update &&
						site.plugin.update.new_version &&
						site.canUpdateFiles
				);
			}
			return false;
		},
		selected( plugin ) {
			return this.isSelected( plugin );
		},
	},

	getSelected() {
		return this.props.plugins.filter( this.filterSelection.selected.bind( this ) );
	},

	siteSuffix() {
		return this.props.selectedSiteSlug ? '/' + this.props.selectedSiteSlug : '';
	},

	recordEvent( eventAction, includeSelectedPlugins ) {
		eventAction += this.props.selectedSite ? '' : ' on Multisite';
		if ( includeSelectedPlugins ) {
			const pluginSlugs = this.getSelected().map( ( plugin ) => plugin.slug );
			this.props.recordGoogleEvent( 'Plugins', eventAction, 'Plugins', pluginSlugs );
		} else {
			this.props.recordGoogleEvent( 'Plugins', eventAction );
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
			this.removePluginStatuses();
			this.recordEvent( 'Clicked Manage Done' );
		}
	},

	removePluginStatuses() {
		this.props.removePluginStatuses( 'completed', 'error' );
	},

	doActionOverSelected( actionName, action, siteIdOnly = false ) {
		const isDeactivatingAndJetpackSelected = ( { slug } ) =>
			( 'deactivating' === actionName || 'activating' === actionName ) && 'jetpack' === slug;

		const flattenArrays = ( full, partial ) => [ ...full, ...partial ];
		this.removePluginStatuses();
		this.props.plugins
			.filter( this.isSelected ) // only use selected sites
			.filter( negate( isDeactivatingAndJetpackSelected ) ) // ignore sites that are deactiving or activating jetpack
			.map( ( p ) => p.sites ) // list of plugins -> list of list of sites
			.reduce( flattenArrays, [] ) // flatten the list into one big list of sites
			.forEach( ( site ) => {
				// Our Redux actions only need a site ID instead of an entire site object
				const siteArg = siteIdOnly ? site.ID : site;
				return action( siteArg, site.plugin );
			} );
	},

	pluginHasUpdate( plugin ) {
		return plugin.sites.some(
			( site ) => site.plugin && site.plugin.update && site.canUpdateFiles
		);
	},

	updateAllPlugins() {
		this.removePluginStatuses();
		this.props.plugins.forEach( ( plugin ) => {
			plugin.sites.forEach( ( site ) => this.props.updatePlugin( site.ID, site.plugin ) );
		} );
		this.recordEvent( 'Clicked Update all Plugins', true );
	},

	updateSelected() {
		this.doActionOverSelected( 'updating', this.props.updatePlugin, true );
		this.recordEvent( 'Clicked Update Plugin(s)', true );
	},

	activateSelected() {
		this.doActionOverSelected( 'activating', this.props.activatePlugin, true );
		this.recordEvent( 'Clicked Activate Plugin(s)', true );
	},

	deactivateSelected() {
		this.doActionOverSelected( 'deactivating', this.props.deactivatePlugin, true );
		this.recordEvent( 'Clicked Deactivate Plugin(s)', true );
	},

	deactiveAndDisconnectSelected() {
		let waitForDeactivate = false;

		this.doActionOverSelected(
			'deactivating',
			( site, plugin ) => {
				waitForDeactivate = true;
				this.props.deactivatePlugin( site, plugin, true );
			},
			true
		);

		if ( waitForDeactivate && this.props.selectedSite ) {
			this.setState( { disconnectJetpackNotice: true } );
		}

		this.recordEvent( 'Clicked Deactivate Plugin(s) and Disconnect Jetpack', true );
	},

	setAutoupdateSelected() {
		this.doActionOverSelected( 'enablingAutoupdates', this.props.enableAutoupdatePlugin, true );
		this.recordEvent( 'Clicked Enable Autoupdate Plugin(s)', true );
	},

	unsetAutoupdateSelected() {
		this.doActionOverSelected( 'disablingAutoupdates', this.props.disableAutoupdatePlugin, true );
		this.recordEvent( 'Clicked Disable Autoupdate Plugin(s)', true );
	},

	getConfirmationText() {
		const pluginsList = {};
		const sitesList = {};
		let pluginName;
		let siteName;
		const { plugins, translate } = this.props;

		plugins.filter( this.isSelected ).forEach( ( plugin ) => {
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
		const combination =
			( siteListSize > 1 ? 'n sites' : '1 site' ) +
			' ' +
			( pluginsListSize > 1 ? 'n plugins' : '1 plugin' );

		switch ( combination ) {
			case '1 site 1 plugin':
				return translate(
					'You are about to remove {{em}}%(plugin)s from %(site)s{{/em}}.{{p}}' +
						'This will deactivate the plugin and delete all associated files and data.{{/p}}',
					{
						components: {
							em: <em />,
							p: <p />,
						},
						args: {
							plugin: pluginName,
							site: siteName,
						},
					}
				);

			case '1 site n plugins':
				return translate(
					'You are about to remove {{em}}%(numberOfPlugins)d plugins from %(site)s{{/em}}.{{p}}' +
						'This will deactivate the plugins and delete all associated files and data.{{/p}}',
					{
						components: {
							em: <em />,
							p: <p />,
						},
						args: {
							numberOfPlugins: pluginsListSize,
							site: siteName,
						},
					}
				);

			case 'n sites 1 plugin':
				return translate(
					'You are about to remove {{em}}%(plugin)s from %(numberOfSites)d sites{{/em}}.{{p}}' +
						'This will deactivate the plugin and delete all associated files and data.{{/p}}',
					{
						components: {
							em: <em />,
							p: <p />,
						},
						args: {
							plugin: pluginName,
							numberOfSites: siteListSize,
						},
					}
				);

			case 'n sites n plugins':
				return translate(
					'You are about to remove {{em}}%(numberOfPlugins)d plugins from %(numberOfSites)d sites{{/em}}.{{p}}' +
						'This will deactivate the plugins and delete all associated files and data.{{/p}}',
					{
						components: {
							em: <em />,
							p: <p />,
						},
						args: {
							numberOfPlugins: pluginsListSize,
							numberOfSites: siteListSize,
						},
					}
				);
		}
	},

	removePluginDialog() {
		const { translate } = this.props;

		const message = (
			<div>
				<span>{ this.getConfirmationText() }</span>
				<span>{ translate( 'Do you want to continue?' ) }</span>
			</div>
		);

		acceptDialog(
			message,
			this.removeSelected,
			translate( 'Remove', { context: 'Verb. Presented to user as a label for a button.' } )
		);
	},

	removeSelected( accepted ) {
		if ( accepted ) {
			this.doActionOverSelected( 'removing', this.props.removePlugin, true );
			this.recordEvent( 'Clicked Remove Plugin(s)', true );
		}
	},

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
	},

	// Renders
	render() {
		const itemListClasses = classNames( 'plugins-list__elements', {
			'is-bulk-editing': this.state.bulkManagementActive,
		} );

		const selectedSiteSlug = this.props.selectedSiteSlug ? this.props.selectedSiteSlug : '';

		if ( this.props.isPlaceholder ) {
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

		if ( isEmpty( this.props.plugins ) ) {
			return null;
		}

		return (
			<div className="plugins-list">
				<PluginNotices />
				<PluginsListHeader
					label={ this.props.header }
					isBulkManagementActive={ this.state.bulkManagementActive }
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
					removePluginNotice={ this.removePluginDialog }
					setSelectionState={ this.setBulkSelectionState }
					haveActiveSelected={ this.props.plugins.some( this.filterSelection.active.bind( this ) ) }
					haveInactiveSelected={ this.props.plugins.some(
						this.filterSelection.inactive.bind( this )
					) }
					haveUpdatesSelected={ this.props.plugins.some(
						this.filterSelection.updates.bind( this )
					) }
				/>
				<Card className={ itemListClasses }>
					{ this.orderPluginsByUpdates( this.props.plugins ).map( this.renderPlugin ) }
				</Card>
			</div>
		);
	},

	getAllowedPluginActions( plugin ) {
		const autoManagedPlugins = [ 'jetpack', 'vaultpress', 'akismet' ];
		const hiddenForAutomatedTransfer =
			this.props.isSiteAutomatedTransfer && includes( autoManagedPlugins, plugin.slug );

		return {
			autoupdate: ! hiddenForAutomatedTransfer,
			activation: ! hiddenForAutomatedTransfer,
		};
	},

	orderPluginsByUpdates( plugins ) {
		return sortBy( plugins, ( plugin ) => {
			// Bring the plugins requiring updates to the front of the array
			return this.pluginHasUpdate( plugin ) ? 0 : 1;
		} );
	},

	renderPlugin( plugin ) {
		const selectThisPlugin = this.togglePlugin.bind( this, plugin );
		const allowedPluginActions = this.getAllowedPluginActions( plugin );
		const isSelectable =
			this.state.bulkManagementActive &&
			( allowedPluginActions.autoupdate || allowedPluginActions.activation );
		return (
			<PluginItem
				key={ plugin.slug }
				plugin={ plugin }
				sites={ plugin.sites }
				progress={ this.props.inProgressStatuses.filter(
					( status ) => status.pluginId === plugin.id
				) }
				isSelected={ this.isSelected( plugin ) }
				isSelectable={ isSelectable }
				onClick={ selectThisPlugin }
				hasUpdate={ this.pluginHasUpdate }
				selectedSite={ this.props.selectedSite }
				pluginLink={ '/plugins/' + encodeURIComponent( plugin.slug ) + this.siteSuffix() }
				allowedActions={ allowedPluginActions }
				isAutoManaged={ ! allowedPluginActions.autoupdate }
			/>
		);
	},

	renderPlaceholders() {
		const placeholderCount = 18;
		return range( placeholderCount ).map( ( i ) => <PluginItem key={ 'placeholder-' + i } /> );
	},
} );

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );

		return {
			selectedSite,
			selectedSiteSlug: getSelectedSiteSlug( state ),
			inProgressStatuses: getPluginStatusesByType( state, 'inProgress' ),
			isSiteAutomatedTransfer: isSiteAutomatedTransfer( state, get( selectedSite, 'ID' ) ),
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
