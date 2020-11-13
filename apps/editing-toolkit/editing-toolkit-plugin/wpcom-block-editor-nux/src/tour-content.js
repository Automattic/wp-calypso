/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * This function returns a collection of NUX Tour slide data
 *
 * @returns { Array } a collection of <WelcomeTourCard /> props
 */
function getTourContent() {
	return [
		{
			heading: __( 'Welcome to your website', 'full-site-editing' ),
			description: __(
				'Edit your homepage, add the pages you need, and change your site’s look and feel.',
				'full-site-editing'
			),
			imgSrc: 'https://nuxtourtest.files.wordpress.com/2020/11/mock-slide-1.jpg?resize=400px',
		},
		// {
		// 	heading: __( 'Everything is a block', 'full-site-editing' ),
		// 	description: __(
		// 		'Edit your homepage, add the pages you need, and change your site’s look and feel.',
		// 		'full-site-editing'
		// 	),
		// 	imgSrc: 'https://nuxtourtest.files.wordpress.com/2020/11/mock-slide-1.jpg?resize=400px',
		// },
	];
}

export default getTourContent;
