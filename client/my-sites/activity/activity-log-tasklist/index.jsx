/* eslint-disable wpcalypso/i18n-mismatched-placeholders */
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
import { Card } from '@automattic/components';
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
import { decodeEntities } from 'lib/formatting';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Checks if the supplied core update, plugins, or themes are being updated.
 *
 * @param {Array} updatables List of plugin, theme or core update objects to check their update status.
 *
 * @returns {boolean}  True if one or more plugins or themes are updating.
 */
const isItemUpdating = ( updatables ) =>
	updatables.some( ( item ) => 'inProgress' === get( item, 'updateStatus.status' ) );

/**
 * Checks if the plugin, theme or core update is enqueued to be updated, searching it in the list by its slug.
 *
 * @param {string} updateSlug  Plugin or theme slug, or 'wordpress' for core updates.
 * @param {Array}  updateQueue Collection of plugins or themes currently queued to be updated.
 *
 * @returns {boolean}   True if the plugin or theme is enqueued to be updated.
 */
const isItemEnqueued = ( updateSlug, updateQueue ) => !! find( updateQueue, { slug: updateSlug } );

const MAX_UPDATED_TO_SHOW = 3;

class ActivityLogTasklist extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		plugins: PropTypes.arrayOf( PropTypes.object ), // Plugins updated and those with pending updates
		themes: PropTypes.arrayOf( PropTypes.object ), // Themes to update
		core: PropTypes.arrayOf( PropTypes.object ), // New WP core version

		// Connected props
		siteName: PropTypes.string.isRequired,
		trackUpdateAll: PropTypes.func.isRequired,
		goToPage: PropTypes.func.isRequired,
		updateSingle: PropTypes.func.isRequired,
		trackUpdate: PropTypes.func.isRequired,
		trackDismissAll: PropTypes.func.isRequired,
		trackDismiss: PropTypes.func.isRequired,

		// WordPress core
		coreWithUpdate: PropTypes.arrayOf( PropTypes.object ).isRequired,

		// Plugins already updated + those with pending updates.
		// This extends plugins with the plugin update status.
		pluginWithUpdate: PropTypes.arrayOf( PropTypes.object ).isRequired,
		goManagePlugins: PropTypes.func.isRequired,

		// Themes
		themeWithUpdate: PropTypes.arrayOf( PropTypes.object ).isRequired,

		// Localize
		translate: PropTypes.func.isRequired,
		showErrorNotice: PropTypes.func.isRequired,
		showInfoNotice: PropTypes.func.isRequired,
		showSuccessNotice: PropTypes.func.isRequired,
	};

	state = {
		dismissed: [],
		queued: [],
		expandedView: false,
	};

	/**
	 * Adds a single or multiple plugin or theme slugs to a list of dismissed items.
	 * If it receives a string, it assumes it's a valid plugin or theme slug and adds it to the dismissed list.
	 * When it doesn't receive a string, it adds all the plugin and theme slugs to the dismissed list.
	 *
	 * @param {object} item Plugin or theme to dismiss.
	 */
	dismiss = ( item ) => {
		// ToDo: this should update some record in the tasklist API
		const {
			pluginWithUpdate,
			themeWithUpdate,
			coreWithUpdate,
			trackDismiss,
			trackDismissAll,
		} = this.props;
		let items;

		if ( 'string' === typeof item.slug ) {
			items = [ item.slug ];
			trackDismiss( item );
		} else {
			items = union(
				pluginWithUpdate.map( ( plugin ) => plugin.slug ),
				themeWithUpdate.map( ( theme ) => theme.slug ),
				// Although core doesn't have a slug, we call it 'wordpress'
				// to work with it like plugins or themes.
				coreWithUpdate.map( ( core ) => core.slug )
			);
			trackDismissAll();
		}

		this.setState( {
			dismissed: union( this.state.dismissed, items ),
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
	 * @param {string} type Indicates if it's "plugin" or "theme".
	 *
	 * @returns {object} Action to redirect to plugin management.
	 */
	goToPage = ( slug, type ) => this.props.goToPage( slug, type, this.props.siteSlug );

	/**
	 * Checks if the plugin update queue has more items and none is currently updating.
	 * If so, updates the next plugin.
	 */
	continueQueue = () => {
		const allUpdatableItems = union(
			this.props.coreWithUpdate,
			this.props.pluginWithUpdate,
			this.props.themeWithUpdate
		);
		if ( 0 < this.state.queued.length && ! isItemUpdating( allUpdatableItems ) ) {
			this.updateItem( this.state.queued[ 0 ] );
		}
	};

	/**
	 * Add a plugin, theme, or core update to the update queue. Insert a prop to track enqueue origin later.
	 *
	 * @param {object} item Plugin, theme, or core update to enqueue.
	 * @param {string} from Pass '_from_error' when calling from error notice. Otherwise it's empty.
	 */
	enqueue = ( item, from = '' ) => {
		item.from = from;
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
					this.props.coreWithUpdate,
					this.props.pluginWithUpdate,
					this.props.themeWithUpdate
				),
			},
			this.continueQueue
		);
	};
	/**
	 * Expand the list of updates to show all of them
	 *
	 * @param {object} event Synthetic event
	 */
	showAllUpdates = ( event ) => {
		recordTracksEvent( 'calypso_activitylog_tasklist_expand_view' );
		this.setState( { expandedView: true } );
		event.preventDefault();
	};

	/**
	 * Starts the update process for a specified plugin/theme. Displays an informational notice.
	 *
	 * @param {object} item Plugin/theme information that includes
	 * {
	 * 		{string} slug Plugin or theme slug, like "hello-dolly". Slug for core updates is "wordpress".
	 * 		{string} name Plugin or theme name, like "Hello Dolly". Name for core updates is "WordPress".
	 * }
	 */
	updateItem = ( item ) => {
		const { showInfoNotice, siteName, updateSingle, translate, trackUpdate } = this.props;

		trackUpdate( item );
		updateSingle( item );

		showInfoNotice(
			translate( 'Updating %(item)s on %(siteName)s.', {
				args: { item: decodeEntities( item.name ), siteName },
			} ),
			{
				id: `alitemupdate-${ item.slug }`,
				showDismiss: false,
			}
		);
	};

	componentDidMount() {
		const path = `/activity-log/${ this.props.siteSlug }`;
		page.exit( path, ( context, next ) => {
			if (
				! this.state.queued.length ||
				window.confirm( this.props.translate( 'Navigating away will cancel remaining updates' ) )
			) {
				return next();
			}
			setTimeout(
				() => page.replace( `/activity-log/${ this.props.siteSlug }`, null, false, false ),
				0
			);
		} );
	}

	componentDidUpdate( prevProps ) {
		const itemsWithUpdate = union(
			this.props.coreWithUpdate,
			this.props.pluginWithUpdate,
			this.props.themeWithUpdate
		);
		if ( isEmpty( itemsWithUpdate ) ) {
			return;
		}

		const { showErrorNotice, showSuccessNotice, siteName, translate } = this.props;

		each( itemsWithUpdate, ( item ) => {
			const { slug, updateStatus, type, name } = item;
			// Finds in prevProps.pluginWithUpdate, prevProps.themeWithUpdate or prevpros.coreWithUpdate
			const prevItemWithUpdate = find( prevProps[ `${ type }WithUpdate` ], { slug } );

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
				args: { item: decodeEntities( name ), siteName },
			};

			switch ( updateStatus.status ) {
				case 'error':
					showErrorNotice(
						translate( 'An error occurred while updating %(item)s on %(siteName)s.', noticeArgs ),
						{
							id: `alitemupdate-${ slug }`,
							button: translate( 'Try again' ),
							onClick: () => this.enqueue( item, '_from_error' ),
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
					this.dismiss( item );
					this.dequeue();
					break;
			}
		} );
	}

	showAllItemsToUpdate( itemsToUpdate ) {
		// Show if plugin update didn't start, is still running or errored,
		// but hide plugin if it was updated successfully.
		return itemsToUpdate.map( ( item ) => {
			return (
				<ActivityLogTaskUpdate
					key={ item.slug }
					toUpdate={ item }
					name={ item.name }
					slug={ item.slug }
					version={ item.version }
					type={ item.type }
					linked={ 'core' !== item.type }
					goToPage={ this.goToPage }
					siteSlug={ this.props.siteSlug }
					enqueue={ this.enqueue }
					dismiss={ this.dismiss }
					disable={ isItemEnqueued( item.slug, this.state.queued ) }
				/>
			);
		} );
	}

	showFooterToExpandAll( numberOfUpdates ) {
		const { translate } = this.props;
		const updatesHidden = numberOfUpdates - MAX_UPDATED_TO_SHOW;
		return (
			<div className="activity-log-tasklist__footer">
				<span>
					{ translate( 'One more update available', ' %(updates)s more updates available', {
						count: updatesHidden,
						args: { updates: updatesHidden },
					} ) }
				</span>
				<a onClick={ this.showAllUpdates } href="?expandedView">
					{ translate( 'Show All' ) }
				</a>
			</div>
		);
	}

	render() {
		const itemsToUpdate = union(
			this.props.coreWithUpdate,
			this.props.pluginWithUpdate,
			this.props.themeWithUpdate
		).filter( ( item ) => ! includes( this.state.dismissed, item.slug ) );

		if ( isEmpty( itemsToUpdate ) ) {
			return null;
		}

		const { translate } = this.props;
		const numberOfUpdates = itemsToUpdate.length;
		const queued = this.state.queued;
		const showExpandedView = this.state.expandedView || numberOfUpdates <= MAX_UPDATED_TO_SHOW;
		return (
			<Card className="activity-log-tasklist" highlight="warning">
				<TrackComponentView eventName={ 'calypso_activitylog_tasklist_update_impression' } />
				<div className="activity-log-tasklist__heading">
					{
						// Not using count method since we want a "one" string.
						1 < numberOfUpdates
							? translate(
									'You have %(updates)s update available',
									'You have %(updates)s updates available',
									{
										count: numberOfUpdates,
										args: { updates: numberOfUpdates },
									}
							  )
							: translate( 'You have one update available' )
					}
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
				{ showExpandedView && this.showAllItemsToUpdate( itemsToUpdate ) }
				{ ! showExpandedView &&
					this.showAllItemsToUpdate( itemsToUpdate.slice( 0, MAX_UPDATED_TO_SHOW ) ) }
				{ ! showExpandedView && this.showFooterToExpandAll( numberOfUpdates ) }
			</Card>
		);
	}
}

/**
 * Normalizes the state result so it's the same than plugins.
 * This normalization allows to reuse methods for plugins, themes, and core.
 *
 * @param {string}  state            Current state of update progress.
 * @param {boolean} isUpdateComplete If update actually produced what is expected to be after a successful update.
 *                                   In themes, the 'update' prop of the theme object is nullified when an update is succesful.
 *
 * @returns {boolean|object} False is update hasn't started. One of 'inProgress', 'error', 'completed', when
 * the update is running, failed, or was successfully completed, respectively.
 */
const getNormalizedStatus = ( state, isUpdateComplete ) => {
	if ( 'pending' === state ) {
		return { status: 'inProgress' };
	}
	if ( 'failure' === state ) {
		return { status: 'error' };
	}
	if ( 'success' === state ) {
		if ( isUpdateComplete ) {
			return { status: 'completed' };
		}
		return { status: 'error' };
	}
	return false;
};

/**
 * Converts statuses for network request for theme update into something matching the plugin update.
 *
 * @param {number} siteId  Site Id.
 * @param {string} themeId Theme slug.
 *
 * @returns {boolean|object} False is update hasn't started. One of 'inProgress', 'error', 'completed', when
 * the update is running, failed, or was successfully completed, respectively.
 */
const getStatusForTheme = ( siteId, themeId ) => {
	const httpData = getHttpData( `theme-update-${ siteId }-${ themeId }` );
	// When a theme successfully updates, the theme 'update' property is nullified.
	const isThemeUpdateComplete = null === get( httpData, 'data.themes.0.update' );
	return getNormalizedStatus( httpData.state, isThemeUpdateComplete );
};

/**
 * Get data about the status of a core update.
 *
 * @param {number} siteId      Site Id.
 * @param {string} coreVersion Version of core that the WP installation will be updated to.
 * @returns {boolean|object}      False is update hasn't started. One of 'inProgress', 'error', 'completed', when
 * the update is running, failed, or was successfully completed, respectively.
 */
const getStatusForCore = ( siteId, coreVersion ) => {
	const httpData = getHttpData( `core-update-${ siteId }` );
	// When core is successfully updated, the response includes an array with the new version.
	const isCoreUpdateComplete = coreVersion === get( httpData, 'data.version.0' );
	return getNormalizedStatus( httpData.state, isCoreUpdateComplete );
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
 *
 * @param {Array}  itemList Collection of plugins/themes that will be updated.
 * @param {number} siteId   ID of the site where the plugin/theme is installed.
 * @param {object} state    App state tree.
 *
 * @returns {Array} List of plugins/themes to update with their status.
 */
const makeUpdatableList = ( itemList, siteId, state = null ) =>
	itemList.map( ( item ) => ( {
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
 * @returns {*} Stored data container for request.
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

/**
 * Start updating WordPress core on the specified site.
 *
 * @param {number} siteId  Site Id.
 *
 * @returns {*} Stored data container for request.
 */
const updateCore = ( siteId ) =>
	requestHttpData(
		`core-update-${ siteId }`,
		http( {
			method: 'POST',
			path: `/sites/${ siteId }/core/update`,
			// No need to pass version: if it's missing, WP will be updated to latest core version.
		} ),
		{
			fromApi: () => ( { version } ) => {
				return [ [ version, true ] ];
			},
			freshness: -Infinity,
		}
	);

const mapStateToProps = ( state, { siteId, plugins, themes, core } ) => {
	const site = getSite( state, siteId );
	return {
		siteId,
		siteSlug: site.slug,
		siteName: site.name,
		pluginWithUpdate: makeUpdatableList( plugins, siteId, state ),
		themeWithUpdate: makeUpdatableList( themes, siteId ),
		coreWithUpdate: isEmpty( core )
			? []
			: [
					{
						...core[ 0 ],
						updateStatus: getStatusForCore( siteId, core[ 0 ].version ),
					},
			  ],
	};
};

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	updateSingle: ( item ) => {
		if ( 'core' === item.type ) {
			return updateCore( siteId );
		}
		return 'plugin' === item.type
			? dispatch( updatePlugin( siteId, item ) )
			: updateTheme( siteId, item.slug );
	},
	showErrorNotice: ( error, options ) => dispatch( errorNotice( error, options ) ),
	showInfoNotice: ( info, options ) => dispatch( infoNotice( info, options ) ),
	showSuccessNotice: ( success, options ) => dispatch( successNotice( success, options ) ),
	trackUpdate: ( { type, slug, from } ) =>
		dispatch(
			recordTracksEvent( `calypso_activitylog_tasklist_update_${ type }${ from }`, { slug } )
		),
	trackUpdateAll: () => dispatch( recordTracksEvent( 'calypso_activitylog_tasklist_update_all' ) ),
	trackDismissAll: () =>
		dispatch( recordTracksEvent( 'calypso_activitylog_tasklist_dismiss_all' ) ),
	trackDismiss: ( { type, slug } ) =>
		dispatch( recordTracksEvent( `calypso_activitylog_tasklist_dismiss_${ type }`, { slug } ) ),
	goManagePlugins: ( siteSlug ) =>
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
