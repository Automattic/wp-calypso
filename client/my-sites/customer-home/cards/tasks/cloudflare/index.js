/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { TASK_CLOUDFLARE } from 'calypso/my-sites/customer-home/cards/constants';
import growthSummitIllustration from 'calypso/assets/images/customer-home/illustration--growth-summit.svg';

const Cloudflare = () => {
	const translate = useTranslate();
	const showCloudflare = config.isEnabled( 'cloudflare' );

	return (
		<>
			{ showCloudflare && (
				<Task
					title={ translate( 'Protect and accelerate your site with Cloudflare CDN' ) }
					description={ translate(
						'Optimize and secure your content to create a faster experience for your users regardless of their device or location.'
					) }
					actionText={ translate( 'Learn more' ) }
					actionUrl="CLOUDFLAREURL"
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
