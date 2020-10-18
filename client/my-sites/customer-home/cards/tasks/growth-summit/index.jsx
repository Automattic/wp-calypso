/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { TASK_GROWTH_SUMMIT } from 'calypso/my-sites/customer-home/cards/constants';
import growthSummitIllustration from 'calypso/assets/images/customer-home/illustration--growth-summit.svg';

const GrowthSummit = () => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'The WordPress.com Growth Summit' ) }
			description={ translate(
				'Learn how to build and grow your site, from start to scale. Come join us for this exclusive two-day virtual event, August 11-13.'
			) }
			actionText={ translate( 'Register today for 20% off!' ) }
			actionUrl="http://www.wordpress.com/growth-summit/"
			actionTarget="_blank"
			completeOnStart={ false }
			illustration={ growthSummitIllustration }
			taskId={ TASK_GROWTH_SUMMIT }
		/>
	);
};

export default GrowthSummit;
