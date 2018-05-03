/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEmpty, isArray, get, merge, each, omit, keyBy, union, some, drop, find } from 'lodash';
import Gridicon from 'gridicons';
import page from 'page';

/**
 * Internal dependencies
 */
import ActivityLogTaskUpdate from './update';
import WithPluginsToUpdate from './plugins-to-update';
import Card from 'components/card';
import PopoverMenuItem from 'components/popover/menu-item';
import SplitButton from 'components/split-button';
import TrackComponentView from 'lib/analytics/track-component-view';
import PluginNotices from 'lib/plugins/notices';
import { getSite } from 'state/sites/selectors';
import { updatePlugin } from 'state/plugins/installed/actions';
import { getStatusForPlugin } from 'state/plugins/installed/selectors';
import { errorNotice, infoNotice, successNotice } from 'state/notices/actions';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { navigate } from 'state/ui/actions';

/**
 * Checks if the supplied plugin or plugins are currently updating.
 *
 * @param {object|array} plugins Plugin object or list of plugin objects to check their update status.
 * @returns {bool}               True if one or more plugins are updating.
 */
const isPluginUpdating = plugins =>
	some(
		isArray( plugins ) ? plugins : [ plugins ],
		plugin => 'inProgress' === get( plugin, 'updateStatus.status' )
	);

class ActivityLogTasklist extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		plugins: PropTypes.arrayOf( PropTypes.object ), // Plugins updated and those with pending updates

		// Connected props
		siteName: PropTypes.string.isRequired,
		// Plugins already updated + those with pending updates.
		// This extends plugins with the plugin update status.
		pluginsWithUpdate: PropTypes.object.isRequired,

		// Localize
		translate: PropTypes.func.isRequired,
		updateSinglePlugin: PropTypes.func.isRequired,
		showErrorNotice: PropTypes.func.isRequired,
		showInfoNotice: PropTypes.func.isRequired,
		showSuccessNotice: PropTypes.func.isRequired,
	};

	state = {
		dismissedPlugins: [],
		queuedPlugins: [],
	};

	/**
	 * Adds a single or multiple plugin slugs to a list of dismissed plugins.
	 * If it receives a string, it assumes it's a valid plugin slug and adds it to the dismissed list.
	 * When it doesn't receive a string, it adds all the plugin slugs to the dismissed list.
	 *
	 * @param {string|void} pluginSlug Slug of a plugin or nothing.
	 */
	dismissPlugins = pluginSlug => {
		// ToDo: this should update some record in the tasklist API
		const { pluginsWithUpdate, trackDismissPlugin, trackDismissPluginAll } = this.props;
		let plugins;

		if ( 'string' === typeof pluginSlug ) {
			plugins = [ pluginSlug ];
			trackDismissPlugin( pluginSlug );
		} else {
			plugins = Object.keys( pluginsWithUpdate );
			trackDismissPluginAll();
		}

		this.setState( {
			dismissedPlugins: union( this.state.dismissedPlugins, plugins ),
		} );
	};

	/**
	 * Goes to general plugin management screen.
	 *
	 * @returns {object} Action to redirect to plugins management.
	 */
	goManagePlugins = () => this.props.goManagePlugins( this.props.siteSlug );

	/**
	 * Goes to single plugin management screen.
	 *
	 * @param {string} pluginSlug Plugin slug, like "hello-dolly".
	 *
	 * @returns {object} Action to redirect to plugin management.
	 */
	goToPlugin = pluginSlug => this.props.goToPlugin( pluginSlug, this.props.siteSlug );

	/**
	 * Checks if the plugin update queue has more items and none is currently updating.
	 * If so, updates the next plugin.
	 */
	continueQueue = () => {
		if (
			0 < this.state.queuedPlugins.length &&
			! isPluginUpdating( Object.values( this.props.pluginsWithUpdate ) )
		) {
			this.updatePlugin( this.state.queuedPlugins[ 0 ] );
		}
	};

	enqueuePlugin = plugin =>
		this.setState(
			{
				queuedPlugins: union( this.state.queuedPlugins, [ plugin ] ),
			},
			this.continueQueue
		);

	dequeuePlugin = () =>
		this.setState(
			{
				queuedPlugins: drop( this.state.queuedPlugins ),
			},
			this.continueQueue
		);

	updateAll = () =>
		this.setState(
			{
				queuedPlugins: union(
					this.state.queuedPlugins,
					Object.values( this.props.pluginsWithUpdate )
				),
			},
			this.continueQueue
		);

	/**
	 * Starts the update process for a specified plugin. Displays an informational notice.
	 *
	 * @param {object} plugin Plugin information that includes
	 * {
	 * 		{string} id   Plugin id, like "hello-dolly/hello".
	 * 		{string} slug Plugin slug, like "hello-dolly".
	 * 		{string} name Plugin name, like "Hello Dolly".
	 * }
	 * @param {string} location Send 'from_task' when this is called a row in the task list,
	 *                          'from_notice' when it's called from error notice.
	 */
	updatePlugin = ( plugin, location = 'from_task' ) => {
		const { showInfoNotice, siteName, updateSinglePlugin } = this.props;

		updateSinglePlugin( plugin, location );

		showInfoNotice(
			PluginNotices.inProgressMessage( 'UPDATE_PLUGIN', '1 site 1 plugin', {
				plugin: plugin.name,
				site: siteName,
			} ),
			{
				id: plugin.slug,
				showDismiss: false,
			}
		);
	};

	componentDidMount() {
		const canonicalPath = `/stats/activity/${ this.props.siteSlug }`;
		page.exit( canonicalPath, ( context, next ) => {
			if (
				! this.state.queuedPlugins.length ||
				window.confirm( this.props.translate( 'Cancel plugin updates and leave?' ) )
			) {
				return next();
			}
			setTimeout( () => page.replace( canonicalPath, null, false, false ), 0 );
		} );
	}

	componentDidUpdate( prevProps ) {
		if ( isEmpty( this.props.pluginsWithUpdate ) ) {
			return;
		}

		const {
			showErrorNotice,
			showSuccessNotice,
			siteName,
			translate,
			pluginsWithUpdate,
		} = this.props;

		each( Object.values( pluginsWithUpdate ), plugin => {
			const pluginSlug = plugin.slug;

			if ( false === get( prevProps.pluginsWithUpdate, [ pluginSlug, 'updateStatus' ], false ) ) {
				return;
			}

			if (
				get( prevProps.pluginsWithUpdate, [ pluginSlug, 'updateStatus', 'status' ], false ) ===
					get( plugin.updateStatus, 'status', false ) ||
				isPluginUpdating( plugin )
			) {
				return;
			}

			const updateStatus = plugin.updateStatus;

			// If it errored, clear and show error notice
			const pluginData = {
				plugin: plugin.name,
				site: siteName,
			};

			switch ( updateStatus.status ) {
				case 'error':
					showErrorNotice(
						PluginNotices.singleErrorMessage( 'UPDATE_PLUGIN', pluginData, {
							error: updateStatus,
						} ),
						{
							id: pluginSlug,
							button: translate( 'Try again' ),
							onClick: () => this.enqueuePlugin( plugin, 'from_notice' ),
						}
					);
					this.dequeuePlugin();
					break;
				case 'completed':
					showSuccessNotice(
						PluginNotices.successMessage( 'UPDATE_PLUGIN', '1 site 1 plugin', pluginData ),
						{
							id: pluginSlug,
							duration: 3000,
						}
					);
					this.dismissPlugins( pluginSlug );
					this.dequeuePlugin();
					break;
			}
		} );
	}

	render() {
		const pluginsToUpdate = Object.values(
			omit( this.props.pluginsWithUpdate, this.state.dismissedPlugins )
		);
		if ( isEmpty( pluginsToUpdate ) ) {
			return null;
		}

		const { translate } = this.props;
		const numberOfPluginUpdates = pluginsToUpdate.length;
		const queuedPlugins = this.state.queuedPlugins;

		return (
			<Card className="activity-log-tasklist" highlight="warning">
				<TrackComponentView eventName={ 'calypso_activitylog_tasklist_update_impression' } />
				<div className="activity-log-tasklist__heading">
					{ // Not using count method since we want a "one" string.
					1 < numberOfPluginUpdates
						? translate( 'You have %(updates)s updates available', {
								args: { updates: numberOfPluginUpdates },
							} )
						: translate( 'You have one update available' ) }
					<SplitButton
						compact
						primary
						label={ translate( 'Update all' ) }
						onClick={ this.updateAll }
						disabled={ 0 < queuedPlugins.length }
					>
						<PopoverMenuItem
							onClick={ this.dismissPlugins }
							className="activity-log-tasklist__menu-item"
						>
							<Gridicon icon="trash" size={ 24 } />
							<span>{ translate( 'Dismiss all' ) }</span>
						</PopoverMenuItem>
						<PopoverMenuItem
							onClick={ this.goManagePlugins }
							className="activity-log-tasklist__menu-item"
						>
							<Gridicon icon="cog" size={ 24 } />
							<span>{ translate( 'Manage plugins' ) }</span>
						</PopoverMenuItem>
					</SplitButton>
				</div>
				{ // Show if plugin update didn't start, is still running or errored,
				// but hide plugin if it was updated successfully.
				pluginsToUpdate.map( plugin => (
					<ActivityLogTaskUpdate
						key={ plugin.id }
						plugin={ plugin }
						goToPlugin={ this.goToPlugin }
						updatePlugin={ this.enqueuePlugin }
						dismissPlugin={ this.dismissPlugins }
						disable={ !! find( queuedPlugins, { slug: plugin.slug } ) }
					/>
				) ) }
			</Card>
		);
	}
}

/**
 * Creates an object, keyed by plugin slug, of objects containing plugin information
 * {
 * 		{string}       id     Plugin directory and base file name without extension
 * 		{string}       slug   Plugin directory
 * 		{string}       name   Plugin name
 * 		{object|false} status Current update status
 * }
 * @param {array}  pluginList List of plugins that will be updated
 * @param {object} state      Progress of plugin update as found in status.plugins.installed.state.
 * @param {number} siteId     ID of the site where the plugin is installed
 *
 * @returns {array} List of plugins to update with their status.
 */
const makePluginsList = ( pluginList, state, siteId ) =>
	keyBy(
		pluginList.map( plugin =>
			merge( {}, plugin, { updateStatus: getStatusForPlugin( state, siteId, plugin.id ) } )
		),
		'slug'
	);

const mapStateToProps = ( state, { siteId, plugins } ) => {
	const site = getSite( state, siteId );
	return {
		siteId,
		siteSlug: site.slug,
		siteName: site.name,
		pluginsWithUpdate: makePluginsList( plugins, state, siteId ),
	};
};

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	updateSinglePlugin: ( plugin, location ) =>
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_tasklist_update_plugin', {
					plugin_slug: plugin.slug,
					location,
				} ),
				updatePlugin( siteId, plugin )
			)
		),
	showErrorNotice: ( error, options ) => dispatch( errorNotice( error, options ) ),
	showInfoNotice: ( info, options ) => dispatch( infoNotice( info, options ) ),
	showSuccessNotice: ( success, options ) => dispatch( successNotice( success, options ) ),
	trackDismissPluginAll: () =>
		dispatch( recordTracksEvent( 'calypso_activitylog_tasklist_dismiss_plugin_all' ) ),
	trackDismissPlugin: pluginSlug =>
		dispatch(
			recordTracksEvent( 'calypso_activitylog_tasklist_dismiss_plugin', {
				plugin_slug: pluginSlug,
			} )
		),
	goManagePlugins: siteSlug =>
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_tasklist_manage_plugins' ),
				navigate( `/plugins/manage/${ siteSlug }` )
			)
		),
	goToPlugin: ( pluginSlug, siteSlug ) =>
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_tasklist_manage_single_plugin' ),
				navigate( `/plugins/${ pluginSlug }/${ siteSlug }` )
			)
		),
} );

export default WithPluginsToUpdate(
	connect( mapStateToProps, mapDispatchToProps )( localize( ActivityLogTasklist ) )
);
