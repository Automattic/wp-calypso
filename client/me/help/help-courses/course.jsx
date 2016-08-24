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
import HelpTeaserButton from '../help-teaser-button';
import sitesList from 'lib/sites-list';

/**
 * Module variables
 */
const sites = sitesList();

export default localize( ( props ) => {
	const {
		title,
		description,
		schedule,
		isBusinessPlanUser,
		translate
	} = props;

	const { slug } = sites.getPrimary();

	return (
		<div className="help-courses__course">
			<Card compact className="help-courses__course-label">{ translate( 'Next course' ) }</Card>
			<Card compact>
				<h1 className="help-courses__course-title">{ title }</h1>
				<p className="help-courses__course-description">{ description }</p>
				{ ! isBusinessPlanUser &&
					<HelpTeaserButton
						href={ `/plans/${ slug }` }
						title={ translate( 'Join this course with Business Plan' ) }
						description={ translate( 'Upgrade to access webinars and courses to learn how to make the most of your site' ) }/> }
			</Card>
			{ schedule.map( ( item, key ) => <CourseScheduleItem { ...item } key={ key } isBusinessPlanUser={ isBusinessPlanUser } /> ) }
			{
				isBusinessPlanUser &&
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
