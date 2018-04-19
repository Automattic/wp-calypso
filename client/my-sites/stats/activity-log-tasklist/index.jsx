/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEmpty, get, merge, each, omit, keyBy, union, some } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import ActivityLogTaskUpdate from './update';
import WithPluginsToUpdate from './plugins-to-update';
import Card from 'components/card';
import PopoverMenuItem from 'components/popover/menu-item';
import EllipsisMenu from 'components/ellipsis-menu';
import TrackComponentView from 'lib/analytics/track-component-view';
import PluginNotices from 'lib/plugins/notices';
import { getSite } from 'state/sites/selectors';
import { updatePlugin } from 'state/plugins/installed/actions';
import { getStatusForPlugin } from 'state/plugins/installed/selectors';
import { errorNotice, infoNotice, successNotice } from 'state/notices/actions';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';

/**
 * Checks if the supplied plugin or plugins are currently updating.
 *
 * @param {array} plugins List of plugin object to check their update status.
 * @returns {bool}        True if one or more plugins are updating.
 */
const isPluginUpdating = plugins =>
	some( plugins, plugin => 'inProgress' === get( plugin, 'updateStatus.status' ) );

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
		pluginUpdateNotice: null, // keyed by plugin id, like "hello-dolly/hello"
		dismissedPlugins: [],
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
	 * Starts the update process for a specified plugin. Displays an informational notice.
	 *
	 * @param {object} singlePlugin Plugin information that includes
	 * {
	 * 		{string} id   Plugin id, like "hello-dolly/hello".
	 * 		{string} slug Plugin slug, like "hello-dolly".
	 * 		{string} name Plugin name, like "Hello Dolly".
	 * }
	 * @param {string} location Send 'from_task' when this is called a row in the task list,
	 *                          'from_notice' when it's called from error notice.
	 */
	updatePlugin = ( singlePlugin, location = 'from_task' ) => {
		const { showInfoNotice, siteName, updateSinglePlugin } = this.props;

		updateSinglePlugin( singlePlugin, location );

		this.setState( {
			pluginUpdateNotice: merge( this.state.pluginUpdateNotice, {
				[ singlePlugin.slug ]: showInfoNotice(
					PluginNotices.inProgressMessage( 'UPDATE_PLUGIN', '1 site 1 plugin', {
						plugin: singlePlugin.name,
						site: siteName,
					} ),
					{
						id: singlePlugin.slug,
						showDismiss: false,
					}
				),
			} ),
		} );
	};

	componentDidUpdate( prevProps, prevState ) {
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
		const newState = {};
		const noticesToShow = {};
		const pluginsCompleted = [];

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
			const updateNoticeId = get(
				prevState.pluginUpdateNotice,
				[ pluginSlug, 'notice', 'noticeId' ],
				null
			);

			// If there is no notice displayed
			if ( ! updateNoticeId ) {
				return;
			}

			noticesToShow[ pluginSlug ] = null;

			// If it errored, clear and show error notice
			const pluginData = {
				plugin: plugin.name,
				site: siteName,
			};

			switch ( updateStatus.status ) {
				case 'error':
					noticesToShow[ pluginSlug ] = showErrorNotice(
						PluginNotices.singleErrorMessage( 'UPDATE_PLUGIN', pluginData, {
							error: updateStatus,
						} ),
						{
							id: pluginSlug,
							button: translate( 'Try again' ),
							onClick: () => this.updatePlugin( plugin, 'from_notice' ),
						}
					);
					break;
				case 'completed':
					noticesToShow[ pluginSlug ] = showSuccessNotice(
						PluginNotices.successMessage( 'UPDATE_PLUGIN', '1 site 1 plugin', pluginData ),
						{
							id: pluginSlug,
							duration: 5555,
						}
					);
					pluginsCompleted.push( pluginSlug );
					break;
			}
		} );

		if ( ! isEmpty( noticesToShow ) ) {
			newState.pluginUpdateNotice = merge( {}, prevState.pluginUpdateNotice, noticesToShow );
		}

		if ( ! isEmpty( pluginsCompleted ) ) {
			newState.dismissedPlugins = union( prevState.dismissedPlugins, pluginsCompleted );
		}

		return isEmpty( newState ) ? null : newState;
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
		const isSomePluginUpdating = isPluginUpdating( pluginsToUpdate );

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
					<EllipsisMenu>
						<PopoverMenuItem
							onClick={ this.dismissPlugins }
							className="activity-log-tasklist__dismiss-all"
							disabled={ isSomePluginUpdating }
						>
							<Gridicon icon="trash" size={ 24 } />
							<span>{ translate( 'Dismiss all' ) }</span>
						</PopoverMenuItem>
					</EllipsisMenu>
				</div>
				{ // Show if plugin update didn't start, is still running or errored,
				// but hide plugin if it was updated successfully.
				pluginsToUpdate.map( plugin => (
					<ActivityLogTaskUpdate
						key={ plugin.id }
						plugin={ plugin }
						updatePlugin={ this.updatePlugin }
						dismissPlugin={ this.dismissPlugins }
						disable={ isSomePluginUpdating }
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
	trackDismissPlugin: plugin_slug =>
		dispatch( recordTracksEvent( 'calypso_activitylog_tasklist_dismiss_plugin', { plugin_slug } ) ),
} );

export default WithPluginsToUpdate(
	connect( mapStateToProps, mapDispatchToProps )( localize( ActivityLogTasklist ) )
);
