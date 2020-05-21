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

const EarnFeatures = ( { siteSlug } ) => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'Make money from your website' ) }
			description={ translate(
				'Sell just about anything to your visitors -- physical items, digital downloads, memberships, exclusive content, and more. Our new payment tools allow you to accept credit card payments on your website.'
			) }
			actionText={ translate( 'Start making money' ) }
			actionUrl={ `/earn/${ siteSlug }` }
			completeOnStart={ false }
			illustration={ webinarsIllustration }
			timing={ 2 }
			taskId={ TASK_EARN_FEATURES }
		/>
	);
};

export default EarnFeatures;
