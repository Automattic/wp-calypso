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
			title={ translate( 'Learn from the pros' ) }
			description={ translate(
				'Free, live video webinars led by our experts teach you to build a website, start a blog, or make money with your site.'
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
