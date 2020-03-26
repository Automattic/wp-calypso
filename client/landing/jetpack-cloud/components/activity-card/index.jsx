/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import { Card } from '@automattic/components';
import ActivityActor from 'my-sites/activity/activity-log-item/activity-actor';
import ActivityDescription from 'my-sites/activity/activity-log-item/activity-description';

/**
 * Style dependencies
 */
import './style.scss';

class ActivityCard extends Component {
	render() {
		const { activity, moment, allowRestore } = this.props;

		return (
			<div className="activity-card">
				<div className="activity-card__time">
					<Gridicon icon="cloud-upload" />
					{ moment( activity.activityDate ).format( 'LT' ) }
				</div>
				<Card>
					<ActivityActor
						{ ...{
							actorAvatarUrl: activity.actorAvatarUrl,
							actorName: activity.actorName,
							actorRole: activity.actorRole,
							actorType: activity.actorType,
						} }
					/>
					<ActivityDescription activity={ activity } rewindIsActive={ allowRestore } />
					<div>{ activity.activityTitle }</div>
					<div>
						<Button compact borderless>
							See content <Gridicon icon="chevron-down" />
						</Button>
						<Button compact borderless>
							Actions <Gridicon icon="add" />
						</Button>
					</div>
				</Card>
			</div>
		);
	}
}

export default ActivityCard;
