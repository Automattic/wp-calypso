/**
 * @group i18n
 */

import {
	DataHelper,
	LoginFlow,
	// NewPostFlow,
	ChangeUILanguageFlow,
	GutenbergEditorPage,
	setupHooks,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

const translations = {
	en: {
		blocks: [
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
	// fr: {
	// 	blocks: [
	// 		{
	// 			blockName: 'Applaudissement',
	// 			blockEditorSelector: '[data-type="crowdsignal-forms/applause"]',
	// 			blockEditorContent: [ ':text("Claps")' ],
	// 			blockPanelTitle: 'Applaudissement',
	// 		},
	// 		{
	// 			blockName: 'Sondage',
	// 			blockEditorSelector: '[data-type="crowdsignal-forms/poll"]',
	// 			blockEditorContent: [
	// 				'[aria-label="Entrez votre question"]',
	// 				'[aria-label="Ajouter une note (facultatif)"]',
	// 			],
	// 			blockPanelTitle: 'Sondage',
	// 		},
	// 	],
	// },
	// he: {
	// 	blocks: [
	// 		{
	// 			blockName: 'מחיאות כפיים',
	// 			blockEditorSelector: '[data-type="crowdsignal-forms/applause"]',
	// 			blockEditorContent: [ ':text("Claps")' ],
	// 			blockPanelTitle: 'מחיאות כפיים',
	// 		},
	// 		{
	// 			blockName: 'סקר',
	// 			blockEditorSelector: '[data-type="crowdsignal-forms/poll"]',
	// 			blockEditorContent: [
	// 				'[aria-label="יש להזין את השאלה שלך"]',
	// 				'[aria-label="להוסיף פתק (אופציונלי)"]',
	// 			],
	// 			blockPanelTitle: 'סקר',
	// 		},
	// 	],
	// },
};
const locales = Object.keys( translations );

describe( DataHelper.createSuiteTitle( 'Editor Translations' ), function () {
	let gutenbergEditorPage: GutenbergEditorPage;
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginFlow = new LoginFlow( page, 'i18nUser' ); // @todo: Login with i18n testing account.
		// const loginFlow = new LoginFlow( page, 'gutenbergSimpleSiteUser' ); // @todo: Login with i18n testing account.
		await loginFlow.logIn();
	} );

	describe.each( locales )( 'Editor translations (%s)', ( locale ) => {
		it( 'Change UI language', async function () {
			await page.goto( DataHelper.getCalypsoURL( '/' ) );

			const changeUILanguageFlow = new ChangeUILanguageFlow( page );
			await changeUILanguageFlow.changeUILanguage( locale );
		} );

		it( 'Start new post', async function () {
			// @todo: NewPostFlow.newPostFromNavbar() doesn't work on non-English UI.
			// const newPostFlow = new NewPostFlow( page );
			// await newPostFlow.newPostFromNavbar();
			await page.click( '.masterbar__publish a' );
			await page.click( '.site-selector__sites .site__content' );

			gutenbergEditorPage = new GutenbergEditorPage( page );
			await gutenbergEditorPage.waitUntilLoaded();
			await gutenbergEditorPage.dismissWelcomeTourIfPresent();
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

				await gutenbergEditorPage.openSettings();
				await frame.click( block.blockEditorSelector );

				await frame.waitForSelector(
					`.block-editor-block-card__title:has-text("${ block.blockPanelTitle }")`
				);
			}
		);
	} );
} );
