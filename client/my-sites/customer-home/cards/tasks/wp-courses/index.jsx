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

const WpCourses = () => {
	return (
		<Task
			title="Introducing WordPress Courses"
			description="Enroll today in our new educational courses for all skill levels. From Blogging for Beginners to Podcasting for Beginners (coming soon!) – these courses offer step-by step guidance on getting started, office hours with WordPress experts, an exclusive community, and virtual meetups."
			actionText="Enroll today and start learning!"
			actionUrl="https://wpcourses.com/?utm_source=wordpressdotcom&utm_medium=referral&utm_campaign=courses_launch_myhome"
			actionTarget="_blank"
			illustration={ coursesLogo }
			completeOnStart={ false }
			taskId={ TASK_WP_COURSES }
		/>
	);
};

export default WpCourses;
