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

const formData1 = {
	name: `${ DataHelper.getRandomPhrase() }`,
	// Making the email unique to each run allows us to filter down to one in the inbox later.
	email: `test${ DataHelper.getTimestamp() + DataHelper.getRandomInteger( 0, 100 ) }@example.com`,
	phone: '(877) 273-3049',
	hearAboutUsOption: 'Search Engine',
	otherDetails: 'Test submission details - First',
};

const formData2 = {
	name: `${ DataHelper.getRandomPhrase() }`,
	// Making the email unique for the second submission
	email: `test${ DataHelper.getTimestamp() + DataHelper.getRandomInteger( 100, 200 ) }@example.com`,
	phone: '(877) 273-3050',
	hearAboutUsOption: 'Social Media',
	otherDetails: 'Test submission details - Second',
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

		const postContent = `<!-- wp:jetpack/contact-form {"subject":"A new registration from your website","to":"","disableGoBack":false,"style":{"spacing":{"padding":{"top":"16px","right":"16px","bottom":"16px","left":"16px"}}}} -->
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

	describe( 'Fill and submit first form', function () {
		it( 'View the published post', async function () {
			await page.goto( newPostDetails.URL );
		} );

		it( 'Fill out first form', async function () {
			publishedFormLocator = page.locator( "[data-test='contact-form']" );

			await publishedFormLocator.getByRole( 'textbox', { name: 'Name' } ).fill( formData1.name );

			await publishedFormLocator.getByRole( 'textbox', { name: 'Email' } ).fill( formData1.email );

			await publishedFormLocator.getByRole( 'textbox', { name: 'Phone' } ).fill( formData1.phone );

			await publishedFormLocator
				.getByRole( 'combobox', { name: 'How did you hear about us?' } )
				.selectOption( { label: formData1.hearAboutUsOption } );

			await publishedFormLocator
				.getByRole( 'textbox', { name: 'Other details' } )
				.fill( formData1.otherDetails );
		} );

		it( 'Submit first form', async function () {
			await publishedFormLocator.getByRole( 'button', { name: 'Send' } ).click();

			await page
				// TODO: "Thank you for your response" changed to "Your message has been sent" in the latest version of the plugin.
				// Eventually we can remove the "Thank you for your response" option and just use "Your message has been sent" (we don't check for emojis).
				.getByText( /Thank you for your response\.|Your message has been sent/ )
				.waitFor( { timeout: 20 * 1000 } );
		} );

		it( 'Verify "← Back" link appears', async function () {
			// TODO: "back" link changed from "Go back" to "← Back" in the latest version of the plugin.
			// Eventually we can remove the "Go back" option and just use "Back" (we don't check for emojis).
			await page.getByRole( 'button', { name: /Back|Go back/ } ).waitFor();
		} );

		it( 'Click "← Back" to return to form', async function () {
			// TODO: "back" link changed from "Go back" to "← Back" in the latest version of the plugin.
			// Eventually we can remove the "Go back" option and just use "Back" (we don't check for emojis).
			await page.getByRole( 'button', { name: /Back|Go back/ } ).click();
			// Verify the form is visible again and the success message is hidden
			await publishedFormLocator.getByRole( 'button', { name: 'Send' } ).waitFor();
			// Wait for the success message to be hidden
			await page.waitForTimeout( 500 );
		} );
	} );

	describe( 'Fill and submit second form', function () {
		it( 'Reload the page to get a fresh form', async function () {
			await page.reload();
			publishedFormLocator = page.locator( "[data-test='contact-form']" );
			// Wait for the form to be ready
			await publishedFormLocator.getByRole( 'button', { name: 'Send' } ).waitFor();
		} );

		it( 'Fill out second form', async function () {
			await publishedFormLocator.getByRole( 'textbox', { name: 'Name' } ).fill( formData2.name );

			await publishedFormLocator.getByRole( 'textbox', { name: 'Email' } ).fill( formData2.email );

			await publishedFormLocator.getByRole( 'textbox', { name: 'Phone' } ).fill( formData2.phone );

			await publishedFormLocator
				.getByRole( 'combobox', { name: 'How did you hear about us?' } )
				.selectOption( { label: formData2.hearAboutUsOption } );

			await publishedFormLocator
				.getByRole( 'textbox', { name: 'Other details' } )
				.fill( formData2.otherDetails );
		} );

		it( 'Submit second form', async function () {
			await publishedFormLocator.getByRole( 'button', { name: 'Send' } ).click();

			// Wait for the success message to become visible (not just exist)
			await page
				// TODO: "Thank you for your response" changed to "Your message has been sent" in the latest version of the plugin.
				// Eventually we can remove the "Thank you for your response" option and just use "Your message has been sent" (we don't check for emojis).
				.getByText( /Thank you for your response\.|Your message has been sent/ )
				.waitFor( { timeout: 20 * 1000 } );
		} );
	} );

	describe( 'Validate first response', function () {
		let feedbackInboxPage: FeedbackInboxPage;
		let isInSpam = false;

		beforeAll( async function () {
			await testAccount.authenticate( page );

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

		it( 'Search for first response email until result shows up', async function () {
			// There's a lot we have to account for to stably find the right response!
			// First, there may be a delay in the response showing up.
			// Second, the response may be in the spam folder!
			// Fortunately, searching is the solution, as it triggers a data reload, and also shows result numbers in each folder.
			// The email is unique to every run, so will only ever return one response result when the search is successful.
			// So we loop over a search attempt on the email, looking for a folder tab with a result in it!
			const searchAndClickFolderWithResult = async () => {
				await feedbackInboxPage.searchResponses( formData1.email );
				const tabLocator = page
					.getByRole( 'tab', { name: /(Inbox|Spam) 1/ } )
					.or( page.getByRole( 'radio', { name: /(Inbox|Spam)\s*\(\s*1\s*\)/ } ) );
				await tabLocator.click( { timeout: 4000 } );
				// Check if we're in spam folder
				const tabText = await tabLocator.textContent();
				isInSpam = tabText?.toLowerCase().includes( 'spam' ) || false;
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

		it( 'If in Spam, mark as not spam', async function () {
			if ( isInSpam ) {
				await feedbackInboxPage.clickResponseRowByText( formData1.name );
				await feedbackInboxPage.clickNotSpamAction();
			}
		} );

		it( 'Navigate to Inbox tab if needed', async function () {
			// if it's not in spam, we should already be in the inbox tab as per
			// find and click on the search test above.
			if ( isInSpam ) {
				await feedbackInboxPage.clickFolderTab( 'Inbox' );
			}
		} );

		it( 'Validate first response data', async () => {
			await feedbackInboxPage.clickResponseRowByText( formData1.name );
			await feedbackInboxPage.validateTextInSubmission( formData1.name );
			await feedbackInboxPage.validateTextInSubmission( formData1.email );
			await feedbackInboxPage.validateTextInSubmission( formData1.phone );
			await feedbackInboxPage.validateTextInSubmission( formData1.hearAboutUsOption );
			await feedbackInboxPage.validateTextInSubmission( formData1.otherDetails );
			await feedbackInboxPage.clickCloseResponse();
		} );
	} );

	describe( 'Validate second response', function () {
		let feedbackInboxPage: FeedbackInboxPage;
		let isInSpam = false;

		it( 'Search for second response email until result shows up', async function () {
			feedbackInboxPage = new FeedbackInboxPage( page );

			const searchAndClickFolderWithResult = async () => {
				// Don't clear/wait as it won't happen, results are cached.
				await feedbackInboxPage.clearSearch( true );
				await feedbackInboxPage.searchResponses( formData2.email );
				const tabLocator = page
					.getByRole( 'tab', { name: /(Inbox|Spam) 1/ } )
					.or( page.getByRole( 'radio', { name: /(Inbox|Spam)\s*\(\s*1\s*\)/ } ) );
				await tabLocator.click( { timeout: 4000 } );
				// Check if we're in spam folder
				const tabText = await tabLocator.textContent();
				isInSpam = tabText?.toLowerCase().includes( 'spam' ) || false;
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

		it( 'Click second response row', async () => {
			await feedbackInboxPage.clickResponseRowByText( formData2.name );
		} );

		it( 'If in Spam, mark as not spam', async function () {
			if ( isInSpam ) {
				await feedbackInboxPage.clickNotSpamAction();
			}
		} );

		it( 'Navigate to Inbox tab', async function () {
			if ( isInSpam ) {
				// Clear search first to show all responses
				await feedbackInboxPage.clearSearch( true );
				await feedbackInboxPage.clickFolderTab( 'Inbox' );
				// Wait for folder change to complete
				await page.waitForTimeout( 1000 );
				// Search again for the second response in Inbox
				await feedbackInboxPage.searchResponses( formData2.name );
				await feedbackInboxPage.clickResponseRowByText( formData2.name );
			}
		} );

		it( 'Validate second response data', async () => {
			await feedbackInboxPage.validateTextInSubmission( formData2.name );
			await feedbackInboxPage.validateTextInSubmission( formData2.email );
			await feedbackInboxPage.validateTextInSubmission( formData2.phone );
			await feedbackInboxPage.validateTextInSubmission( formData2.hearAboutUsOption );
			await feedbackInboxPage.validateTextInSubmission( formData2.otherDetails );
			await feedbackInboxPage.clickCloseResponse();
		} );
	} );

	describe( 'Test response navigation', function () {
		let feedbackInboxPage: FeedbackInboxPage;

		it( 'Clear search to show both responses', async function () {
			feedbackInboxPage = new FeedbackInboxPage( page );
			await feedbackInboxPage.clearSearch( true );
			// Wait for the data to reload
			await page.waitForTimeout( 1000 );
		} );

		it( 'Click on first response', async function () {
			await feedbackInboxPage.clickResponseRowByText( formData1.name );
		} );

		it( 'Verify first response data is visible', async function () {
			await feedbackInboxPage.validateTextInSubmission( formData1.name );
			await feedbackInboxPage.validateTextInSubmission( formData1.email );
		} );

		it( 'Click Previous to navigate to second response', async function () {
			if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
				await feedbackInboxPage.clickPreviousResponse();
			}
		} );

		it( 'Verify second response data is visible', async function () {
			if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
				await feedbackInboxPage.validateTextInSubmission( formData2.name );
				await feedbackInboxPage.validateTextInSubmission( formData2.email );
			}
		} );

		it( 'Click Next to navigate back to first response', async function () {
			if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
				await feedbackInboxPage.clickNextResponse();
			}
		} );

		it( 'Verify first response data is visible again', async function () {
			if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
				await feedbackInboxPage.validateTextInSubmission( formData1.name );
				await feedbackInboxPage.validateTextInSubmission( formData1.email );
			}
		} );

		it( 'Close response modal', async function () {
			if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
				await feedbackInboxPage.clickCloseResponse();
			}
		} );
	} );

	describe( 'Test response actions', function () {
		let feedbackInboxPage: FeedbackInboxPage;

		it( 'Verify Trash action exists in actions menu', async function () {
			feedbackInboxPage = new FeedbackInboxPage( page );
			await feedbackInboxPage.verifyActionExistsInMenu( formData1.name, 'Trash' );
		} );

		it( 'Ensure first response is selected', async function () {
			await feedbackInboxPage.clickResponseRowByText( formData1.name );
		} );

		it( 'Mark first response as unread', async function () {
			await feedbackInboxPage.clickMarkAsUnreadAction();
		} );

		it( 'Mark first response as read', async function () {
			// Re-select the response after the action
			// await feedbackInboxPage.clickResponseRowByText( formData1.name );
			await feedbackInboxPage.clickMarkAsReadAction();
		} );

		it( 'Mark first response as spam', async function () {
			// Re-select the response after the action
			// await feedbackInboxPage.clickResponseRowByText( formData1.name );
			await feedbackInboxPage.clickMarkAsSpamAction();
		} );

		it( 'Navigate to Spam folder', async function () {
			await feedbackInboxPage.clickFolderTab( 'Spam' );
		} );

		it( 'Verify first response is in Spam', async function () {
			await feedbackInboxPage.searchResponses( formData1.email );
			await feedbackInboxPage.clickResponseRowByText( formData1.name );
			await feedbackInboxPage.validateTextInSubmission( formData1.name );
		} );

		it( 'Mark first response as not spam', async function () {
			await feedbackInboxPage.clickNotSpamAction();
		} );

		it( 'Navigate back to Inbox', async function () {
			await feedbackInboxPage.clickFolderTab( 'Inbox' );
		} );

		it( 'Verify first response is back in Inbox', async function () {
			await feedbackInboxPage.searchResponses( formData1.email, true );
			await feedbackInboxPage.clickResponseRowByText( formData1.name );
			await feedbackInboxPage.validateTextInSubmission( formData1.name );
		} );

		it( 'Move first response to trash', async function () {
			await feedbackInboxPage.clickMoveToTrashAction();
		} );

		it( 'Navigate to Trash folder', async function () {
			await feedbackInboxPage.clickFolderTab( 'Trash' );
		} );

		it( 'Verify first response is in Trash', async function () {
			await feedbackInboxPage.searchResponses( formData1.email, true );
			await feedbackInboxPage.clickResponseRowByText( formData1.name );
			await feedbackInboxPage.validateTextInSubmission( formData1.name );
		} );

		it( 'Restore first response from trash', async function () {
			await feedbackInboxPage.clickRestoreAction();
		} );

		it( 'Navigate back to Inbox to confirm', async function () {
			await feedbackInboxPage.clickFolderTab( 'Inbox' );
		} );

		it( 'Verify first response is restored in Inbox', async function () {
			await feedbackInboxPage.searchResponses( formData1.email, true );
			await feedbackInboxPage.clickResponseRowByText( formData1.name );
			await feedbackInboxPage.validateTextInSubmission( formData1.name );
		} );
	} );
} );
