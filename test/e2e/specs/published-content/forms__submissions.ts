/**
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	EditorPage,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	JetpackFormsInboxPage,
} from '@automattic/calypso-e2e';
import { Page, Browser, Locator } from 'playwright';

const formData = {
	name: `${ DataHelper.getRandomPhrase() }`,
	// Making the email unique to each run allows us to filter down to one in the inbox later.
	email: `test${ DataHelper.getTimestamp() + DataHelper.getRandomInteger( 0, 100 ) }@example.com`,
	phone: `(877) 273-3049`,
	hearAboutUsOption: 'Search Engine',
	otherDetails: 'Test submission details',
};

const postTitle = DataHelper.getRandomPhrase();

declare const browser: Browser;

describe( DataHelper.createSuiteTitle( 'Full Form Submission Flow' ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features );

	let page: Page;
	let editorPage: EditorPage;
	let publishedFormLocator: Locator;

	let testAccount: TestAccount;

	beforeAll( async () => {
		page = await browser.newPage();
		editorPage = new EditorPage( page );

		testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	describe( 'Create a new post with a Registration Form', function () {
		it( 'Go to the new post page', async function () {
			await editorPage.visit( 'post' );
		} );

		it( 'Enter post title', async function () {
			await editorPage.enterTitle( postTitle );
		} );

		it( 'Add a Registration Form block', async function () {
			await editorPage.addBlockFromSidebar( 'Registration Form', '[aria-label="Block: Form"]', {
				noSearch: true,
			} );
		} );

		it( 'Publish and visit post', async function () {
			await editorPage.publish( { visit: true } );
		} );
	} );

	describe( 'Fill and submit form', function () {
		it( 'Fill out form', async function () {
			publishedFormLocator = page.locator( "[data-test='contact-form']" );

			await publishedFormLocator.getByRole( 'textbox', { name: 'Name' } ).fill( formData.name );

			await publishedFormLocator.getByRole( 'textbox', { name: 'Email' } ).fill( formData.email );

			await publishedFormLocator.getByRole( 'textbox', { name: 'Phone' } ).fill( formData.phone );

			// Not a true "select" element, so we can't use the native Playwright select() method.
			await publishedFormLocator.getByRole( 'combobox' ).click();
			await publishedFormLocator
				.getByRole( 'option', { name: formData.hearAboutUsOption } )
				.click();

			await publishedFormLocator
				.getByRole( 'textbox', { name: 'Other details' } )
				.fill( formData.otherDetails );
		} );

		it( 'Submit form', async function () {
			await publishedFormLocator.getByRole( 'button', { name: 'Send' } ).click();

			await page.getByText( 'Your message has been sent' ).waitFor( { timeout: 20 * 1000 } );
		} );
	} );

	describe( 'Validate response', function () {
		let jetpackFormsInboxPage: JetpackFormsInboxPage;
		it( 'Navigate to the Jetpack Forms Inbox', async function () {
			jetpackFormsInboxPage = new JetpackFormsInboxPage( page );
			await jetpackFormsInboxPage.visit( testAccount.getSiteURL( { protocol: true } ) );
		} );

		it( 'Search for unique response email until result shows up', async function () {
			// There's a lot we have to account for to stably find the right response!
			// First, there may be a delay in the response showing up.
			// Second, the response may be in the spam folder!
			// Fortunately, searching is the solution, as it triggers a data reload, and also shows result numbers in each folder.
			// The email is unique to every run, so will only ever return one response result when the search is successful.
			// So we loop over a search attempt on the email, looking for a folder tab with a result in it!
			const searchAndClickFolderWithResult = async () => {
				await jetpackFormsInboxPage.clearSearch();
				await jetpackFormsInboxPage.searchReponses( formData.email );
				await page.getByRole( 'tab', { name: /(Inbox|Spam) 1/ } ).click( { timeout: 4 * 1000 } );
			};

			const MAX_ATTEMPTS = 3;
			for ( let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++ ) {
				try {
					await searchAndClickFolderWithResult();
					return;
				} catch ( err ) {
					if ( attempt === MAX_ATTEMPTS ) {
						throw err;
					}
				}
			}
		} );

		it( 'Click response row', async () => {
			await jetpackFormsInboxPage.clickResponseRowByText( formData.name );
		} );

		it( 'Validate response data', async () => {
			await jetpackFormsInboxPage.validateTextInSubmission( formData.name );
			await jetpackFormsInboxPage.validateTextInSubmission( formData.email );
			await jetpackFormsInboxPage.validateTextInSubmission( formData.phone );
			await jetpackFormsInboxPage.validateTextInSubmission( formData.hearAboutUsOption );
			await jetpackFormsInboxPage.validateTextInSubmission( formData.otherDetails );
		} );
	} );
} );
