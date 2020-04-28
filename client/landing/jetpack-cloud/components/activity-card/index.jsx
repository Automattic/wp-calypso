/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import classnames from 'classnames';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { applySiteOffset } from 'lib/site/timezone';
import { Card } from '@automattic/components';
import ActivityActor from 'my-sites/activity/activity-log-item/activity-actor';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

class ActivityCard extends Component {
	render() {
		const { activity, className, gmtOffset, summarize, timezone, children } = this.props;

		const backupTimeDisplay = applySiteOffset( activity.activityTs, {
			timezone,
			gmtOffset,
		} ).format( 'LT' );

		return (
			<div className={ classnames( className, 'activity-card' ) }>
				{ ! summarize && (
					<div className="activity-card__time">
						<Gridicon icon={ activity.activityIcon } className="activity-card__time-icon" />
						<div className="activity-card__time-text">{ backupTimeDisplay }</div>
					</div>
				) }
				<Card>
					<ActivityActor
						{ ...{
							actorAvatarUrl: activity.actorAvatarUrl,
							actorName: activity.actorName,
							actorRole: activity.actorRole,
							actorType: activity.actorType,
						} }
					/>
					{ children }
				</Card>
			</div>
		);
	}
}

export default localize( ActivityCard );
