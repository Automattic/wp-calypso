/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EducationalContent from '../educational-content';

/**
 * Image dependencies
 */
import webinarIllustration from 'assets/images/customer-home/illustration-webinars.svg';

const Webinars = () => {
	const translate = useTranslate();

	return (
		<EducationalContent
			title={ translate( 'Learn from the pros' ) }
			description={ translate(
				'Free webinars with Happiness Engineers teach you to build a website, start a blog, or make money on your site.'
			) }
			links={ [
				{
					externalLink: true,
					url: 'https://wordpress.com/webinars/',
					text: translate( 'Register for free' ),
				},
			] }
			illustration={ webinarIllustration }
		/>
	);
};

export default Webinars;
