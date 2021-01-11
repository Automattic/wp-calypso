/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

import welcome from './images/welcome.png';
import allBlocks from './images/all_blocks.gif';
import addBlock from './images/add_block.gif';
import makeBold from './images/make_bold.gif';
import undo from './images/undo.gif';
import moveBlock from './images/move_block.gif';
import finish from './images/finish.png';
import moreOptions from './images/more_options.gif';

/**
 * This function returns a collection of NUX Tour slide data
 *
 * @returns { Array } a collection of <WelcomeTourCard /> props
 */
function getTourContent() {
	return [
		{
			heading: __( 'Welcome to WordPress!', 'full-site-editing' ),
			description: __(
				'Continue on with this short tour to learn the fundamentals of the WordPress editor.',
				'full-site-editing'
			),
			imgSrc: welcome,
			animation: null,
		},
		{
			heading: __( 'Everything is a block', 'full-site-editing' ),
			description: __(
				'In the WordPress Editor paragraphs, images, and videos are all blocks.',
				'full-site-editing'
			),
			imgSrc: allBlocks,
			animation: null,
		},
		{
			heading: __( 'Adding a new block', 'full-site-editing' ),
			description: __(
				'Click + to open the inserter. Then click the block you want to add.',
				'full-site-editing'
			),
			imgSrc: addBlock,
			animation: 'block-inserter',
		},
		{
			heading: __( 'Click a block to change it', 'full-site-editing' ),
			description: __(
				'Use the toolbar to change the appearance of a selected block. Try making it bold.',
				'full-site-editing'
			),
			imgSrc: makeBold,
			animation: null,
		},
		{
			heading: __( 'More Options', 'full-site-editing' ),
			description: __( 'Click the settings icon to see even more options.', 'full-site-editing' ),
			imgSrc: moreOptions,
			animation: null,
		},
		{
			heading: __( 'Undo any mistake', 'full-site-editing' ),
			description: __( "Click the Undo button if you've made a mistake.", 'full-site-editing' ),
			imgSrc: undo,
			animation: 'undo-button',
		},
		{
			heading: __( 'Drag & drop', 'full-site-editing' ),
			description: __(
				'To move blocks around click and drag the handle around.',
				'full-site-editing'
			),
			imgSrc: moveBlock,
			animation: 'undo-button',
		},
		{
			heading: __( 'Congratulations!', 'full-site-editing' ),
			description: __(
				'You’ve now learned the basics. Remember, your site is always private until you decide to launch.',
				'full-site-editing'
			),
			imgSrc: finish,
			animation: 'block-inserter',
		},
	];
}

export default getTourContent;
