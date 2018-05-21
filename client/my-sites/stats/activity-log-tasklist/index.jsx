/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEmpty, get, mapValues, each, omit, keyBy, union, find } from 'lodash';
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
 * @param {object|array} s Plugin object or list of plugin objects to check their update status.
 * @returns {bool}         True if one or more plugins are updating.
 */
const isPluginUpdating = s =>
	( Array.isArray( s ) ? s : [ s ] ).some( p => 'inProgress' === get( p, 'updateStatus.status' ) );

/**
 * Checks if the plugin is enqueued to be updated searching it in the list by its slug.
 *
 * @param {string} g Plugin slug.
 * @param {array}  q Collection of plugins currently in the update queue.
 *
 * @returns {bool}   True if the plugin is enqueued to be updated.
 */
const isPluginEnqueued = ( g, q ) => !! find( q, { slug: g } );

class ActivityLogTasklist extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		plugins: PropTypes.arrayOf( PropTypes.object ), // Plugins updated and those with pending updates

		// Connected props
		siteName: PropTypes.string.isRequired,
		// Plugins already updated + those with pending updates.
		// This extends plugins with the plugin update status.
		pluginsWithUpdate: PropTypes.object.isRequired,
		trackUpdatePlugin: PropTypes.func.isRequired,
		trackUpdatePluginFromError: PropTypes.func.isRequired,
		trackUpdatePluginAll: PropTypes.func.isRequired,
		trackDismissPluginAll: PropTypes.func.isRequired,
		trackDismissPlugin: PropTypes.func.isRequired,
		goManagePlugins: PropTypes.func.isRequired,
		goToPlugin: PropTypes.func.isRequired,

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

	/**
	 * Add a plugin to the update queue.
	 *
	 * @param {object} plugin Plugin to enqueue.
	 * @param {string} from   Send 'task' when this is called from the task list, 'notice' when it's called from error notice.
	 */
	enqueuePlugin = ( plugin, from = 'task' ) => {
		if ( 'task' === from ) {
			this.props.trackUpdatePlugin( plugin.slug );
		} else if ( 'notice' === from ) {
			this.props.trackUpdatePluginFromError( plugin.slug );
		}
		this.setState(
			{
				queuedPlugins: union( this.state.queuedPlugins, [ plugin ] ),
			},
			this.continueQueue
		);
	};

	/**
	 * Remove a plugin from the update queue.
	 *
	 * @returns {undefined}
	 */
	dequeuePlugin = () =>
		this.setState(
			{
				queuedPlugins: this.state.queuedPlugins.slice( 1 ),
			},
			this.continueQueue
		);

	/**
	 * Add all plugins with pending updates to the queue and process it.
	 */
	updateAll = () => {
		this.props.trackUpdatePluginAll();
		this.setState(
			{
				queuedPlugins: union(
					this.state.queuedPlugins,
					Object.values( this.props.pluginsWithUpdate )
				),
			},
			this.continueQueue
		);
	};

	/**
	 * Starts the update process for a specified plugin. Displays an informational notice.
	 *
	 * @param {object} plugin Plugin information that includes
	 * {
	 * 		{string} id   Plugin id, like "hello-dolly/hello".
	 * 		{string} slug Plugin slug, like "hello-dolly".
	 * 		{string} name Plugin name, like "Hello Dolly".
	 * }
	 */
	updatePlugin = plugin => {
		const { showInfoNotice, siteName, updateSinglePlugin } = this.props;

		updateSinglePlugin( plugin );

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
		const path = `/stats/activity/${ this.props.siteSlug }`;
		page.exit( path, ( context, next ) => {
			if (
				! this.state.queuedPlugins.length ||
				window.confirm( this.props.translate( 'Navigating away will cancel remaining updates' ) )
			) {
				return next();
			}
			setTimeout(
				() => page.replace( `/stats/activity/${ this.props.siteSlug }`, null, false, false ),
				0
			);
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
							onClick: () => this.enqueuePlugin( plugin, 'notice' ),
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
						? translate(
								'You have %(updates)s update available',
								'You have %(updates)s updates available',
								{
									count: numberOfPluginUpdates,
									args: { updates: numberOfPluginUpdates },
								}
							)
						: translate( 'You have one update available' ) }
					{ 1 < numberOfPluginUpdates && (
						<SplitButton
							compact
							primary
							label={ translate( 'Update all' ) }
							onClick={ this.updateAll }
							disabled={ 0 < queuedPlugins.length }
						>
							<PopoverMenuItem
								onClick={ this.goManagePlugins }
								className="activity-log-tasklist__menu-item"
								icon="cog"
							>
								<span>{ translate( 'Manage plugins' ) }</span>
							</PopoverMenuItem>
							<PopoverMenuItem
								onClick={ this.dismissPlugins }
								className="activity-log-tasklist__menu-item"
								icon="trash"
							>
								<span>{ translate( 'Dismiss all' ) }</span>
							</PopoverMenuItem>
						</SplitButton>
					) }
				</div>
				{ // Show if plugin update didn't start, is still running or errored,
				// but hide plugin if it was updated successfully.
				pluginsToUpdate.map( plugin => (
					<ActivityLogTaskUpdate
						key={ plugin.id }
						plugin={ plugin }
						goToPlugin={ this.goToPlugin }
						enqueuePlugin={ this.enqueuePlugin }
						dismissPlugin={ this.dismissPlugins }
						disable={ isPluginEnqueued( plugin.slug, queuedPlugins ) }
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
 * @param {array}  pluginList Collection of plugins that will be updated.
 * @param {object} state      App state tree.
 * @param {number} siteId     ID of the site where the plugin is installed.
 *
 * @returns {array} List of plugins to update with their status.
 */
const makePluginsList = ( pluginList, state, siteId ) =>
	keyBy(
		mapValues( pluginList, plugin => ( {
			...plugin,
			updateStatus: getStatusForPlugin( state, siteId, plugin.id ),
		} ) ),
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
	updateSinglePlugin: plugin => dispatch( updatePlugin( siteId, plugin ) ),
	showErrorNotice: ( error, options ) => dispatch( errorNotice( error, options ) ),
	showInfoNotice: ( info, options ) => dispatch( infoNotice( info, options ) ),
	showSuccessNotice: ( success, options ) => dispatch( successNotice( success, options ) ),
	trackUpdatePlugin: plugin_slug =>
		dispatch( recordTracksEvent( 'calypso_activitylog_tasklist_update_plugin', { plugin_slug } ) ),
	trackUpdatePluginFromError: plugin_slug =>
		dispatch(
			recordTracksEvent( 'calypso_activitylog_tasklist_update_plugin_from_error', { plugin_slug } )
		),
	trackUpdatePluginAll: () =>
		dispatch( recordTracksEvent( 'calypso_activitylog_tasklist_update_plugin_all' ) ),
	trackDismissPluginAll: () =>
		dispatch( recordTracksEvent( 'calypso_activitylog_tasklist_dismiss_plugin_all' ) ),
	trackDismissPlugin: plugin_slug =>
		dispatch( recordTracksEvent( 'calypso_activitylog_tasklist_dismiss_plugin', { plugin_slug } ) ),
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
