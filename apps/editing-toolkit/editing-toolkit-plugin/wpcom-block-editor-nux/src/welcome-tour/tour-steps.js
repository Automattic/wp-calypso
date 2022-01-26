import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, hasTranslation } from '@wordpress/i18n';

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
				descriptions: {
					desktop: __(
						'Take this short, interactive tour to learn the fundamentals of the WordPress editor.',
						'full-site-editing'
					),
					mobile: null,
				},
				imgSrc: getTourAssets( 'welcome' ),
				animation: null,
			},
			options: {
				classes: [ 'is-with-extra-padding', 'wpcom-editor-welcome-tour__step' ],
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 1 ],
			meta: {
				heading: __( 'Everything is a block', 'full-site-editing' ),
				descriptions: {
					desktop: __(
						'In the WordPress Editor, paragraphs, images, and videos are all blocks.',
						'full-site-editing'
					),
					mobile: null,
				},
				imgSrc: getTourAssets( 'allBlocks' ),
				animation: null,
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 2 ],
			meta: {
				heading: __( 'Adding a new block', 'full-site-editing' ),
				descriptions: {
					desktop: __(
						'Click + to open the inserter. Then click the block you want to add.',
						'full-site-editing'
					),
					mobile:
						localeSlug === 'en' ||
						hasTranslation?.( 'Tap + to open the inserter. Then tap the block you want to add.' )
							? __(
									'Tap + to open the inserter. Then tap the block you want to add.',
									'full-site-editing'
							  )
							: __(
									'Click + to open the inserter. Then click the block you want to add.',
									'full-site-editing'
							  ),
				},
				imgSrc: getTourAssets( 'addBlock' ),
				animation: 'block-inserter',
			},
			options: {
				classes: [ 'is-with-extra-padding', 'wpcom-editor-welcome-tour__step' ],
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 3 ],
			meta: {
				heading: __( 'Click a block to change it', 'full-site-editing' ),
				descriptions: {
					desktop: __(
						'Use the toolbar to change the appearance of a selected block. Try making it bold.',
						'full-site-editing'
					),
					mobile: null,
				},
				imgSrc: getTourAssets( 'makeBold' ),
				animation: null,
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 4 ],
			meta: {
				heading: __( 'More Options', 'full-site-editing' ),
				descriptions: {
					desktop: __( 'Click the settings icon to see even more options.', 'full-site-editing' ),
					mobile:
						localeSlug === 'en' ||
						hasTranslation?.( 'Tap the settings icon to see even more options.' )
							? __( 'Tap the settings icon to see even more options.', 'full-site-editing' )
							: __( 'Click the settings icon to see even more options.', 'full-site-editing' ),
				},
				imgSrc: getTourAssets( 'moreOptions' ),
				animation: null,
			},
			options: {
				classes: [ 'is-with-extra-padding', 'wpcom-editor-welcome-tour__step' ],
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 5 ],
			meta: {
				heading: __( 'Undo any mistake', 'full-site-editing' ),
				descriptions: {
					desktop: __( "Click the Undo button if you've made a mistake.", 'full-site-editing' ),
					mobile: null,
				},
				imgSrc: getTourAssets( 'undo' ),
				animation: 'undo-button',
				isDesktopOnly: true,
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 6 ],
			meta: {
				heading: __( 'Drag & drop', 'full-site-editing' ),
				descriptions: {
					desktop: __( 'To move blocks around, click and drag the handle.', 'full-site-editing' ),
					mobile:
						localeSlug === 'en' ||
						hasTranslation?.( 'To move blocks around, tap the up and down arrows.' )
							? __( 'To move blocks around, tap the up and down arrows.', 'full-site-editing' )
							: __( 'To move blocks around, click and drag the handle.', 'full-site-editing' ),
				},
				imgSrc: getTourAssets( 'moveBlock' ),
				animation: 'undo-button',
			},
			options: {
				classes: [ 'is-with-extra-padding', 'wpcom-editor-welcome-tour__step' ],
			},
		},
		{
			referenceElements: referencePositioning && referenceElements[ 7 ],
			meta: {
				heading: __( 'Congratulations!', 'full-site-editing' ),
				descriptions: {
					desktop: createInterpolateElement(
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
					mobile: null,
				},
				imgSrc: getTourAssets( 'finish' ),
				animation: 'block-inserter',
			},
		},
	];
}

export default getTourSteps;
