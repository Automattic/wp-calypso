/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import { recordTracksEvent } from 'lib/analytics/tracks';

export default localize( ( props ) => {
	const { date, registrationUrl, isBusinessPlanUser, translate } = props;

	const trackRegistrationClick = () => {
		recordTracksEvent( 'calypso_help_course_registration_click', {
			registration_url: registrationUrl,
			is_business_plan_user: isBusinessPlanUser,
		} );
	};

	return (
		<Card compact className="help-courses__course-schedule-item">
			<p className="help-courses__course-schedule-item-date">
				<Gridicon className="help-courses__course-schedule-item-icon" icon="time" size={ 18 } />
				{ translate( '%(date)s at %(time)s', {
					args: {
						date: date.format( 'dddd, MMMM D' ),
						time: date.format( 'LT zz' ),
					},
				} ) }
			</p>
			<div className="help-courses__course-schedule-item-buttons">
				{ isBusinessPlanUser ? (
					<Button
						className="help-courses__course-schedule-item-register-button"
						onClick={ trackRegistrationClick }
						target="_blank"
						rel="noopener noreferrer"
						href={ registrationUrl }
					>
						{ translate( 'Register' ) }
					</Button>
				) : (
					<div className="help-courses__course-schedule-item-businessplan-button">
						{ translate( 'Only on Business Plan' ) }
					</div>
				) }
			</div>
		</Card>
	);
} );
