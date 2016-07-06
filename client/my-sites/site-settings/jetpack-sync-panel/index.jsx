/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import get from 'lodash/get';
import throttle from 'lodash/throttle';
import reduce from 'lodash/reduce';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import Notice from 'components/notice';
import ProgressBar from 'components/progress-bar';
import { getSyncStatus, scheduleJetpackFullysync } from 'state/jetpack-sync/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { selectSyncStatus, selectFullSyncRequest } from 'state/jetpack-sync/selectors';

/*
 * Module variables
 */

const JetpackSyncPanel = React.createClass( {
	displayName: 'JetpackSyncPanel',

	componentWillMount() {
		this.throttledPoller = throttle( this.fetchSyncStatus, 4000 );
		this.fetchSyncStatus();
	},

	componentWillReceiveProps( nextProps ) {
		const isNewlyScheduled = get( nextProps, 'fullSyncRequest.scheduled' ) && ! get( this.props, 'fullSyncRequest.scheduled' );
		const isFinished = get( nextProps, 'syncStatus.finished' );
		const isStarted = get( nextProps, 'syncStatus.started' );
		const isScheduled = get( nextProps, 'syncStatus.is_scheduled' );

		if ( isNewlyScheduled ) {
			this.throttledPoller();
		} else if ( isScheduled || ( isStarted && ! isFinished ) ) {
			this.throttledPoller();
		}
	},

	isPendingSyncStart() {
		// Is the sync scheduled and awaiting cron?
		const isScheduled = get( this.props, 'syncStatus.is_scheduled' );
		if ( isScheduled ) {
			return true;
		}

		// Have we requested a full sync from Calypso?
		const requestingFullSync = get( this.props, 'fullSyncRequest.isRequesting' ) || get( this.props, 'fullSyncRequest.scheduled' );
		if ( ! requestingFullSync ) {
			return false;
		}

		// If we have requested a full sync, is that request newer than the last time we received sync status?
		const lastRequested = get( this.props, 'fullSyncRequest.lastRequested' );
		const lastSuccessfulStatus = get( this.props, 'syncStatus.lastSuccessfulStatus' );

		if ( ! lastRequested ) {
			return false;
		} else if ( ! lastSuccessfulStatus ) {
			return true;
		}

		return lastRequested > lastSuccessfulStatus;
	},

	isFullSyncing() {
		const isFinished = get( this.props, 'syncStatus.finished' );
		const isStarted = get( this.props, 'syncStatus.started' );

		return isStarted && ! isFinished;
	},

	shouldDisableSync() {
		return this.isFullSyncing() || this.isPendingSyncStart();
	},

	fetchSyncStatus() {
		this.props.getSyncStatus( this.props.siteId );
	},

	onSyncRequestButtonClick( event ) {
		event.preventDefault();
		this.props.scheduleJetpackFullysync( this.props.siteId );
	},

	renderStatusNotice() {
		const classes = classNames( 'jetpack-sync-panel__notice' );
		return (
			<Notice isCompact className={ classes }>
				Placeholder text
			</Notice>
		);
	},

	renderProgressBar() {
		if ( ! this.shouldDisableSync() ) {
			return null;
		}

		const queued = get( this.props, 'syncStatus.queue' );
		const sent = get( this.props, 'syncStatus.sent' );

		if ( this.isPendingSyncStart() || ! queued || ! sent ) {
			return (
				<ProgressBar value={ 0 } />
			);
		}

		const countQueued = reduce( queued, ( sum, value ) => {
			return sum += value;
		}, 0 );

		const countSent = reduce( sent, ( sum, value ) => {
			return sum += value;
		}, 0 );

		return (
			<ProgressBar
				value={ countSent }
				total={ countQueued }
			/>
		);
	},

	render() {
		return (
			<Card className="jetpack-sync-panel">
				<div className="jetpack-sync-panel__action-group">
					<div className="jetpack-sync-panel__description">
						{ this.translate(
							'{{strong}}Jetpack Sync keeps your WordPress.com dashboard up to date.{{/strong}} ' +
							'Data is sent from your site to the WordPress.com dashboard regularly to provide a faster experience. ' +
							'If you suspect some data is missing, you can initiate a sync manually.',
							{
								components: {
									strong: <strong />
								}
							}
						) }
					</div>

					<div className="jetpack-sync-panel__action">
						<Button onClick={ this.onSyncRequestButtonClick } disabled={ this.shouldDisableSync() }>
							{ this.translate( 'Perform full sync', { context: 'Button' } ) }
						</Button>
					</div>
				</div>

				{ this.renderStatusNotice() }
				{ this.renderProgressBar() }
			</Card>
		);
	}
} );

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			syncStatus: selectSyncStatus( state ),
			fullSyncRequest: selectFullSyncRequest( state )
		};
	},
	dispatch => bindActionCreators( { getSyncStatus, scheduleJetpackFullysync }, dispatch )
)( JetpackSyncPanel );
