import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const addBlock = 'https://s0.wp.com/i/editor-welcome-tour/slide-add-block.gif';
const allBlocks = 'https://s0.wp.com/i/editor-welcome-tour/slide-all-blocks.gif';
const finish = 'https://s0.wp.com/i/editor-welcome-tour/slide-finish.png';
const makeBold = 'https://s0.wp.com/i/editor-welcome-tour/slide-make-bold.gif';
const moreOptions = 'https://s0.wp.com/i/editor-welcome-tour/slide-more-options.gif';
const moveBlock = 'https://s0.wp.com/i/editor-welcome-tour/slide-move-block.gif';
const undo = 'https://s0.wp.com/i/editor-welcome-tour/slide-undo.gif';
const welcome = 'https://s0.wp.com/i/editor-welcome-tour/slide-welcome.png';

const referenceElements = [
	{
		desktop: null,
		mobile: null,
	},
	{
		desktop: null,
		mobile: null,
	},
	{
		mobile:
			'.edit-post-header .edit-post-header__toolbar .components-button.edit-post-header-toolbar__inserter-toggle',
		desktop:
			'.edit-post-header .edit-post-header__toolbar .components-button.edit-post-header-toolbar__inserter-toggle',
	},
	{
		desktop: null,
		mobile: null,
	},
	{
		mobile:
			'.edit-post-header .edit-post-header__settings .interface-pinned-items > button:nth-child(1)',
		desktop:
			'.edit-post-header .edit-post-header__settings .interface-pinned-items > button:nth-child(1)',
	},
	{
		mobile: '.edit-post-header .edit-post-header__toolbar .components-button.editor-history__undo',
		desktop: '.edit-post-header .edit-post-header__toolbar .components-button.editor-history__undo',
	},
	{
		mobile: null,
		desktop: null,
	},
	{
		desktop: null,
		mobile: null,
	},
];

function getTourSteps( localeSlug, referencePositioning ) {
	return [
		{
			referenceElements: referencePositioning && referenceElements[ 0 ],
			meta: {
				heading: __( 'Welcome to WordPress!', 'full-site-editing' ),
				description: __(
					'Take this short, interactive tour to learn the fundamentals of the WordPress editor.',
					'full-site-editing'
				),
				imgSrc: welcome,
				animation: null,
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 1 ],
			meta: {
				heading: __( 'Everything is a block', 'full-site-editing' ),
				description: __(
					'In the WordPress Editor, paragraphs, images, and videos are all blocks.',
					'full-site-editing'
				),
				imgSrc: allBlocks,
				animation: null,
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 2 ],
			meta: {
				heading: __( 'Adding a new block', 'full-site-editing' ),
				description: __(
					'Click + to open the inserter. Then click the block you want to add.',
					'full-site-editing'
				),
				imgSrc: addBlock,
				animation: 'block-inserter',
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 3 ],
			meta: {
				heading: __( 'Click a block to change it', 'full-site-editing' ),
				description: __(
					'Use the toolbar to change the appearance of a selected block. Try making it bold.',
					'full-site-editing'
				),
				imgSrc: makeBold,
				animation: null,
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 4 ],
			meta: {
				heading: __( 'More Options', 'full-site-editing' ),
				description: __( 'Click the settings icon to see even more options.', 'full-site-editing' ),
				imgSrc: moreOptions,
				animation: null,
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 5 ],
			meta: {
				heading: __( 'Undo any mistake', 'full-site-editing' ),
				description: __( "Click the Undo button if you've made a mistake.", 'full-site-editing' ),
				imgSrc: undo,
				animation: 'undo-button',
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 6 ],
			meta: {
				heading: __( 'Drag & drop', 'full-site-editing' ),
				description: __( 'To move blocks around, click and drag the handle.', 'full-site-editing' ),
				imgSrc: moveBlock,
				animation: 'undo-button',
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 7 ],
			meta: {
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
								href={ localizeUrl(
									'https://wordpress.com/support/wordpress-editor/',
									localeSlug
								) }
							/>
						),
					}
				),
				imgSrc: finish,
				animation: 'block-inserter',
			},
		},
	];
}

export default getTourSteps;
