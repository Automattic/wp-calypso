/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Task from '../task';
import webinarsIllustration from 'assets/images/customer-home/illustration-webinars.svg';

const Webinars = () => {
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
			illustration={ webinarsIllustration }
			timing={ 2 }
			taskId="webinars"
		/>
	);
};

export default Webinars;
