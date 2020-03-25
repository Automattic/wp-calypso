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
		const { allowRestore, moment, realtimeEvents, siteSlug, translate } = this.props;

		//const realtimeEvents = this.props.realtimeEvents.filter( event => event.activityIsRewindable );

		const cards = realtimeEvents.map( activity => (
			<ActivityCard
				{ ...{
					key: activity.activityId,
					moment,
					activity,
					allowRestore,
					siteSlug,
				} }
			/>
		) );

		return (
			<div className="backup-delta__realtime">
				<div className="backup-delta__realtime-header">
					{ translate( 'More backups from today' ) }
				</div>
				<div className="backup-delta__realtime-description">
					{ translate(
						'Your site is backed up in real time (as you make changes) as well as in one daily backup.'
					) }
				</div>
				{ !! cards.length && <div className="backup-delta__realtime-cards">{ cards }</div> }
			</div>
		);
	}

	renderDaily() {
		const { backupAttempts, deltas, siteSlug, translate } = this.props;
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

		const hasChanges = !! ( deltas.posts.length || deltas.mediaCreated.length );

		return (
			<div className="backup-delta__daily">
				{ hasChanges && <div>{ translate( 'Backup details' ) }</div> }
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
				{ hasChanges && <div>{ meta }</div> }
				{ mainBackup && (
					<Button
						className="backup-delta__view-all-button"
						href={ `/backups/${ siteSlug }/detail/${ mainBackup.rewindId }` }
					>
						{ translate( 'View all backup details' ) }
					</Button>
				) }
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
