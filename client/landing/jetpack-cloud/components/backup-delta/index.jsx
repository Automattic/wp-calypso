/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import ActivityCard from '../../components/activity-card';

/**
 * Style dependencies
 */
import './style.scss';

class BackupDelta extends Component {
	renderRealtime() {
		const { allowRestore, moment, translate } = this.props;

		const realtimeEvents = this.props.realtimeEvents.filter( event => event.activityIsRewindable );

		const cards = realtimeEvents.map( activity => (
			<ActivityCard
				{ ...{
					moment,
					activity,
					allowRestore,
				} }
			/>
		) );

		return (
			<div className="backup-delta__realtime">
				<div>{ translate( 'More backups from today' ) }</div>
				{ cards.length ? cards : <div>{ translate( 'you have no more backups for this day' ) }</div> }
			</div>
		);
	}

	renderDaily() {
		const { backupAttempts, deltas, translate } = this.props;
		const mainBackup = backupAttempts.complete && backupAttempts.complete[ 0 ];
		const meta = mainBackup && mainBackup.activityDescription[ 2 ].children[ 0 ];

		const media = deltas.mediaCreated.map( item => (
			<div key={ item.activityId }>
				<img alt="" src={ item.activityMedia.thumbnail_url } />
				<div>{ item.activityMedia.name }</div>
			</div>
		) );

		const posts = deltas.posts.map( item => {
			if ( 'post__published' === item.activityName ) {
				return (
					<div key={ item.activityId }>
						<Gridicon icon="pencil" />
						{ item.activityDescription[ 0 ].children[ 0 ] }
					</div>
				);
			}
			if ( 'post__trashed' === item.activityName ) {
				return (
					<div key={ item.activityId }>
						<Gridicon icon="cross" />
						{ item.activityDescription[ 0 ].children[ 0 ].text }
					</div>
				);
			}
		} );

		return (
			<div className="backup-delta__daily">
				<div>Backup details</div>
				{ !! deltas.mediaCreated.length && (
					<Fragment>
						<div>{ translate( 'Media' ) }</div>
						<div>{ media }</div>
					</Fragment>
				) }
				{ !! deltas.posts.length && (
					<Fragment>
						<div>{ translate( 'Posts' ) }</div>
						<div>{ posts }</div>
					</Fragment>
				) }
				<div>{ meta }</div>
				<Button className="backup-delta__view-all-button">
					{ translate( 'View all backup details' ) }
				</Button>
			</div>
		);
	}

	render() {
		const { hasRealtimeBackups } = this.props;

		return (
			<div className="backup-delta">
				{ hasRealtimeBackups ? this.renderRealtime() : this.renderDaily() }
			</div>
		);
	}
}

export default localize( BackupDelta );
