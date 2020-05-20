/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Task from 'my-sites/customer-home/cards/tasks/task';
import { TASK_EARN_FEATURES } from 'my-sites/customer-home/cards/constants';
import webinarsIllustration from 'assets/images/customer-home/illustration-webinars.svg';

const EarnFeatures = () => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'EARN FEATURES' ) }
			description={ translate( 'A whole bunch of stuff about how Earn is cool.' ) }
			actionText={ translate( 'Register for free' ) }
			actionUrl="https://wordpress.com/earn/"
			actionTarget="_blank"
			completeOnStart={ true }
			illustration={ webinarsIllustration }
			timing={ 2 }
			taskId={ TASK_EARN_FEATURES }
		/>
	);
};

export default EarnFeatures;
