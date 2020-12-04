/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { TASK_WP_COURSES } from 'calypso/my-sites/customer-home/cards/constants';
import coursesLogo from 'calypso/assets/images/customer-home/courses-logo.png';

const WPCourses = () => {
	return (
		<Task
			title="Introducing WordPress.com Courses"
			description="Build your skills with in-depth courses for any level, taught by WordPress experts. Enroll to access on-demand content, a private online community, office hours, and virtual meetups."
			actionText="Enroll today!"
			actionUrl="https://wpcourses.com/?utm_source=wordpressdotcom&utm_medium=referral&utm_campaign=courses_launch_myhome"
			actionTarget="_blank"
			illustration={ coursesLogo }
			completeOnStart
			taskId={ TASK_WP_COURSES }
		/>
	);
};

export default WPCourses;
