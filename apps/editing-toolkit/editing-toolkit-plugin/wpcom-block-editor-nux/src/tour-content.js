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
			heading: __( 'Learn the basics', 'full-site-editing' ),
			description: __(
				'Take the tour to learn the fundamentals of the WordPress editor.',
				'full-site-editing'
			),
			imgSrc: 'https://nuxtourtest.files.wordpress.com/2020/11/mock-slide-0-2.jpg?resize=400px',
			animation: null,
		},
		{
			heading: __( 'Everything is a block', 'full-site-editing' ),
			description: __(
				'In the WordPress Editor paragraphs, images, and videos, are all blocks.',
				'full-site-editing'
			),
			imgSrc:
				'https://nuxtourtest.files.wordpress.com/2020/11/mock-slide-1-blocks-1.gif?resize=400px',
			animation: null,
		},
		{
			heading: __( 'Click a block to change it', 'full-site-editing' ),
			description: __(
				'Use the toolbar to change the appearance of a selected block. Try making it bold.',
				'full-site-editing'
			),
			imgSrc:
				'https://nuxtourtest.files.wordpress.com/2020/11/mock-slide-2-make-bold-1.gif?resize=400px',
			animation: null,
		},
		{
			heading: __( 'More Options', 'full-site-editing' ),
			description: __( 'Click the settings icon to see even more options.', 'full-site-editing' ),
			imgSrc:
				'https://nuxtourtest.files.wordpress.com/2020/11/mock-slide-3-more_options.gif?resize=400px',
			animation: null,
		},
		{
			heading: __( 'Adding a new block', 'full-site-editing' ),
			description: __(
				'Click the add button to open the inserter. Then click the block you want to add.',
				'full-site-editing'
			),
			imgSrc:
				'https://nuxtourtest.files.wordpress.com/2020/11/mock-slide-4-add_block_zoomed.gif?resize=400px',
			animation: 'block-inserter',
		},
		{
			heading: __( 'Undo any mistake', 'full-site-editing' ),
			description: __(
				"Simply click the Undo button if you've made a mistake.",
				'full-site-editing'
			),
			imgSrc: 'https://nuxtourtest.files.wordpress.com/2020/11/mock-slide-3.jpg?resize=400px',
			animation: 'undo-button',
		},
		{
			heading: __( 'Congratulations!', 'full-site-editing' ),
			description: __(
				"You've now learned the basics and are on your way to building your website!",
				'full-site-editing'
			),
			imgSrc: 'https://nuxtourtest.files.wordpress.com/2020/11/mock-slide-3.jpg?resize=400px',
			animation: 'block-inserter',
		},
	];
}

export default getTourContent;
