import { localizeUrl } from '@automattic/i18n-utils';
import { isMobile } from '@automattic/viewport';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { WpcomStep } from '@automattic/tour-kit';

interface TourAsset {
	desktop?: { src: string; type: string };
	mobile?: { src: string; type: string };
}

function getTourAssets( key: string ): TourAsset | undefined {
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
		findYourWay: {
			desktop: { src: `${ CDN_PREFIX }/slide-find-your-way.gif`, type: 'image/gif' },
		},
		undo: { desktop: { src: `${ CDN_PREFIX }/slide-undo.gif`, type: 'image/gif' } },
		welcome: {
			desktop: { src: `${ CDN_PREFIX }/slide-welcome.png`, type: 'image/png' },
			mobile: { src: `${ CDN_PREFIX }/slide-welcome_mobile.jpg`, type: 'image/jpeg' },
		},
	} as { [ key: string ]: TourAsset };

	return tourAssets[ key ];
}

function getTourSteps( localeSlug: string, referencePositioning = false ): WpcomStep[] {
	return [
		{
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
			},
			options: {
				classNames: {
					desktop: 'wpcom-editor-welcome-tour__step',
					mobile: [ 'is-with-extra-padding', 'wpcom-editor-welcome-tour__step' ],
				},
			},
		},
		{
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
			},
			options: {
				classNames: {
					desktop: 'wpcom-editor-welcome-tour__step',
					mobile: 'wpcom-editor-welcome-tour__step',
				},
			},
		},
		{
			...( referencePositioning && {
				referenceElements: {
					mobile:
						'.edit-post-header .edit-post-header__toolbar .components-button.edit-post-header-toolbar__inserter-toggle',
					desktop:
						'.edit-post-header .edit-post-header__toolbar .components-button.edit-post-header-toolbar__inserter-toggle',
				},
			} ),
			meta: {
				heading: __( 'Adding a new block', 'full-site-editing' ),
				descriptions: {
					desktop: __(
						'Click + to open the inserter. Then click the block you want to add.',
						'full-site-editing'
					),
					mobile: __(
						'Tap + to open the inserter. Then tap the block you want to add.',
						'full-site-editing'
					),
				},
				imgSrc: getTourAssets( 'addBlock' ),
			},
			options: {
				classNames: {
					desktop: 'wpcom-editor-welcome-tour__step',
					mobile: [ 'is-with-extra-padding', 'wpcom-editor-welcome-tour__step' ],
				},
			},
		},
		{
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
			},
			options: {
				classNames: {
					desktop: 'wpcom-editor-welcome-tour__step',
					mobile: 'wpcom-editor-welcome-tour__step',
				},
			},
		},
		{
			...( referencePositioning && {
				referenceElements: {
					mobile:
						'.edit-post-header .edit-post-header__settings .interface-pinned-items > button:nth-child(1)',
					desktop:
						'.edit-post-header .edit-post-header__settings .interface-pinned-items > button:nth-child(1)',
				},
			} ),
			meta: {
				heading: __( 'More Options', 'full-site-editing' ),
				descriptions: {
					desktop: __( 'Click the settings icon to see even more options.', 'full-site-editing' ),
					mobile: __( 'Tap the settings icon to see even more options.', 'full-site-editing' ),
				},
				imgSrc: getTourAssets( 'moreOptions' ),
			},
			options: {
				classNames: {
					desktop: 'wpcom-editor-welcome-tour__step',
					mobile: [ 'is-with-extra-padding', 'wpcom-editor-welcome-tour__step' ],
				},
			},
		},
		...( ! isMobile()
			? [
					{
						meta: {
							heading: __( 'Find your way', 'full-site-editing' ),
							descriptions: {
								desktop: __(
									"Use List View to see all the blocks you've added. Click and drag any block to move it around.",
									'full-site-editing'
								),
								mobile: null,
							},
							imgSrc: getTourAssets( 'findYourWay' ),
						},
						options: {
							classNames: {
								desktop: [ 'is-with-extra-padding', 'wpcom-editor-welcome-tour__step' ],
								mobile: 'wpcom-editor-welcome-tour__step',
							},
						},
					},
			  ]
			: [] ),
		...( ! isMobile()
			? [
					{
						...( referencePositioning && {
							referenceElements: {
								desktop:
									'.edit-post-header .edit-post-header__toolbar .components-button.editor-history__undo',
							},
						} ),
						meta: {
							heading: __( 'Undo any mistake', 'full-site-editing' ),
							descriptions: {
								desktop: __(
									"Click the Undo button if you've made a mistake.",
									'full-site-editing'
								),
								mobile: null,
							},
							imgSrc: getTourAssets( 'undo' ),
						},
						options: {
							classNames: {
								desktop: 'wpcom-editor-welcome-tour__step',
								mobile: 'wpcom-editor-welcome-tour__step',
							},
						},
					},
			  ]
			: [] ),
		{
			meta: {
				heading: __( 'Drag & drop', 'full-site-editing' ),
				descriptions: {
					desktop: __( 'To move blocks around, click and drag the handle.', 'full-site-editing' ),
					mobile: __( 'To move blocks around, tap the up and down arrows.', 'full-site-editing' ),
				},
				imgSrc: getTourAssets( 'moveBlock' ),
			},
			options: {
				classNames: {
					desktop: 'wpcom-editor-welcome-tour__step',
					mobile: [ 'is-with-extra-padding', 'wpcom-editor-welcome-tour__step' ],
				},
			},
		},
		{
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
			},
			options: {
				classNames: {
					desktop: 'wpcom-editor-welcome-tour__step',
					mobile: 'wpcom-editor-welcome-tour__step',
				},
			},
		},
	];
}

export default getTourSteps;
