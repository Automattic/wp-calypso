/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import debugModule from 'debug';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Button from 'components/button';
import Notice from 'components/notice';
import ProgressBar from 'components/progress-bar';
import { getSelectedSiteId } from 'state/ui/selectors';
import syncSelectors from 'state/jetpack-sync/selectors';
import {
	getSyncStatus,
	scheduleJetpackFullysync
} from 'state/jetpack-sync/actions';
import Interval, { EVERY_FIVE_SECONDS } from 'lib/interval';
import NoticeAction from 'components/notice/notice-action';

/*
 * Module variables
 */
const debug = debugModule( 'calypso:site-settings:jetpack-sync-panel' );

const JetpackSyncPanel = React.createClass( {
	displayName: 'JetpackSyncPanel',

	componentWillMount() {
		this.fetchSyncStatus();
	},

	fetchSyncStatus() {
		this.props.getSyncStatus( this.props.siteId );
	},

	isErrored() {
		const isErrored = get( this.props, 'syncStatus.error' ) || get( this.props, 'fullSyncRequest.error' );
		return !! isErrored;
	},

	shouldDisableSync() {
		return !! ( this.props.isFullSyncing || this.props.isPendingSyncStart );
	},

	onSyncRequestButtonClick( event ) {
		event.preventDefault();
		debug( 'Perform full sync button clicked' );
		this.props.scheduleJetpackFullysync( this.props.siteId );
	},

	onTryAgainClick( event ) {
		event.preventDefault();
		debug( 'Try again button clicked' );
		this.props.scheduleJetpackFullysync( this.props.siteId );
	},

	renderErrorNotice() {
		const syncRequestError = get( this.props, 'fullSyncRequest.error' );
		if ( ! syncRequestError ) {
			return null;
		}

		return (
			<Notice isCompact status="is-error" className="jetpack-sync-panel__error-notice">
				{
					syncRequestError.message
					? syncRequestError.message
					: this.translate( 'There was an error scheduling a full sync.' )
				}
				{
					// We show a Try again action for a generic error on the assumption
					// that the error was a network issue.
					//
					// If an error message was returned from the API, then there's likely
					// a good reason the request failed, such as an unauthorized user.
					! syncRequestError.message &&
					<NoticeAction onClick={ this.onTryAgainClick }>
						{ this.translate( 'Try again' ) }
					</NoticeAction>
				}
			</Notice>
		);
	},

	renderStatusNotice() {
		if ( this.isErrored() ) {
			return null;
		}

		const finished = get( this.props, 'syncStatus.finished' );
		const finishedTimestamp = this.moment( parseInt( finished, 10 ) * 1000 );
		let text = '';
		if ( this.shouldDisableSync() ) {
			text = this.translate( 'Full sync in progress' );
		} else if ( finishedTimestamp.isValid() ) {
			text = this.translate( 'Last synced %(ago)s', {
				args: {
					ago: finishedTimestamp.fromNow()
				}
			} );
		}

		if ( ! text ) {
			return null;
		}

		return (
			<Notice isCompact className="jetpack-sync-panel__status-notice">
				{ text }
			</Notice>
		);
	},

	renderProgressBar() {
		if ( ! this.shouldDisableSync() || this.isErrored() ) {
			return null;
		}

		return (
			<ProgressBar value={ this.props.syncProgress || 0 } />
		);
	},

	render() {
		return (
			<CompactCard className="jetpack-sync-panel">
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

				{ this.renderErrorNotice() }
				{ this.renderStatusNotice() }
				{ this.renderProgressBar() }
				{ this.shouldDisableSync() && <Interval onTick={ this.fetchSyncStatus } period={ EVERY_FIVE_SECONDS } /> }
			</CompactCard>
		);
	}
} );

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		return {
			siteId,
			syncStatus: syncSelectors.getSyncStatus( state, siteId ),
			fullSyncRequest: syncSelectors.getFullSyncRequest( state, siteId ),
			isPendingSyncStart: syncSelectors.isPendingSyncStart( state, siteId ),
			isFullSyncing: syncSelectors.isFullSyncing( state, siteId ),
			syncProgress: syncSelectors.getSyncProgressPercentage( state, siteId )
		};
	},
	dispatch => bindActionCreators( { getSyncStatus, scheduleJetpackFullysync }, dispatch )
)( JetpackSyncPanel );
