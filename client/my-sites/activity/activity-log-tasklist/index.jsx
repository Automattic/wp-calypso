/* eslint-disable wpcalypso/i18n-mismatched-placeholders */

import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SplitButton from 'calypso/components/split-button';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { decodeEntities } from 'calypso/lib/formatting';
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';
import { updatePlugin } from 'calypso/state/plugins/installed/actions';
import { getStatusForPlugin } from 'calypso/state/plugins/installed/selectors';
import { PLUGIN_INSTALLATION_COMPLETED } from 'calypso/state/plugins/installed/status/constants';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSite, getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import WithItemsToUpdate from './to-update';
import ActivityLogTaskUpdate from './update';

import './style.scss';

/**
 * Checks if the plugin, theme or core update is enqueued to be updated, searching it in the list by its slug.
 *
 * @param {string} updateSlug  Plugin or theme slug, or 'wordpress' for core updates.
 * @param {Array}  updateQueue Collection of plugins or themes currently queued to be updated.
 * @returns {boolean}   True if the plugin or theme is enqueued to be updated.
 */
const isItemEnqueued = ( updateSlug, updateQueue ) =>
	updateQueue.some( ( item ) => item.slug === updateSlug );

const union = ( ...arrays ) => [ ...new Set( [].concat( ...arrays ) ) ];

const MAX_UPDATED_TO_SHOW = 3;

class ActivityLogTasklist extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		plugins: PropTypes.arrayOf( PropTypes.object ), // Plugins updated and those with pending updates
		themes: PropTypes.arrayOf( PropTypes.object ), // Themes to update
		core: PropTypes.arrayOf( PropTypes.object ), // New WP core version
		siteAdminUrl: PropTypes.string,
		jetpackNonAtomic: PropTypes.bool,

		// Connected props
		siteName: PropTypes.string.isRequired,
		trackUpdateAll: PropTypes.func.isRequired,
		goToPage: PropTypes.func.isRequired,
		updateSingle: PropTypes.func.isRequired,
		trackUpdate: PropTypes.func.isRequired,
		trackDismissAll: PropTypes.func.isRequired,
		trackDismiss: PropTypes.func.isRequired,
		goManagePlugins: PropTypes.func.isRequired,

		// Localize
		translate: PropTypes.func.isRequired,
		showErrorNotice: PropTypes.func.isRequired,
		showInfoNotice: PropTypes.func.isRequired,
		showSuccessNotice: PropTypes.func.isRequired,
	};

	state = {
		dismissed: [],
		queued: [],
		itemUpdating: false,
		expandedView: false,
	};

	/**
	 * Adds a single or multiple plugin or theme slugs to a list of dismissed items.
	 * If it receives a string, it assumes it's a valid plugin or theme slug and adds it to the dismissed list.
	 * When it doesn't receive a string, it adds all the plugin and theme slugs to the dismissed list.
	 *
	 * @param {Object} item Plugin or theme to dismiss.
	 */
	dismiss = ( item ) => {
		// ToDo: this should update some record in the tasklist API
		const { plugins, themes, core, trackDismiss, trackDismissAll } = this.props;
		let items;

		if ( 'string' === typeof item.slug ) {
			items = [ item.slug ];
			trackDismiss( item );
		} else {
			items = union( plugins, themes, core ).map( ( it ) => it.slug );
			trackDismissAll();
		}

		this.setState( {
			dismissed: union( this.state.dismissed, items ),
		} );
	};

	/**
	 * Goes to general plugin management screen.
	 *
	 * @returns {Object} Action to redirect to plugins management.
	 */
	goManagePlugins = () =>
		this.props.goManagePlugins(
			this.props.siteSlug,
			this.props.siteAdminUrl,
			this.props.jetpackNonAtomic
		);

	/**
	 * Goes to single theme or plugin management screen.
	 *
	 * @param {string} slug Plugin or theme slug, like "hello-dolly" or "dara".
	 * @param {string} type Indicates if it's "plugin" or "theme".
	 * @returns {Object} Action to redirect to plugin management.
	 */
	goToPage = ( slug, type ) => this.props.goToPage( slug, type, this.props.siteSlug );

	/**
	 * Checks if the plugin update queue has more items and none is currently updating.
	 * If so, updates the next plugin.
	 */
	continueQueue = () => {
		if ( 0 < this.state.queued.length && ! this.state.itemUpdating ) {
			this.updateItem( this.state.queued[ 0 ] );
		}
	};

	/**
	 * Add a plugin, theme, or core update to the update queue. Insert a prop to track enqueue origin later.
	 *
	 * @param {Object} item Plugin, theme, or core update to enqueue.
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
	finishUpdate = () =>
		this.setState(
			{
				queued: this.state.queued.slice( 1 ),
				itemUpdating: false,
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
				queued: union( this.state.queued, this.props.core, this.props.plugins, this.props.themes ),
			},
			this.continueQueue
		);
	};
	/**
	 * Expand the list of updates to show all of them
	 *
	 * @param {Object} event Synthetic event
	 */
	showAllUpdates = ( event ) => {
		recordTracksEvent( 'calypso_activitylog_tasklist_expand_view' );
		this.setState( { expandedView: true } );
		event.preventDefault();
	};

	/**
	 * Starts the update process for a specified plugin/theme. Displays an informational notice.
	 *
	 * @param {Object} item Plugin/theme information that includes
	 * {
	 * 		{string} slug Plugin or theme slug, like "hello-dolly". Slug for core updates is "wordpress".
	 * 		{string} name Plugin or theme name, like "Hello Dolly". Name for core updates is "WordPress".
	 * }
	 */
	updateItem = ( item ) => {
		const {
			showInfoNotice,
			showSuccessNotice,
			showErrorNotice,
			siteId,
			siteName,
			updateSingle,
			translate,
			trackUpdate,
		} = this.props;

		// if the item was enqueued by `updateAll` it has no `from` field because we don't want
		// to record a track event for each item individually.
		if ( item.from !== undefined ) {
			trackUpdate( item );
		}

		showInfoNotice(
			translate( 'Updating %(item)s on %(siteName)s.', {
				args: { item: decodeEntities( item.name ), siteName },
			} ),
			{
				id: `alitemupdate-${ item.slug }`,
				showDismiss: false,
			}
		);

		this.setState( { itemUpdating: true } );

		updateSingle( item, siteId )
			.then( () => {
				showSuccessNotice(
					translate( 'Successfully updated %(item)s on %(siteName)s.', {
						args: { item: decodeEntities( item.name ), siteName },
					} ),
					{
						id: `alitemupdate-${ item.slug }`,
						duration: DEFAULT_NOTICE_DURATION,
					}
				);
				this.dismiss( item );
			} )
			.catch( () => {
				showErrorNotice(
					translate( 'An error occurred while updating %(item)s on %(siteName)s.', {
						args: { item: decodeEntities( item.name ), siteName },
					} ),
					{
						id: `alitemupdate-${ item.slug }`,
						button: translate( 'Try again' ),
						onClick: () => this.enqueue( item, '_from_error' ),
					}
				);
			} )
			.finally( () => {
				this.finishUpdate();
			} );
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
		const itemsToUpdate = union( this.props.core, this.props.plugins, this.props.themes ).filter(
			( item ) => ! this.state.dismissed.includes( item.slug )
		);

		if ( itemsToUpdate.length === 0 ) {
			return null;
		}

		const { translate } = this.props;
		const numberOfUpdates = itemsToUpdate.length;
		const queued = this.state.queued;
		const showExpandedView = this.state.expandedView || numberOfUpdates <= MAX_UPDATED_TO_SHOW;
		return (
			<Card className="activity-log-tasklist" highlight="warning">
				<TrackComponentView eventName="calypso_activitylog_tasklist_update_impression" />
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

const updateSingle = ( item, siteId ) => ( dispatch, getState ) => {
	switch ( item.type ) {
		case 'core':
			// No need to pass version as a param: if it's missing, WP will be updated to latest core version.
			return wpcom.req.post( `/sites/${ siteId }/core/update` ).then( ( response ) => {
				// When core is successfully updated, the response includes an array with the new version.
				if ( response.version[ 0 ] !== item.version ) {
					return Promise.reject( 'Core update failed' );
				}
			} );
		case 'plugin':
			return dispatch( updatePlugin( siteId, item ) ).then( () => {
				if ( getStatusForPlugin( getState(), siteId, item.id ) !== PLUGIN_INSTALLATION_COMPLETED ) {
					return Promise.reject( 'Plugin update failed' );
				}
			} );
		case 'theme':
			return wpcom.req
				.post( `/sites/${ siteId }/themes`, { action: 'update', themes: item.slug } )
				.then( ( response ) => {
					// When a theme successfully updates, the theme 'update' property is nullified.
					if ( response.themes[ 0 ].update !== null ) {
						return Promise.reject( 'Theme update failed' );
					}
				} );
	}
};

const mapStateToProps = ( state, { siteId } ) => {
	const site = getSite( state, siteId );
	return {
		siteSlug: site.slug,
		siteName: site.name,
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
		jetpackNonAtomic: isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ),
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	updateSingle: ( item, siteId ) => dispatch( updateSingle( item, siteId ) ),
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
	goManagePlugins: ( siteSlug, siteAdminUrl, jetpackNonAtomic ) => {
		dispatch( recordTracksEvent( 'calypso_activitylog_tasklist_manage_plugins' ) );

		// When Jetpack is self hosted show the Calypso Plugins Manage page.
		// Else, redirect to current site WP Admin.
		const managePluginsDestination = jetpackNonAtomic
			? `/plugins/manage/${ siteSlug }`
			: `${ siteAdminUrl }plugins.php`;
		page( managePluginsDestination );
	},
	goToPage: ( slug, type, siteSlug ) => {
		const tracksEvent =
			'plugin' === type
				? 'calypso_activitylog_tasklist_manage_single_plugin'
				: 'calypso_activitylog_tasklist_manage_single_theme';
		dispatch( recordTracksEvent( tracksEvent ) );
		page( `/plugins/${ slug }/${ siteSlug }` );
	},
} );

export default WithItemsToUpdate(
	connect( mapStateToProps, mapDispatchToProps )( localize( ActivityLogTasklist ) )
);
