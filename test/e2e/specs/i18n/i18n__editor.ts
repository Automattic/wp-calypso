/**
 * @group i18n
 */

import {
	EditorPage,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	RestAPIClient,
	EditorWelcomeTourComponent,
	EditorComponent,
} from '@automattic/calypso-e2e';
import { Page, Browser, Locator } from 'playwright';
import type { LanguageSlug } from '@automattic/languages';

type Translations = {
	[ language in LanguageSlug ]?: Partial< {
		etkPlugin: {
			welcomeGuide: {
				openGuideSelector: string;
				welcomeTitleSelector: string;
				closeButtonSelector: string;
			};
		};
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
		etkPlugin: {
			welcomeGuide: {
				openGuideSelector:
					'.interface-more-menu-dropdown__content button:has-text("Welcome Guide")',
				welcomeTitleSelector:
					'.wpcom-tour-kit-step-card__heading:has-text("Welcome to WordPress!")',
				closeButtonSelector: '.wpcom-tour-kit button[aria-label="Close Tour"]',
			},
		},
		blocks: [
			// Core
			{
				blockName: 'Image',
				blockEditorSelector: '[data-type="core/image"]',
				blockEditorContent: [
					'.components-placeholder__label:has-text("Image")',
					'.jetpack-external-media-button-menu:has-text("Select Image")', // Jetpack extension
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
				blockName: 'Contact Form',
				blockEditorSelector: '[data-type="jetpack/contact-form"]',
				blockEditorContent: [ ':text("Name")', ':text("Email")', ':text("Message")' ],
				blockPanelTitle: 'Form',
			},
			{
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
		etkPlugin: {
			welcomeGuide: {
				openGuideSelector:
					'.interface-more-menu-dropdown__content button:has-text("Guide de bienvenue")',
				welcomeTitleSelector:
					'.wpcom-tour-kit-step-card__heading:has-text("Bienvenue dans WordPress !")',
				closeButtonSelector: '.wpcom-tour-kit button[aria-label="Fermer la visite"]',
			},
		},
		blocks: [
			// Core
			{
				blockName: 'Image',
				blockEditorSelector: '[data-type="core/image"]',
				blockEditorContent: [
					'.components-placeholder__label:has-text("Image")',
					'.jetpack-external-media-button-menu:has-text("Sélectionner une image")', // Jetpack extension
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
				blockName: 'Formulaire de contact',
				blockEditorSelector: '[data-type="jetpack/contact-form"]',
				blockEditorContent: [ ':text("Nom")', ':text("E-mail")', ':text("Message")' ],
				blockPanelTitle: 'Formulaire',
			},
			{
				blockName: 'Heures d’ouverture',
				blockEditorSelector: '[data-type="jetpack/business-hours"]',
				blockEditorContent: [
					'.business-hours__day-name:text("lundi")',
					'.business-hours__hours:has-text("Ajouter les heures")',
				],
				blockPanelTitle: 'Heures d’ouverture',
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
		etkPlugin: {
			welcomeGuide: {
				openGuideSelector:
					'.interface-more-menu-dropdown__content button:has-text("מדריך ברוכים הבאים")',
				welcomeTitleSelector:
					'.wpcom-tour-kit-step-card__heading:has-text("ברוך בואך ל-WordPress!")',
				closeButtonSelector: '.wpcom-tour-kit button[aria-label="לסגור את הסיור"]',
			},
		},
		blocks: [
			// Core
			{
				blockName: 'תמונה',
				blockEditorSelector: '[data-type="core/image"]',
				blockEditorContent: [
					'.components-placeholder__label:has-text("תמונה")',
					'.jetpack-external-media-button-menu:has-text("לבחור תמונה")', // Jetpack extension
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
				blockName: 'טופס יצירת קשר',
				blockEditorSelector: '[data-type="jetpack/contact-form"]',
				blockEditorContent: [ ':text("שם")', ':text("אימייל")', ':text("הודעה")' ],
				blockPanelTitle: 'טופס',
			},
			{
				blockName: 'שעות פעילות',
				blockEditorSelector: '[data-type="jetpack/business-hours"]',
				blockEditorContent: [
					'.business-hours__day-name:text("יום שני")',
					'.business-hours__hours:has-text("הוספת שעות")',
				],
				blockPanelTitle: 'שעות פעילות',
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

declare const browser: Browser;

describe( 'I18N: Editor', function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( { ...features, variant: 'i18n' } );
	const testAccount = new TestAccount( accountName );

	// Filter out the locales that do not have valid translation content defined above.
	const locales: LanguageSlug[] = Object.keys( translations ).filter( ( locale ) =>
		( envVariables.TEST_LOCALES as ReadonlyArray< string > ).includes( locale )
	) as LanguageSlug[];
	let page: Page;
	let editorPage: EditorPage;
	let restAPIClient: RestAPIClient;

	beforeAll( async () => {
		page = await browser.newPage();
		// Confirm page leave with unsaved changes prompt.
		page.on( 'dialog', async ( dialog ) => {
			if ( dialog.type() === 'beforeunload' ) {
				await dialog.accept();
			}
		} );

		await testAccount.authenticate( page );
		restAPIClient = new RestAPIClient( testAccount.credentials );

		editorPage = new EditorPage( page );
	} );

	describe.each( locales )( `Locale: %s`, function ( locale ) {
		beforeAll( async function () {
			await restAPIClient.setMySettings( { language: locale } );
			await page.reload();
		} );

		describe( 'Editing Toolkit Plugin', function () {
			it( 'Go to the new post page', async function () {
				await editorPage.visit( 'post' );
			} );

			it( 'Translations for Welcome Guide', async function () {
				// Abort API request to fetch the Welcome Tour status in order to avoid
				// overwriting the current state when the request finishes.
				await page.route( '**/block-editor/nux*', ( route ) => {
					route.abort();
				} );

				// @TODO Consider moving this to EditorPage.
				const editor = new EditorComponent( page );
				const editorWelcomeTourComponent = new EditorWelcomeTourComponent( page, editor );

				// We know these are all defined because of the filtering above. Non-null asserting is safe here.
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const etkTranslations = translations[ locale ]!.etkPlugin!;

				// Ensure the Welcome Guide component is shown.
				await editorWelcomeTourComponent.forceShowWelcomeTour();

				const editorParent = await editorPage.getEditorParent();

				await editorParent.locator( etkTranslations.welcomeGuide.welcomeTitleSelector ).waitFor();
				await editorParent.locator( etkTranslations.welcomeGuide.closeButtonSelector ).click();
			} );
		} );

		// We know these are all defined because of the filtering above. Non-null asserting is safe here.
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		describe.each( translations[ locale ]!.blocks! )(
			'Translations for block: $blockName',
			( ...args ) => {
				const block = args[ 0 ]; // Makes TS stop complaining about incompatible args type
				let editorPage: EditorPage;
				let editorParent: Locator;

				it( 'Insert test block', async function () {
					editorPage = new EditorPage( page );
					await editorPage.addBlockFromSidebar( block.blockName, block.blockEditorSelector );
				} );

				it( 'Render block content translations', async function () {
					editorParent = await editorPage.getEditorParent();
					// Ensure block contents are translated as expected.
					// To deal with multiple potential matches (eg. Jetpack/Business Hours > Add Hours)
					// the first locator is matched.
					await Promise.all(
						block.blockEditorContent.map( ( content ) =>
							editorParent
								.locator( `${ block.blockEditorSelector } ${ content }` )
								.first()
								.waitFor()
						)
					);
				} );

				it( 'Render block title translations', async function () {
					await editorPage.openSettings();

					// If on block insertion, one of the sub-blocks are selected, click on
					// the first button in the floating toolbar which selects the overall
					// block.
					if (
						await editorParent
							.locator( '.block-editor-block-parent-selector__button:visible' )
							.count()
					) {
						await editorParent.locator( '.block-editor-block-parent-selector__button' ).click();
					}

					// Ensure the Settings with the block selected shows the expected title.
					await editorParent
						.locator( `.block-editor-block-card__title:has-text("${ block.blockPanelTitle }")` )
						.waitFor();
				} );
			}
		);
	} );
} );
