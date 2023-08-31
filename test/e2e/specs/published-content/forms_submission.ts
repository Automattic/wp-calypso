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
} from '@automattic/calypso-e2e';
import { Page, Browser, Locator } from 'playwright';

const formData = {
	name: `${ DataHelper.getRandomPhrase() }`,
	email: `test${ DataHelper.getTimestamp() }@example.com`,
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

	beforeAll( async () => {
		page = await browser.newPage();
		editorPage = new EditorPage( page );

		const testAccount = new TestAccount( accountName );
		await testAccount.authenticate( page );
	} );

	describe( 'Create new post with Registration form', function () {
		it( 'Go to the new post page', async function () {
			await editorPage.visit( 'post' );
		} );

		it( 'Enter post title', async function () {
			await editorPage.enterTitle( postTitle );
		} );

		it( 'Add a Registration Form', async function () {
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

	// Validate submission with a promise race between checking spam and normal input
} );
