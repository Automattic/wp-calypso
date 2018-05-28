/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityIcon from '../activity-log-item/activity-icon';
import Gravatar from 'components/gravatar';

class ActivityLogDemo extends Component {
	render() {
		return (
			<section className="activity-log__wrapper">
				<div className="activity-log-item">
					<div className="activity-log-item__type">
						<div className="activity-log-item__time">6:38PM</div>
						<ActivityIcon activityIcon="posts" activityStatus="success" />
					</div>

					<div className="card foldable-card activity-log-item__card">
						<div className="foldable-card__header">
							<span className="foldable-card__main">
								<div className="activity-log-item__card-header">
									<div className="activity-log-item__actor">
										<Gravatar />
										<div className="activity-log-item__actor-info">
											<div className="activity-log-item__actor-name">Filipe Varela</div>
											<div className="activity-log-item__actor-role">administrator</div>
										</div>
									</div>
									<div className="activity-log-item__description">
										<div className="activity-log-item__description-content">
											My journey through Asia
										</div>
										<div className="activity-log-item__description-summary">Post published</div>
									</div>
								</div>
							</span>
						</div>
					</div>
				</div>

				<div className="activity-log-item">
					<div className="activity-log-item__type">
						<div className="activity-log-item__time">4:20PM</div>
						<ActivityIcon activityIcon="comment" activityStatus="warning" />
					</div>

					<div className="card foldable-card activity-log-item__card">
						<div className="foldable-card__header">
							<span className="foldable-card__main">
								<div className="activity-log-item__card-header">
									<div className="activity-log-item__actor">
										<Gravatar />
										<div className="activity-log-item__actor-info">
											<div className="activity-log-item__actor-name">John Doe</div>
										</div>
									</div>
									<div className="activity-log-item__description">
										<div className="activity-log-item__description-content">
											Lovely summer photos
										</div>
										<div className="activity-log-item__description-summary">
											Comment awaiting approval
										</div>
									</div>
								</div>
							</span>
						</div>
					</div>
				</div>

				<div className="activity-log-item">
					<div className="activity-log-item__type">
						<div className="activity-log-item__time">3:10PM</div>
						<ActivityIcon activityIcon="posts" />
					</div>

					<div className="card foldable-card activity-log-item__card">
						<div className="foldable-card__header">
							<span className="foldable-card__main">
								<div className="activity-log-item__card-header">
									<div className="activity-log-item__actor">
										<Gravatar />
										<div className="activity-log-item__actor-info">
											<div className="activity-log-item__actor-name">Filipe Varela</div>
											<div className="activity-log-item__actor-role">administrator</div>
										</div>
									</div>
									<div className="activity-log-item__description">
										<div className="activity-log-item__description-content">
											My journey through Asia
										</div>
										<div className="activity-log-item__description-summary">
											Post draft modified
										</div>
									</div>
								</div>
							</span>
						</div>
					</div>
				</div>
			</section>
		);
	}
}

export default localize( ActivityLogDemo );
