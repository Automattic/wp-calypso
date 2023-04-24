import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { isMobile } from '@automattic/viewport';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getQueryArg } from '@wordpress/url';
import { getEditorType } from './get-editor-type';
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
		editYourSite: {
			desktop: {
				src: `https://s.w.org/images/block-editor/edit-your-site.gif?1`,
				type: 'image/gif',
			},
			mobile: {
				src: `https://s.w.org/images/block-editor/edit-your-site.gif?1`,
				type: 'image/gif',
			},
		},
		videomakerWelcome: {
			desktop: { src: `${ CDN_PREFIX }/slide-videomaker-welcome.png`, type: 'image/png' },
		},
		videomakerEdit: {
			desktop: { src: `${ CDN_PREFIX }/slide-videomaker-edit.png`, type: 'image/png' },
		},
	} as { [ key: string ]: TourAsset };

	return tourAssets[ key ];
}

function getTourSteps(
	localeSlug: string,
	referencePositioning = false,
	isSiteEditor = false,
	themeName: string | null = null,
	siteIntent: string | undefined = undefined
): WpcomStep[] {
	const isVideoMaker = 'videomaker' === ( themeName ?? '' );
	const isPatternAssembler = !! getQueryArg( window.location.href, 'assembler' );
	const siteEditorCourseUrl = `https://wordpress.com/home/${ window.location.hostname }?courseSlug=site-editor-quick-start`;
	const editorType = getEditorType();
	const onSiteEditorCourseLinkClick = () => {
		recordTracksEvent( 'calypso_editor_wpcom_tour_site_editor_course_link_click', {
			is_pattern_assembler: isPatternAssembler,
			intent: siteIntent,
			editor_type: editorType,
		} );
	};

	return [
		{
			slug: 'welcome',
			meta: {
				heading: isPatternAssembler
					? __( 'Nice job! Your new page is set up.', 'full-site-editing' )
					: __( 'Welcome to WordPress!', 'full-site-editing' ),
				descriptions: {
					desktop: ( () => {
						if ( isPatternAssembler ) {
							return createInterpolateElement(
								__(
									'This is the Site Editor, where you can change everything about your site, including adding content to your homepage. <link_to_site_editor_course>Watch these short videos</link_to_site_editor_course> and take this tour to get started.',
									'full-site-editing'
								),
								{
									link_to_site_editor_course: (
										<ExternalLink
											href={ siteEditorCourseUrl }
											onClick={ onSiteEditorCourseLinkClick }
										/>
									),
								}
							);
						}

						return isSiteEditor
							? __(
									'Take this short, interactive tour to learn the fundamentals of the WordPress Site Editor.',
									'full-site-editing'
							  )
							: __(
									'Take this short, interactive tour to learn the fundamentals of the WordPress editor.',
									'full-site-editing'
							  );
					} )(),
					mobile: null,
				},
				imgSrc: getTourAssets( isVideoMaker ? 'videomakerWelcome' : 'welcome' ),
				imgLink: isPatternAssembler
					? {
							href: siteEditorCourseUrl,
							playable: true,
							onClick: onSiteEditorCourseLinkClick,
					  }
					: undefined,
			},
			options: {
				classNames: {
					desktop: 'wpcom-editor-welcome-tour__step',
					mobile: [ 'is-with-extra-padding', 'calypso_editor_wpcom_draft_post_modal_show' ],
				},
			},
		},
		{
			slug: 'everything-is-a-block',
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
			slug: 'add-block',
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
			slug: 'edit-block',
			meta: {
				heading: __( 'Click a block to change it', 'full-site-editing' ),
				descriptions: {
					desktop: isVideoMaker
						? __(
								'Use the toolbar to change the appearance of a selected block. Try replacing a video!',
								'full-site-editing'
						  )
						: __(
								'Use the toolbar to change the appearance of a selected block. Try making it bold.',
								'full-site-editing'
						  ),
					mobile: null,
				},
				imgSrc: getTourAssets( isVideoMaker ? 'videomakerEdit' : 'makeBold' ),
			},
			options: {
				classNames: {
					desktop: 'wpcom-editor-welcome-tour__step',
					mobile: 'wpcom-editor-welcome-tour__step',
				},
			},
		},
		{
			slug: 'settings',
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
						slug: 'find-your-way',
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
						slug: 'undo',
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
			slug: 'drag-drop',
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
			slug: 'payment-block',
			meta: {
				heading: __( 'The Payments block', 'full-site-editing' ),
				descriptions: {
					desktop: (
						<>
							{ __(
								'The Payments block allows you to accept payments for one-time, monthly recurring, or annual payments on your website',
								'full-site-editing'
							) }
							<br />
							<ExternalLink
								href={ localizeUrl(
									'https://wordpress.com/support/video-tutorials-add-payments-features-to-your-site-with-our-guides/#how-to-use-the-payments-block-video',
									localeSlug
								) }
								target="_blank"
								rel="noopener noreferrer"
							>
								{ __( 'Learn more', 'full-site-editing' ) }
							</ExternalLink>
						</>
					),
					mobile: null,
				},
				imgSrc: getTourAssets( 'welcome' ),
			},
			options: {
				classNames: {
					desktop: 'wpcom-editor-welcome-tour__step',
					mobile: 'wpcom-editor-welcome-tour__step',
				},
			},
		},
		...( isSiteEditor
			? [
					{
						slug: 'edit-your-site',
						meta: {
							heading: __( 'Edit your site', 'full-site-editing' ),
							descriptions: {
								desktop: createInterpolateElement(
									__(
										'Design everything on your site - from the header right down to the footer - in the Site Editor. <link_to_fse_docs>Learn more</link_to_fse_docs>',
										'full-site-editing'
									),
									{
										link_to_fse_docs: (
											<ExternalLink
												href={ localizeUrl(
													'https://wordpress.com/support/full-site-editing/',
													localeSlug
												) }
											/>
										),
									}
								),
								mobile: __(
									'Design everything on your site - from the header right down to the footer - in the Site Editor.',
									'full-site-editing'
								),
							},
							imgSrc: getTourAssets( 'editYourSite' ),
						},
						options: {
							classNames: {
								desktop: 'wpcom-editor-welcome-tour__step',
								mobile: [ 'is-with-extra-padding', 'wpcom-editor-welcome-tour__step' ],
							},
						},
					},
			  ]
			: [] ),
		{
			slug: 'congratulations',
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
