/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
// import config from '@automattic/calypso-config';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { TASK_UPSELL_TITAN } from 'calypso/my-sites/customer-home/cards/constants';
import titanUpsellIllustration from 'calypso/assets/images/customer-home/illustration--titan-banner.svg';

const TitanBanner = () => {
	const translate = useTranslate();
	const showTitanBanner = true;

	return (
		<>
			{ showTitanBanner && (
				<Task
					title={ translate( 'Get email @ your domain' ) }
					description={ translate(
						'Brand yourself and build trust with a custom email address @ your domain, free for 3 months.'
					) }
					actionText={ translate( 'Get email' ) }
					actionUrl="https://www.cloudflare.com/pg-lp/cloudflare-for-wordpress-dot-com?utm_source=wordpress.com&utm_medium=affiliate&utm_campaign=paygo_2021-02_a8_pilot&utm_content=home"
					actionTarget="_blank"
					completeOnStart={ false }
					enableSkipOptions={ false }
					illustration={ titanUpsellIllustration }
					taskId={ TASK_UPSELL_TITAN }
					timing={ 2 }
				/>
			) }
		</>
	);
};

export default TitanBanner;
