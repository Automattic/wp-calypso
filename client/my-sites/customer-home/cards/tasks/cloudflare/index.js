/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { TASK_CLOUDFLARE } from 'calypso/my-sites/customer-home/cards/constants';
import growthSummitIllustration from 'calypso/assets/images/customer-home/illustration--task-cloudflare.svg';

const Cloudflare = () => {
	const translate = useTranslate();
	const showCloudflare = config.isEnabled( 'cloudflare' );

	return (
		<>
			{ showCloudflare && (
				<Task
					title={ translate( 'Boost your site speed and security with Cloudflare CDN' ) }
					description={ translate(
						'Create a faster experience for your visitors regardless of their device or location.'
					) }
					actionText={ translate( 'Learn more' ) }
					actionUrl="https://www.cloudflare.com/pg-lp/cloudflare-for-wordpress-dot-com?utm_source=wordpress.com&utm_medium=affiliate&utm_campaign=paygo_2021-02_a8_pilot&utm_content=home"
					actionTarget="_blank"
					completeOnStart={ false }
					illustration={ growthSummitIllustration }
					taskId={ TASK_CLOUDFLARE }
				/>
			) }
		</>
	);
};

export default Cloudflare;
