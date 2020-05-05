/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { find, get, includes, isEmpty, isEqual, negate, range, reduce, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import acceptDialog from 'lib/accept';
import { warningNotice } from 'state/notices/actions';
import PluginItem from 'my-sites/plugins/plugin-item/plugin-item';
import PluginsActions from 'lib/plugins/actions';
import PluginsListHeader from 'my-sites/plugins/plugin-list-header';
import PluginsLog from 'lib/plugins/log-store';
import PluginNotices from 'lib/plugins/notices';
import { Card } from '@automattic/components';
import SectionHeader from 'components/section-header';
import { getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { recordGoogleEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

function checkPropsChange( nextProps, propArr ) {
	let i, prop;

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
	mixins: [ PluginNotices ],

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

		if ( this.state.disconnectJetpackDialog !== nextState.disconnectJetpackDialog ) {
			return true;
		}

		if ( ! isEqual( this.state.selectedPlugins, nextState.selectedPlugins ) ) {
			return true;
		}
		if ( this.shouldComponentUpdateNotices( this.state.notices, nextState.notices ) ) {
			return true;
		}

		return false;
	},

	getInitialState() {
		return {
			disconnectJetpackDialog: false,
			bulkManagementActive: false,
			selectedPlugins: {},
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
			this.removePluginsNotices();
			this.recordEvent( 'Clicked Manage Done' );
		}
	},

	removePluginsNotices() {
		PluginsActions.removePluginsNotices( 'completed', 'error' );
	},

	doActionOverSelected( actionName, action ) {
		const isDeactivatingAndJetpackSelected = ( { slug } ) =>
			( 'deactivating' === actionName || 'activating' === actionName ) && 'jetpack' === slug;

		const flattenArrays = ( full, partial ) => [ ...full, ...partial ];
		this.removePluginsNotices();
		this.props.plugins
			.filter( this.isSelected ) // only use selected sites
			.filter( negate( isDeactivatingAndJetpackSelected ) ) // ignore sites that are deactiving or activating jetpack
			.map( ( p ) => p.sites ) // list of plugins -> list of list of sites
			.reduce( flattenArrays, [] ) // flatten the list into one big list of sites
			.forEach( ( site ) => action( site, site.plugin ) );
	},

	pluginHasUpdate( plugin ) {
		return plugin.sites.some(
			( site ) => site.plugin && site.plugin.update && site.canUpdateFiles
		);
	},

	updateAllPlugins() {
		this.removePluginsNotices();
		this.props.plugins.forEach( ( plugin ) => {
			plugin.sites.forEach( ( site ) => PluginsActions.updatePlugin( site, site.plugin ) );
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

		if ( waitForDeactivate && this.props.selectedSite ) {
			this.setState( { disconnectJetpackDialog: true } );
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
		const pluginsList = {},
			sitesList = {};
		let pluginName, siteName;
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
			this.doActionOverSelected( 'removing', PluginsActions.removePlugin );
			this.recordEvent( 'Clicked Remove Plugin(s)', true );
		}
	},

	showDisconnectDialog() {
		const { translate } = this.props;

		if ( this.state.disconnectJetpackDialog && ! this.state.notices.inProgress.length ) {
			this.setState( {
				disconnectJetpackDialog: false,
			} );

			this.props.warningNotice(
				translate(
					'Jetpack cannot be deactivated from WordPress.com. {{link}}Manage connection{{/link}}',
					{
						components: {
							link: <a href={ '/settings/general/' + this.props.selectedSiteSlug } />,
						},
					}
				)
			);
		}
	},

	closeDialog( action ) {
		if ( 'continue' === action ) {
			page.redirect( '/settings/general/' + this.props.selectedSiteSlug );
			return;
		}
		this.setState( { showJetpackDisconnectDialog: false } );
		this.forceUpdate();
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
				progress={ this.state.notices.inProgress.filter(
					( log ) => log.plugin.slug === plugin.slug
				) }
				notices={ this.state.notices }
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
			isSiteAutomatedTransfer: isSiteAutomatedTransfer( state, get( selectedSite, 'ID' ) ),
		};
	},
	{
		recordGoogleEvent,
		warningNotice,
	}
)( localize( PluginsList ) );
