/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CourseScheduleItem from './course-schedule-item';

export default localize( ( props ) => {
	const {
		title,
		description,
		schedule,
		showRecentCourseRecordings,
		translate
	} = props;

	return (
		<div className="help-courses__course">
			<Card compact className="help-courses__course-label">{ translate( 'Next course' ) }</Card>
			<Card compact>
				<h1 className="help-courses__course-title">{ title }</h1>
				<p className="help-courses__course-description">{ description }</p>
			</Card>
			{ schedule.map( ( item, key ) => <CourseScheduleItem { ...item } key={ key } /> ) }
			{
				showRecentCourseRecordings &&
				<Card className="help-courses__course-recording">
					Show most recent recording here
				</Card>
			}
		</div>
	);
} );

export const CoursePlaceholder = () => {
	return (
		<div className="help-courses__course is-placeholder"></div>
	);
};
