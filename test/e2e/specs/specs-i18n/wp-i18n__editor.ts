/**
 * @group i18n
 */

import {
	BrowserHelper,
	ChangeUILanguageFlow,
	DataHelper,
	GutenbergEditorPage,
	LoginPage,
	NewPostFlow,
	setupHooks,
} from '@automattic/calypso-e2e';
import { Page, Frame } from 'playwright';
import type { LanguageSlug } from '@automattic/languages';

interface TranslationsBlock {
	blockName: string;
	blockEditorSelector: string;
	blockEditorContent: string[];
	blockPanelTitle: string;
}

type Translations = {
	[ language in LanguageSlug ]?: Partial< {
		blocks: TranslationsBlock[];
	} >;
};

const EMPTY_TRANSLATIONS_BLOCKS = [ {} as TranslationsBlock ];

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
const locale = BrowserHelper.getLocale() as LanguageSlug;
const localeTranslations = translations[ locale ];
const describeSkipNoTranslations = localeTranslations ? describe : describe.skip;

describeSkipNoTranslations(
	DataHelper.createSuiteTitle( `Editor Translations (${ locale })` ),
	() => {
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

		it( 'Log in', async () => {
			const loginPage = new LoginPage( page );
			await loginPage.login( { account: 'i18nUser' } );
		} );

		it( 'Change UI language', async () => {
			await Promise.all( [
				page.waitForNavigation( { url: '**/home/**', waitUntil: 'load' } ),
				page.goto( DataHelper.getCalypsoURL( '/' ) ),
			] );

			const changeUILanguageFlow = new ChangeUILanguageFlow( page );
			await changeUILanguageFlow.changeUILanguage( locale );

			await Promise.all( [
				page.waitForNavigation( { url: '**/home/**', waitUntil: 'load' } ),
				page.goto( DataHelper.getCalypsoURL( '/' ) ),
			] );
		} );

		it( 'Start new post', async () => {
			const newPostFlow = new NewPostFlow( page );
			await newPostFlow.newPostFromNavbar();

			gutenbergEditorPage = new GutenbergEditorPage( page );
		} );

		describeSkipNoTranslations.each( localeTranslations?.blocks || EMPTY_TRANSLATIONS_BLOCKS )(
			'Translations for block: $blockName',
			( block ) => {
				let frame: Frame;

				beforeAll( async () => {
					frame = await gutenbergEditorPage.getEditorFrame();
					await gutenbergEditorPage.addBlock( block.blockName, block.blockEditorSelector );
				} );

				it( 'Render block content translations', async () => {
					await Promise.all(
						block.blockEditorContent.map( ( content ) =>
							frame.waitForSelector( `${ block.blockEditorSelector } ${ content }` )
						)
					);
				} );

				it( 'Render block title translations', async () => {
					await gutenbergEditorPage.openSettings();
					await frame.click( block.blockEditorSelector );

					// Ensure topmost block parent is selected.
					async function clickBlockParentSelector() {
						await frame.click( '.block-editor-block-parent-selector__button' );
						return clickBlockParentSelector();
					}
					await Promise.race( [
						frame.waitForSelector( `${ block.blockEditorSelector }.is-selected` ),
						clickBlockParentSelector(),
					] );

					await frame.waitForSelector(
						`.block-editor-block-card__title:has-text("${ block.blockPanelTitle }")`
					);
				} );
			}
		);
	}
);
