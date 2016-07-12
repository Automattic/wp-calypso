/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import debugModule from 'debug';
import { get,throttle } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import Notice from 'components/notice';
import ProgressBar from 'components/progress-bar';
import { getSelectedSiteId } from 'state/ui/selectors';
import syncSelectors from 'state/jetpack-sync/selectors';
import {
	getSyncStatus,
	scheduleJetpackFullysync
} from 'state/jetpack-sync/actions';

/*
 * Module variables
 */
const debug = debugModule( 'calypso:site-settings:jetpack-sync-panel' );

const JetpackSyncPanel = React.createClass( {
	displayName: 'JetpackSyncPanel',

	componentWillMount() {
		// Created a throttled fetch function that will run a maximum of once for every 4 seconds.
		this.throttledPoller = throttle( this.fetchSyncStatus, 4000 );
		this.fetchSyncStatus();
	},

	componentWillUnmount() {
		this.throttledPoller.cancel();
	},

	componentWillReceiveProps() {
		// Since the polling is throttled, let's trigger every time that we get props.
		this.throttledPoller();
	},

	fetchSyncStatus() {
		this.props.getSyncStatus( this.props.siteId );
	},

	shouldDisableSync() {
		return !! ( this.props.isFullSyncing || this.props.isPendingSyncStart );
	},

	onSyncRequestButtonClick( event ) {
		event.preventDefault();
		debug( 'Perform full sync button clicked' );
		this.props.scheduleJetpackFullysync( this.props.siteId );
	},

	renderStatusNotice() {
		const finished = get( this.props, 'syncStatus.finished' );
		const finishedTimestamp = this.moment( parseInt( finished, 10 ) * 1000 );
		let text = '';
		if ( this.shouldDisableSync() ) {
			text = this.translate( 'Full sync in progress' );
		} else if ( finishedTimestamp.isValid() ) {
			text = this.translate( 'Last syned %(ago)s', {
				args: {
					ago: finishedTimestamp.fromNow()
				}
			} );
		}

		if ( ! text ) {
			return null;
		}

		return (
			<Notice isCompact className={ classNames( 'jetpack-sync-panel__notice' ) }>
				{ text }
			</Notice>
		);
	},

	renderProgressBar() {
		if ( ! this.shouldDisableSync() ) {
			return null;
		}

		return (
			<ProgressBar value={ this.props.syncProgress || 0 } />
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
			syncStatus: syncSelectors.getSyncStatus( state, siteId ),
			fullSyncRequest: syncSelectors.getFullSyncRequest( state, siteId ),
			isPendingSyncStart: syncSelectors.isPendingSyncStart( state, siteId ),
			isFullSyncing: syncSelectors.isFullSyncing( state, siteId ),
			syncProgress: syncSelectors.getSyncProgressPercentage( state, siteId )
		};
	},
	dispatch => bindActionCreators( { getSyncStatus, scheduleJetpackFullysync }, dispatch )
)( JetpackSyncPanel );
