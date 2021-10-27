/**
 * @group i18n
 */

import {
	DataHelper,
	LoginFlow,
	NewPostFlow,
	ChangeUILanguageFlow,
	GutenbergEditorPage,
	setupHooks,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

const translations = {
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
const locales = Object.keys( translations );

describe( DataHelper.createSuiteTitle( 'Editor Translations' ), function () {
	let gutenbergEditorPage: GutenbergEditorPage;
	let page: Page;

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
		const loginFlow = new LoginFlow( page, 'i18nUser' ); // @todo: Login with i18n testing account.
		await loginFlow.logIn();
	} );

	describe.each( locales )( 'Editor translations (%s)', ( locale ) => {
		it( 'Change UI language', async function () {
			await page.goto( DataHelper.getCalypsoURL( '/' ) );

			const changeUILanguageFlow = new ChangeUILanguageFlow( page );
			await changeUILanguageFlow.changeUILanguage( locale );

			await page.goto( DataHelper.getCalypsoURL( '/' ) );
		} );

		it( 'Start new post', async function () {
			const newPostFlow = new NewPostFlow( page );
			await newPostFlow.newPostFromNavbar();

			gutenbergEditorPage = new GutenbergEditorPage( page );
		} );

		it.each( translations[ locale ].blocks )(
			'Translations for block: $blockName',
			async ( block ) => {
				const frame = await gutenbergEditorPage.getEditorFrame();
				await frame.waitForTimeout( 2000 );

				await gutenbergEditorPage.addBlock( block.blockName, block.blockEditorSelector );

				block.blockEditorContent.forEach( async ( content ) => {
					await frame.waitForSelector( `${ block.blockEditorSelector } ${ content }` );
				} );

				// Open block settings.
				const settingsToggleLabel = await frame.evaluate( 'wp?.i18n?.__( "Settings" )' );
				await gutenbergEditorPage.openSettings( `[aria-label="${ settingsToggleLabel }"]` );
				await frame.click( block.blockEditorSelector );
				if ( await frame.isVisible( '.block-editor-block-parent-selector__button' ) ) {
					await frame.click( '.block-editor-block-parent-selector__button' );
				}

				await frame.waitForSelector(
					`.block-editor-block-card__title:has-text("${ block.blockPanelTitle }")`
				);
			}
		);
	} );
} );
