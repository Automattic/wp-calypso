/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityCard from 'calypso/components/activity-card';

/**
 * Style dependencies
 */
import './style.scss';

class BackupDelta extends Component {
	renderRealtime() {
		const { realtimeBackups, translate, isToday } = this.props;

		const cards = realtimeBackups.map( ( activity ) => (
			<ActivityCard activity={ activity } key={ activity.activityId } />
		) );

		return (
			<div className="backup-delta__realtime">
				<div className="backup-delta__realtime-header">
					{ isToday
						? translate( 'More backups from today' )
						: translate( 'More backups from this day' ) }
				</div>
				<div className="backup-delta__realtime-description">
					{ translate(
						'Your site is backed up in real time (as you make changes) as well as in one daily backup.'
					) }
				</div>
				{ cards.length ? (
					cards
				) : (
					<div className="backup-delta__realtime-emptyday">
						{ translate( 'There were no changes on this day. Your daily backup is above.' ) }
					</div>
				) }
			</div>
		);
	}

	render() {
		return <div className="backup-delta">{ this.renderRealtime() }</div>;
	}
}

export default localize( BackupDelta );
