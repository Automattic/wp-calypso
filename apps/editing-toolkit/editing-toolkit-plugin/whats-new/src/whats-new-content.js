/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
// import './public-path';

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

import whatsApp from './images/whatsapp.png';
import payments from './images/payments.png';
const image3 = 'https://s0.wp.com/i/editor-welcome-tour/slide-finish.png';

/**
 * This function returns a collection of NUX Tour slide data
 *
 * @returns { Array } a collection of <WelcomeTourCard /> props
 */
function getWhatsNewContent() {
	return [
		{
			heading: __( 'Let your visitors message you on WhatsApp', 'full-site-editing' ),
			description: __(
				'Connect and communicate with your website’s visitors with the new WhatsApp block. With a single click, your website’s visitors can ask questions or message you for whatever reason. Available with Premium, Business, and eCommerce plans.',
				'full-site-editing'
			),
			imgSrc: whatsApp,
			animation: null,
		},
		{
			heading: __( 'Use payments features to make money', 'full-site-editing' ),
			description: __(
				'You can process payments on your website for just about anything. With Payments, Premium Content, and Donations blocks, it takes just minutes to get setup to collect payments from your visitors. Available for with any paid plan. Get started with payments today.',
				'full-site-editing'
			),
			imgSrc: payments,
			animation: null,
		},
		{
			heading: __( 'Adding a new block', 'full-site-editing' ),
			description: __(
				'Click + to open the inserter. Then click the block you want to add.',
				'full-site-editing'
			),
			imgSrc: image3,
			animation: 'block-inserter',
		},
	];
}

export default getWhatsNewContent;
