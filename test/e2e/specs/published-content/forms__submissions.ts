/**
 * @group jetpack-wpcom-integration
 */

import {
	DataHelper,
	TestAccount,
	envVariables,
	getTestAccountByFeature,
	envToFeatureKey,
	FeedbackInboxPage,
	RestAPIClient,
	PostResponse,
} from '@automattic/calypso-e2e';
import { Page, Browser, Locator } from 'playwright';

const formData = {
	name: `${ DataHelper.getRandomPhrase() }`,
	// Making the email unique to each run allows us to filter down to one in the inbox later.
	email: `test${ DataHelper.getTimestamp() + DataHelper.getRandomInteger( 0, 100 ) }@example.com`,
	phone: '(877) 273-3049',
	hearAboutUsOption: 'Search Engine',
	otherDetails: 'Test submission details',
};

const postTitle = DataHelper.getRandomPhrase();

declare const browser: Browser;

/**
 * Tests the process of a user submitting a form and the site owner checking the received response.
 *
 * Keywords: Jetpack, Forms, Feedback
 */
describe( DataHelper.createSuiteTitle( 'Feedback: Form Submission' ), function () {
	const features = envToFeatureKey( envVariables );
	const accountName = getTestAccountByFeature( features );
	const testAccount = new TestAccount( accountName );

	let page: Page;
	let publishedFormLocator: Locator;

	let restAPIClient: RestAPIClient;
	let newPostDetails: PostResponse;

	beforeAll( async () => {
		page = await browser.newPage();

		const postContent = `<!-- wp:jetpack/contact-form {"subject":"A new registration from your website","to":"","style":{"spacing":{"padding":{"top":"16px","right":"16px","bottom":"16px","left":"16px"}}}} -->
						<div class="wp-block-jetpack-contact-form" style="padding-top:16px;padding-right:16px;padding-bottom:16px;padding-left:16px"><!-- wp:jetpack/field-name {"required":true,"requiredText":"(required)"} /-->

						<!-- wp:jetpack/field-email {"required":true,"requiredText":"(required)"} /-->

						<!-- wp:jetpack/field-telephone {"requiredText":"(required)"} /-->

						<!-- wp:jetpack/field-select {"label":"How did you hear about us?","requiredText":"(required)","options":["Search Engine","Social Media","TV","Radio","Friend or Family"],"toggleLabel":"Select one option"} /-->

						<!-- wp:jetpack/field-textarea {"label":"Other Details","requiredText":"(required)"} /-->

						<!-- wp:jetpack/button {"element":"button","text":"Send","lock":{"remove":true}} /--></div>
						<!-- /wp:jetpack/contact-form -->
		`;

		restAPIClient = new RestAPIClient( testAccount.credentials );

		// Create a post with the Registration Forms added.
		newPostDetails = await restAPIClient.createPost(
			testAccount.credentials.testSites?.primary.id as number,
			{
				title: postTitle,
				content: postContent,
			}
		);
	} );

	describe( 'Fill and submit form', function () {
		it( 'View the published post', async function () {
			await page.goto( newPostDetails.URL );
		} );

		it( 'Fill out form', async function () {
			publishedFormLocator = page.locator( "[data-test='contact-form']" );

			await publishedFormLocator.getByRole( 'textbox', { name: 'Name' } ).fill( formData.name );

			await publishedFormLocator.getByRole( 'textbox', { name: 'Email' } ).fill( formData.email );

			await publishedFormLocator.getByRole( 'textbox', { name: 'Phone' } ).fill( formData.phone );

			await publishedFormLocator
				.getByRole( 'combobox', { name: 'How did you hear about us?' } )
				.selectOption( { label: formData.hearAboutUsOption } );

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
		let feedbackInboxPage: FeedbackInboxPage;

		beforeAll( async function () {
			if ( accountName === 'jetpackAtomicEcommPlanUser' ) {
				// eCommerce plan sites attempt to load Calypso, but with
				// third-party cookies disabled the fallback route to WP-Admin
				// kicks in after some time.
				await testAccount.authenticate( page, { url: /wp-admin/ } );
			} else {
				await testAccount.authenticate( page );
			}

			// Atomic tests sites might have local users, so the Jetpack SSO login will
			// show up when visiting the Jetpack dashboard directly. We can bypass it if
			// we simulate a redirect from Calypso to WP Admin with a hardcoded referer.
			// @see https://github.com/Automattic/jetpack/blob/12b3b9a4771169398d4e1982573aaec820babc17/projects/plugins/wpcomsh/wpcomsh.php#L230-L254
			if ( envVariables.TEST_ON_ATOMIC ) {
				const siteUrl = testAccount.getSiteURL( { protocol: true } );
				await page.goto( `${ siteUrl }wp-admin/`, {
					timeout: 15 * 1000,
					referer: 'https://wordpress.com/',
				} );
			}
		} );

		it( 'Navigate to the Jetpack Forms Inbox', async function () {
			feedbackInboxPage = new FeedbackInboxPage( page );
			await feedbackInboxPage.visit( testAccount.getSiteURL( { protocol: true } ) );
		} );

		it( 'Search for unique response email until result shows up', async function () {
			// There's a lot we have to account for to stably find the right response!
			// First, there may be a delay in the response showing up.
			// Second, the response may be in the spam folder!
			// Fortunately, searching is the solution, as it triggers a data reload, and also shows result numbers in each folder.
			// The email is unique to every run, so will only ever return one response result when the search is successful.
			// So we loop over a search attempt on the email, looking for a folder tab with a result in it!
			const searchAndClickFolderWithResult = async () => {
				await feedbackInboxPage.clearSearch();
				await feedbackInboxPage.searchResponses( formData.email );
				await page
					.getByRole( 'tab', { name: /(Inbox|Spam) 1/ } )
					.or( page.getByRole( 'radio', { name: /(Inbox|Spam)\s*\(\s*1\s*\)/ } ) )
					.click( { timeout: 4000 } );
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
			await feedbackInboxPage.clickResponseRowByText( formData.name );
		} );

		it( 'Validate response data', async () => {
			await feedbackInboxPage.validateTextInSubmission( formData.name );
			await feedbackInboxPage.validateTextInSubmission( formData.email );
			await feedbackInboxPage.validateTextInSubmission( formData.phone );
			await feedbackInboxPage.validateTextInSubmission( formData.hearAboutUsOption );
			await feedbackInboxPage.validateTextInSubmission( formData.otherDetails );
		} );
	} );
} );
