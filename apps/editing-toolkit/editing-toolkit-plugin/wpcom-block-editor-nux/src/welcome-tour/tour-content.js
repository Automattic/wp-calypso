import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const CDN_PREFIX = 'https://s0.wp.com/i/editor-welcome-tour';
const addBlock = {
	desktop: `${ CDN_PREFIX }/slide-add-block.gif`,
	mobile: `${ CDN_PREFIX }/slide-add-block_mobile.gif`,
};
const allBlocks = { desktop: `${ CDN_PREFIX }/slide-all-blocks.gif` };
const finish = { desktop: `${ CDN_PREFIX }/slide-finish.png` };
const makeBold = { desktop: `${ CDN_PREFIX }/slide-make-bold.gif` };
const moreOptions = {
	desktop: `${ CDN_PREFIX }/slide-more-options.gif`,
	mobile: `${ CDN_PREFIX }/slide-more-options_mobile.gif`,
};
const moveBlock = {
	desktop: `${ CDN_PREFIX }/slide-move-block.gif`,
	mobile: `${ CDN_PREFIX }/slide-move-block_mobile.gif`,
};
const undo = { desktop: `${ CDN_PREFIX }/slide-undo.gif` };
const welcome = {
	desktop: `${ CDN_PREFIX }/slide-welcome.png`,
	mobile: `${ CDN_PREFIX }/slide-welcome_mobile.jpg`,
};

/**
 * This function returns a collection of NUX Tour slide data
 *
 * @param { string } localeSlug the users locale
 * @returns { Array } a collection of <WelcomeTourCard /> props
 */
function getTourContent( localeSlug ) {
	return [
		{
			heading: __( 'Welcome to WordPress!', 'full-site-editing' ),
			description: __(
				'Take this short, interactive tour to learn the fundamentals of the WordPress editor.',
				'full-site-editing'
			),
			imgSrc: welcome,
			animation: null,
		},
		{
			heading: __( 'Everything is a block', 'full-site-editing' ),
			description: __(
				'In the WordPress Editor, paragraphs, images, and videos are all blocks.',
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
			description: __( 'To move blocks around, click and drag the handle.', 'full-site-editing' ),
			imgSrc: moveBlock,
			animation: 'undo-button',
		},
		{
			heading: __( 'Congratulations!', 'full-site-editing' ),
			description: createInterpolateElement(
				__(
					"You've learned the basics. Remember, your site is private until you <link_to_launch_site_docs>decide to launch</link_to_launch_site_docs>. View the <link_to_editor_docs>block editing docs</link_to_editor_docs> to learn more.",
					'full-site-editing'
				),
				{
					link_to_launch_site_docs: (
						<ExternalLink
							href={ localizeUrl(
								'https://wordpress.com/support/settings/privacy-settings/#launch-your-site',
								localeSlug
							) }
						/>
					),
					link_to_editor_docs: (
						<ExternalLink
							href={ localizeUrl( 'https://wordpress.com/support/wordpress-editor/', localeSlug ) }
						/>
					),
				}
			),
			imgSrc: finish,
			animation: 'block-inserter',
		},
	];
}

export default getTourContent;
