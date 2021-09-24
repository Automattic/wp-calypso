import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * This function returns a collection of NUX Tour slide assets
 *
 * @param {string} key the lookup string to fetch the proper asset set
 * @returns a set of <WelcomeTourCard /> assets
 */

function getTourAssets( key ) {
	const CDN_PREFIX = 'https://s0.wp.com/i/editor-welcome-tour';
	const tourAssets = {
		addBlock: {
			desktop: { src: `${ CDN_PREFIX }/slide-add-block.gif`, type: 'image/gif' },
			mobile: { src: `${ CDN_PREFIX }/slide-add-block_mobile.gif`, type: 'image/gif' },
		},
		allBlocks: { desktop: { src: `${ CDN_PREFIX }/slide-all-blocks.gif`, type: 'image/gif' } },
		finish: { desktop: { src: `${ CDN_PREFIX }/slide-finish.png`, type: 'image/gif' } },
		makeBold: { desktop: { src: `${ CDN_PREFIX }/slide-make-bold.gif`, type: 'image/gif' } },
		moreOptions: {
			desktop: { src: `${ CDN_PREFIX }/slide-more-options.gif`, type: 'image/gif' },
			mobile: { src: `${ CDN_PREFIX }/slide-more-options_mobile.gif`, type: 'image/gif' },
		},
		moveBlock: {
			desktop: { src: `${ CDN_PREFIX }/slide-move-block.gif`, type: 'image/gif' },
			mobile: { src: `${ CDN_PREFIX }/slide-move-block_mobile.gif`, type: 'image/gif' },
		},
		undo: { desktop: { src: `${ CDN_PREFIX }/slide-undo.gif`, type: 'image/gif' } },
		welcome: {
			desktop: { src: `${ CDN_PREFIX }/slide-welcome.png`, type: 'image/png' },
			mobile: { src: `${ CDN_PREFIX }/slide-welcome_mobile.jpg`, type: 'image/jpeg' },
		},
	};

	return tourAssets[ key ];
}

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
			imgSrc: getTourAssets( 'welcome' ),
			animation: null,
		},
		{
			heading: __( 'Everything is a block', 'full-site-editing' ),
			description: __(
				'In the WordPress Editor, paragraphs, images, and videos are all blocks.',
				'full-site-editing'
			),
			imgSrc: getTourAssets( 'allBlocks' ),
			animation: null,
		},
		{
			heading: __( 'Adding a new block', 'full-site-editing' ),
			description: __(
				'Click + to open the inserter. Then click the block you want to add.',
				'full-site-editing'
			),
			imgSrc: getTourAssets( 'addBlock' ),
			animation: 'block-inserter',
		},
		{
			heading: __( 'Click a block to change it', 'full-site-editing' ),
			description: __(
				'Use the toolbar to change the appearance of a selected block. Try making it bold.',
				'full-site-editing'
			),
			imgSrc: getTourAssets( 'makeBold' ),
			animation: null,
		},
		{
			heading: __( 'More Options', 'full-site-editing' ),
			description: __( 'Click the settings icon to see even more options.', 'full-site-editing' ),
			imgSrc: getTourAssets( 'moreOptions' ),
			animation: null,
		},
		{
			heading: __( 'Undo any mistake', 'full-site-editing' ),
			description: __( "Click the Undo button if you've made a mistake.", 'full-site-editing' ),
			imgSrc: getTourAssets( 'undo' ),
			animation: 'undo-button',
		},
		{
			heading: __( 'Drag & drop', 'full-site-editing' ),
			description: __( 'To move blocks around, click and drag the handle.', 'full-site-editing' ),
			imgSrc: getTourAssets( 'moveBlock' ),
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
			imgSrc: getTourAssets( 'finish' ),
			animation: 'block-inserter',
		},
	];
}

export default getTourContent;
