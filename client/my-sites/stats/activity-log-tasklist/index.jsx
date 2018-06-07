/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEmpty, get, each, includes, union, find } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import ActivityLogTaskUpdate from './update';
import WithItemsToUpdate from './to-update';
import Card from 'components/card';
import PopoverMenuItem from 'components/popover/menu-item';
import SplitButton from 'components/split-button';
import TrackComponentView from 'lib/analytics/track-component-view';
import { getSite } from 'state/sites/selectors';
import { updatePlugin } from 'state/plugins/installed/actions';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';
import { getStatusForPlugin } from 'state/plugins/installed/selectors';
import { errorNotice, infoNotice, successNotice } from 'state/notices/actions';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { navigate } from 'state/ui/actions';

/**
 * Checks if the supplied plugins or themes are currently updating.
 *
 * @param {Array} s List of plugin or theme objects to check their update status.
 *
 * @returns {bool}  True if one or more plugins or themes are updating.
 */
const isItemUpdating = s => s.some( p => 'inProgress' === get( p, 'updateStatus.status' ) );

/**
 * Checks if the plugin or theme is enqueued to be updated, searching it in the list by its slug.
 *
 * @param {string} g Plugin or theme slug.
 * @param {array}  q Collection of plugins or themes currently in the update queue.
 *
 * @returns {bool}   True if the plugin or theme is enqueued to be updated.
 */
const isItemEnqueued = ( g, q ) => !! find( q, { slug: g } );

class ActivityLogTasklist extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		plugins: PropTypes.arrayOf( PropTypes.object ), // Plugins updated and those with pending updates
		themes: PropTypes.arrayOf( PropTypes.object ), // Themes to update

		// Connected props
		siteName: PropTypes.string.isRequired,
		trackUpdateAll: PropTypes.func.isRequired,
		goToPage: PropTypes.func.isRequired,
		updateSingle: PropTypes.func.isRequired,

		// Plugins already updated + those with pending updates.
		// This extends plugins with the plugin update status.
		pluginsWithUpdate: PropTypes.arrayOf( PropTypes.object ).isRequired,
		trackUpdatePlugin: PropTypes.func.isRequired,
		trackUpdatePluginFromError: PropTypes.func.isRequired,
		trackDismissPluginAll: PropTypes.func.isRequired,
		trackDismissPlugin: PropTypes.func.isRequired,
		goManagePlugins: PropTypes.func.isRequired,

		// Themes
		themesWithUpdate: PropTypes.arrayOf( PropTypes.object ).isRequired,

		// Localize
		translate: PropTypes.func.isRequired,
		showErrorNotice: PropTypes.func.isRequired,
		showInfoNotice: PropTypes.func.isRequired,
		showSuccessNotice: PropTypes.func.isRequired,
	};

	state = {
		dismissed: [],
		queued: [],
	};

	/**
	 * Adds a single or multiple plugin slugs to a list of dismissed plugins.
	 * If it receives a string, it assumes it's a valid plugin slug and adds it to the dismissed list.
	 * When it doesn't receive a string, it adds all the plugin slugs to the dismissed list.
	 *
	 * @param {string|void} slug Slug of a plugin or nothing.
	 */
	dismiss = slug => {
		// ToDo: this should update some record in the tasklist API
		const { pluginsWithUpdate, trackDismissPlugin, trackDismissPluginAll } = this.props;
		let plugins;

		if ( 'string' === typeof slug ) {
			plugins = [ slug ];
			trackDismissPlugin( slug );
		} else {
			plugins = pluginsWithUpdate.map( p => p.slug );
			trackDismissPluginAll();
		}

		this.setState( {
			dismissed: union( this.state.dismissed, plugins ),
		} );
	};

	/**
	 * Goes to general plugin management screen.
	 *
	 * @returns {object} Action to redirect to plugins management.
	 */
	goManagePlugins = () => this.props.goManagePlugins( this.props.siteSlug );

	/**
	 * Goes to single theme or plugin management screen.
	 *
	 * @param {string} slug Plugin or theme slug, like "hello-dolly" or "dara".
	 * @param {string} type Indicates if it's "plugins" or "themes".
	 *
	 * @returns {object} Action to redirect to plugin management.
	 */
	goToPage = ( slug, type ) => this.props.goToPage( slug, type, this.props.siteSlug );

	/**
	 * Checks if the plugin update queue has more items and none is currently updating.
	 * If so, updates the next plugin.
	 */
	continueQueue = () => {
		if ( 0 < this.state.queued.length && ! isItemUpdating( this.props.pluginsWithUpdate ) ) {
			this.updateItem( this.state.queued[ 0 ] );
		}
	};

	/**
	 * Add a plugin or theme to the update queue.
	 *
	 * @param {object} item Plugin or theme to enqueue.
	 * @param {string} from   Send 'task' when this is called from the task list, 'notice' when it's called from error notice.
	 */
	enqueue = ( item, from = 'task' ) => {
		if ( 'task' === from ) {
			this.props.trackUpdatePlugin( item.slug );
		} else if ( 'notice' === from ) {
			this.props.trackUpdatePluginFromError( item.slug );
		}
		this.setState(
			{
				queued: union( this.state.queued, [ item ] ),
			},
			this.continueQueue
		);
	};

	/**
	 * Remove a plugin from the update queue.
	 *
	 * @returns {undefined}
	 */
	dequeue = () =>
		this.setState(
			{
				queued: this.state.queued.slice( 1 ),
			},
			this.continueQueue
		);

	/**
	 * Add all plugins with pending updates to the queue and process it.
	 */
	updateAll = () => {
		this.props.trackUpdateAll();
		this.setState(
			{
				queued: union(
					this.state.queued,
					this.props.pluginsWithUpdate,
					this.props.themesWithUpdate
				),
			},
			this.continueQueue
		);
	};

	/**
	 * Starts the update process for a specified plugin/theme. Displays an informational notice.
	 *
	 * @param {object} item Plugin/theme information that includes
	 * {
	 * 		{string} slug Plugin slug, like "hello-dolly".
	 * 		{string} name Plugin name, like "Hello Dolly".
	 * }
	 */
	updateItem = item => {
		const { showInfoNotice, siteName, updateSingle, translate } = this.props;

		updateSingle( item );

		showInfoNotice(
			translate( 'Updating %(item)s on %(siteName)s.', {
				args: { item: item.name, siteName },
			} ),
			{
				id: `alitemupdate-${ item.slug }`,
				showDismiss: false,
			}
		);
	};

	componentDidMount() {
		const path = `/stats/activity/${ this.props.siteSlug }`;
		page.exit( path, ( context, next ) => {
			if (
				! this.state.queued.length ||
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
		const itemsWithUpdate = union( this.props.pluginsWithUpdate, this.props.themesWithUpdate );
		if ( isEmpty( itemsWithUpdate ) ) {
			return;
		}

		const { showErrorNotice, showSuccessNotice, siteName, translate } = this.props;

		each( itemsWithUpdate, item => {
			const { slug, updateStatus, type, name } = item;
			// Finds in either prevProps.pluginsWithUpdate or prevProps.themesWithUpdate
			const prevItemWithUpdate = find( prevProps[ `${ type }sWithUpdate` ], { slug } );

			if ( false === get( prevItemWithUpdate, [ 'updateStatus' ], false ) ) {
				return;
			}

			if (
				get( prevItemWithUpdate, [ 'updateStatus', 'status' ], false ) ===
					get( updateStatus, 'status', false ) ||
				isItemUpdating( [ item ] )
			) {
				return;
			}

			const noticeArgs = {
				args: { item: name, siteName },
			};

			switch ( updateStatus.status ) {
				case 'error':
					showErrorNotice(
						translate( 'An error occurred while updating %(item)s on %(siteName)s.', noticeArgs ),
						{
							id: `alitemupdate-${ slug }`,
							button: translate( 'Try again' ),
							onClick: () => this.enqueue( item, 'notice' ),
						}
					);
					this.dequeue();
					break;
				case 'completed':
					showSuccessNotice(
						translate( 'Successfully updated %(item)s on %(siteName)s.', noticeArgs ),
						{
							id: `alitemupdate-${ slug }`,
							duration: 3000,
						}
					);
					this.dismiss( slug );
					this.dequeue();
					break;
			}
		} );
	}

	render() {
		const itemsToUpdate = union( this.props.pluginsWithUpdate, this.props.themesWithUpdate ).filter(
			item => ! includes( this.state.dismissed, item.slug )
		);
		if ( isEmpty( itemsToUpdate ) ) {
			return null;
		}

		const { translate } = this.props;
		const numberOfUpdates = itemsToUpdate.length;
		const queued = this.state.queued;

		return (
			<Card className="activity-log-tasklist" highlight="warning">
				<TrackComponentView eventName={ 'calypso_activitylog_tasklist_update_impression' } />
				<div className="activity-log-tasklist__heading">
					{ // Not using count method since we want a "one" string.
					1 < numberOfUpdates
						? translate(
								'You have %(updates)s update available',
								'You have %(updates)s updates available',
								{
									count: numberOfUpdates,
									args: { updates: numberOfUpdates },
								}
							)
						: translate( 'You have one update available' ) }
					{ 1 < numberOfUpdates && (
						<SplitButton
							compact
							primary
							label={ translate( 'Update all' ) }
							onClick={ this.updateAll }
							disabled={ 0 < queued.length }
						>
							<PopoverMenuItem
								onClick={ this.goManagePlugins }
								className="activity-log-tasklist__menu-item"
								icon="cog"
							>
								<span>{ translate( 'Manage plugins' ) }</span>
							</PopoverMenuItem>
							<PopoverMenuItem
								onClick={ this.dismiss }
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
				itemsToUpdate.map( item => (
					<ActivityLogTaskUpdate
						key={ item.slug }
						toUpdate={ item }
						name={ item.name }
						slug={ item.slug }
						version={ item.version }
						type={ item.type }
						updateType={
							'plugin' === item.type
								? translate( 'Plugin update available' )
								: translate( 'Theme update available' )
						}
						goToPage={ this.goToPage }
						enqueue={ this.enqueue }
						dismiss={ this.dismiss }
						disable={ isItemEnqueued( item.slug, queued ) }
					/>
				) ) }
			</Card>
		);
	}
}

/**
 * Converts statuses for network request for theme update into something matching the plugin update.
 * This normalization allows to reuse methods for both plugins and themes.
 *
 * @param {number} siteId  Site Id.
 * @param {string} themeId Theme slug.
 *
 * @returns {bool|object} False is update hasn't started. One of 'inProgress', 'error', 'completed', when
 * the update is running, failed, or was successfully completed, respectively.
 */
const getStatusForTheme = ( siteId, themeId ) => {
	const themeHttpData = getHttpData( `theme-update-${ siteId }-${ themeId }` );
	const { state } = themeHttpData;
	if ( 'pending' === state ) {
		return { status: 'inProgress' };
	}
	if ( 'failure' === state ) {
		return { status: 'error' };
	}
	if ( 'success' === state ) {
		// When a theme successfully updates, the theme 'update' property is nullified.
		if ( null === get( themeHttpData, 'data.themes.0.update' ) ) {
			return { status: 'completed' };
		}
		return { status: 'error' };
	}
	return false;
};

/**
 * Creates an object, keyed by plugin/theme slug, of objects containing plugin/theme information
 * {
 * 		{string}       id     Plugin/theme directory and base file name without extension
 * 		{string}       slug   Plugin/theme directory
 * 		{string}       name   Plugin/theme name
 * 		{object|false} status Current update status
 * }
 * themeUpdate: PropTypes.shape( {
		state: PropTypes.oneOf( [ 'uninitialized', 'failure', 'success', 'pending' ] ),
		error: PropTypes.object,
	} )
 * @param {array}  itemList Collection of plugins/themes that will be updated.
 * @param {number} siteId   ID of the site where the plugin/theme is installed.
 * @param {object} state    App state tree.
 *
 * @returns {array} List of plugins/themes to update with their status.
 */
const makeUpdatableList = ( itemList, siteId, state = null ) =>
	itemList.map( item => ( {
		...item,
		updateStatus:
			'plugin' === item.type
				? getStatusForPlugin( state, siteId, item.id )
				: getStatusForTheme( siteId, item.slug ),
	} ) );

/**
 * Start updating the theme on the specified site.
 *
 * @param {number} siteId  Site Id.
 * @param {string} themeId Theme slug.
 *
 * @return {*} Stored data container for request.
 */
const updateTheme = ( siteId, themeId ) =>
	requestHttpData(
		`theme-update-${ siteId }-${ themeId }`,
		http( {
			method: 'POST',
			path: `/sites/${ siteId }/themes`,
			body: { action: 'update', themes: themeId },
		} ),
		{
			fromApi: () => ( { themes } ) => themes.map( ( { id } ) => [ id, true ] ),
			freshness: -Infinity,
		}
	);

const mapStateToProps = ( state, { siteId, plugins, themes } ) => {
	const site = getSite( state, siteId );
	return {
		siteId,
		siteSlug: site.slug,
		siteName: site.name,
		pluginsWithUpdate: makeUpdatableList( plugins, siteId, state ),
		themesWithUpdate: makeUpdatableList( themes, siteId ),
	};
};

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	updateSingle: item =>
		'plugin' === item.type
			? dispatch( updatePlugin( siteId, item ) )
			: updateTheme( siteId, item.slug ),
	showErrorNotice: ( error, options ) => dispatch( errorNotice( error, options ) ),
	showInfoNotice: ( info, options ) => dispatch( infoNotice( info, options ) ),
	showSuccessNotice: ( success, options ) => dispatch( successNotice( success, options ) ),
	trackUpdatePlugin: plugin_slug =>
		dispatch( recordTracksEvent( 'calypso_activitylog_tasklist_update_plugin', { plugin_slug } ) ),
	trackUpdatePluginFromError: plugin_slug =>
		dispatch(
			recordTracksEvent( 'calypso_activitylog_tasklist_update_plugin_from_error', { plugin_slug } )
		),
	trackUpdateAll: () =>
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
	goToPage: ( slug, type, siteSlug ) =>
		dispatch(
			'plugin' === type
				? withAnalytics(
						recordTracksEvent( 'calypso_activitylog_tasklist_manage_single_plugin' ),
						navigate( `/plugins/${ slug }/${ siteSlug }` )
					)
				: withAnalytics(
						recordTracksEvent( 'calypso_activitylog_tasklist_manage_single_theme' ),
						navigate( `/theme/${ slug }/${ siteSlug }` )
					)
		),
} );

export default WithItemsToUpdate(
	connect( mapStateToProps, mapDispatchToProps )( localize( ActivityLogTasklist ) )
);
