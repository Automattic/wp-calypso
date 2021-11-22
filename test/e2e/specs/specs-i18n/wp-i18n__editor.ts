/**
 * @group i18n
 */

import {
	ChangeUILanguageFlow,
	DataHelper,
	GutenbergEditorPage,
	LoginPage,
	NewPostFlow,
	setupHooks,
	TestEnvironment,
} from '@automattic/calypso-e2e';
import { Page, Frame } from 'playwright';
import type { LanguageSlug } from '@automattic/languages';

type Translations = {
	[ language in LanguageSlug ]?: Partial< {
		blocks: {
			blockName: string;
			blockEditorSelector: string;
			blockEditorContent: string[];
			blockPanelTitle: string;
		}[];
	} >;
};
const translations: Translations = {
	en: {
		blocks: [
			// Core
			{
				blockName: 'Image',
				blockEditorSelector: '[data-type="core/image"]',
				blockEditorContent: [
					'.components-placeholder__label:has-text("Image")',
					'.jetpack-external-media-button-menu:text("Select Image")', // Jetpack extension
				],
				blockPanelTitle: 'Image',
			},
			{
				blockName: 'Spacer',
				blockEditorSelector: '[data-type="core/spacer"]',
				blockEditorContent: [],
				blockPanelTitle: 'Spacer',
			},
			{
				blockName: 'Cover',
				blockEditorSelector: '[data-type="core/cover"]',
				blockEditorContent: [ '.block-editor-media-placeholder__upload-button:has-text("Upload")' ],
				blockPanelTitle: 'Cover',
			},

			// Jetpack
			{
				// @todo: Update when Jetpack translations get fixed.
				blockName: 'Contact Form',
				blockEditorSelector: '[data-type="jetpack/contact-form"]',
				blockEditorContent: [ ':text("Name")', ':text("Email")', ':text("Message")' ],
				blockPanelTitle: 'Form',
			},
			{
				// @todo: Update when Jetpack translations get fixed.
				blockName: 'Business Hours',
				blockEditorSelector: '[data-type="jetpack/business-hours"]',
				blockEditorContent: [
					'.business-hours__day-name:text("Monday")',
					'.business-hours__hours:has-text("Add Hours")',
				],
				blockPanelTitle: 'Business Hours',
			},

			// Crowdsignal Forms
			{
				blockName: 'Applause',
				blockEditorSelector: '[data-type="crowdsignal-forms/applause"]',
				blockEditorContent: [ ':text("Claps")' ],
				blockPanelTitle: 'Applause',
			},
			{
				blockName: 'Poll',
				blockEditorSelector: '[data-type="crowdsignal-forms/poll"]',
				blockEditorContent: [
					'[aria-label="Enter your question"]',
					'[aria-label="Add a note (optional)"]',
				],
				blockPanelTitle: 'Poll',
			},
		],
	},
	fr: {
		blocks: [
			// Core
			{
				blockName: 'Image',
				blockEditorSelector: '[data-type="core/image"]',
				blockEditorContent: [
					'.components-placeholder__label:has-text("Image")',
					'.jetpack-external-media-button-menu:text("Select Image")', // Jetpack extension
				],
				blockPanelTitle: 'Image',
			},
			{
				blockName: 'Espacement',
				blockEditorSelector: '[data-type="core/spacer"]',
				blockEditorContent: [],
				blockPanelTitle: 'Espacement',
			},
			{
				blockName: 'Bannière',
				blockEditorSelector: '[data-type="core/cover"]',
				blockEditorContent: [
					'.block-editor-media-placeholder__upload-button:has-text("Téléverser")',
				],
				blockPanelTitle: 'Bannière',
			},

			// Jetpack
			{
				// @todo: Update when Jetpack translations get fixed.
				blockName: 'Contact Form',
				blockEditorSelector: '[data-type="jetpack/contact-form"]',
				blockEditorContent: [ ':text("Name")', ':text("Email")', ':text("Message")' ],
				blockPanelTitle: 'Form',
			},
			{
				// @todo: Update when Jetpack translations get fixed.
				blockName: 'Business Hours',
				blockEditorSelector: '[data-type="jetpack/business-hours"]',
				blockEditorContent: [
					'.business-hours__day-name:text("lundi")',
					'.business-hours__hours:has-text("Add Hours")',
				],
				blockPanelTitle: 'Business Hours',
			},

			// Crowdsignal Forms
			{
				blockName: 'Applaudissement',
				blockEditorSelector: '[data-type="crowdsignal-forms/applause"]',
				blockEditorContent: [ ':text("Claps")' ],
				blockPanelTitle: 'Applaudissement',
			},
			{
				blockName: 'Sondage',
				blockEditorSelector: '[data-type="crowdsignal-forms/poll"]',
				blockEditorContent: [
					'[aria-label="Entrez votre question"]',
					'[aria-label="Ajouter une note (facultatif)"]',
				],
				blockPanelTitle: 'Sondage',
			},
		],
	},
	he: {
		blocks: [
			// Core
			{
				blockName: 'תמונה',
				blockEditorSelector: '[data-type="core/image"]',
				blockEditorContent: [
					'.components-placeholder__label:has-text("תמונה")',
					'.jetpack-external-media-button-menu:text("Select Image")', // Jetpack extension
				],
				blockPanelTitle: 'תמונה',
			},
			{
				blockName: 'מרווח',
				blockEditorSelector: '[data-type="core/spacer"]',
				blockEditorContent: [],
				blockPanelTitle: 'מרווח',
			},
			{
				blockName: 'כיסוי',
				blockEditorSelector: '[data-type="core/cover"]',
				blockEditorContent: [ '.block-editor-media-placeholder__upload-button:has-text("העלאה")' ],
				blockPanelTitle: 'כיסוי',
			},

			// Jetpack
			{
				// @todo: Update when Jetpack translations get fixed.
				blockName: 'Contact Form',
				blockEditorSelector: '[data-type="jetpack/contact-form"]',
				blockEditorContent: [ ':text("Name")', ':text("Email")', ':text("Message")' ],
				blockPanelTitle: 'Form',
			},
			{
				// @todo: Update when Jetpack translations get fixed.
				blockName: 'Business Hours',
				blockEditorSelector: '[data-type="jetpack/business-hours"]',
				blockEditorContent: [
					'.business-hours__day-name:text("יום שני")',
					'.business-hours__hours:has-text("Add Hours")',
				],
				blockPanelTitle: 'Business Hours',
			},

			// Crowdsignal Forms
			{
				blockName: 'מחיאות כפיים',
				blockEditorSelector: '[data-type="crowdsignal-forms/applause"]',
				blockEditorContent: [ ':text("Claps")' ],
				blockPanelTitle: 'מחיאות כפיים',
			},
			{
				blockName: 'סקר',
				blockEditorSelector: '[data-type="crowdsignal-forms/poll"]',
				blockEditorContent: [
					'[aria-label="יש להזין את השאלה שלך"]',
					'[aria-label="להוסיף פתק (אופציונלי)"]',
				],
				blockPanelTitle: 'סקר',
			},
		],
	},
};

describe( 'I18N: Editor', function () {
	let page: Page;
	// Filter out the locales that do not have valid translation content defined above.
	const locales = Object.keys( translations ).filter( ( locale ) =>
		TestEnvironment.LOCALES().includes( locale )
	);

	setupHooks( ( args ) => {
		page = args.page;
		// Confirm page leave with unsaved changes prompt.
		page.on( 'dialog', async ( dialog ) => {
			if ( dialog.type() === 'beforeunload' ) {
				await dialog.accept();
			}
		} );
	} );

	it( 'Log in', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: 'i18nUser' } );
	} );

	describe.each( locales )( `Locale: %s`, function ( locale ) {
		describe( 'Set up', function () {
			it( `Change UI language to ${ locale }`, async function () {
				await Promise.all( [
					page.waitForNavigation( { url: '**/home/**', waitUntil: 'load' } ),
					page.goto( DataHelper.getCalypsoURL( '/' ) ),
				] );

				const changeUILanguageFlow = new ChangeUILanguageFlow( page );
				await changeUILanguageFlow.changeUILanguage( locale as LanguageSlug );

				await Promise.all( [
					page.waitForNavigation( { url: '**/home/**', waitUntil: 'load' } ),
					page.goto( DataHelper.getCalypsoURL( '/' ) ),
				] );
			} );

			it( 'Start new post', async function () {
				const newPostFlow = new NewPostFlow( page );
				await newPostFlow.newPostFromNavbar();
			} );
		} );

		describe.each( translations[ locale ].blocks )(
			'Translations for block: $blockName',
			function ( block ) {
				let frame: Frame;
				let gutenbergEditorPage: GutenbergEditorPage;

				const blockTimeout = 10 * 1000;

				it( 'Insert test block', async function () {
					gutenbergEditorPage = new GutenbergEditorPage( page );
					await gutenbergEditorPage.addBlock( block.blockName, block.blockEditorSelector );
				} );

				it( 'Render block content translations', async function () {
					frame = await gutenbergEditorPage.getEditorFrame();
					// Ensure block contents are translated as expected.
					await Promise.all(
						block.blockEditorContent.map( ( content: any ) =>
							frame.waitForSelector( `${ block.blockEditorSelector } ${ content }`, {
								timeout: blockTimeout,
							} )
						)
					);
				} );

				it( 'Render block title translations', async function () {
					await gutenbergEditorPage.openSettings();
					await frame.click( block.blockEditorSelector );

					// Ensure the block is highlighted.
					await frame.waitForSelector(
						`:is( ${ block.blockEditorSelector }.is-selected, ${ block.blockEditorSelector }.has-child-selected)`,
						{ timeout: blockTimeout }
					);

					// If on block insertion, one of the sub-blocks are selected, click on
					// the first button in the floating toolbar which selects the overall
					// block.
					if ( await frame.isVisible( '.block-editor-block-parent-selector__button' ) ) {
						await frame.click( '.block-editor-block-parent-selector__button' );
					}

					// Ensure the Settings with the block selected shows the expected title.
					await frame.waitForSelector(
						`.block-editor-block-card__title:has-text("${ block.blockPanelTitle }")`,
						{ timeout: blockTimeout }
					);
				} );
			}
		);
	} );
} );
