/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Task from 'my-sites/customer-home/cards/tasks/task';
import { TASK_GROWTH_SUMMIT } from 'my-sites/customer-home/cards/constants';
import growthSummitIllustration from 'assets/images/customer-home/illustration--growth-summit.svg';

const GrowthSummit = () => {
	return (
		<Task
			title="The WordPress.com Growth Summit"
			description="Learn how to build and grow your site, from start to scale. Come join us for this exclusive two-day virtual event August 11-13."
			actionText="Register today for 20% off!"
			actionUrl="http://www.wordpress.com/growth-summit/"
			actionTarget="_blank"
			completeOnStart={ false }
			illustration={ growthSummitIllustration }
			taskId={ TASK_GROWTH_SUMMIT }
		/>
	);
};

export default GrowthSummit;
