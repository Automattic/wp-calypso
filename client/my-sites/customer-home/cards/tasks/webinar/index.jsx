/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Task from '../task';
import temporaryIllustration from 'assets/images/customer-home/illustration--task-connect-social-accounts.svg';

const Webinar = () => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'Get hands-on learning' ) }
			description={ translate(
				'Join one of our live video webinars designed to help you get started ' +
					'or learn more advanced features.'
			) }
			actionText={ translate( 'Register for free' ) }
			actionOnClick={ () => {
				window.open( 'https://wordpress.com/webinars/', '_blank' );
			} }
			illustration={ temporaryIllustration }
			timing={ 2 }
			taskId="webinar"
		/>
	);
};

export default Webinar;
