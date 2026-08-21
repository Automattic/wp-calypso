/**
 * Tests the process of a user submitting a form and the site owner checking the received response.
 *
 * Keywords: Jetpack, Forms, Feedback
 */

import {
	DataHelper,
	FeedbackInboxPage,
	PostResponse,
	RestAPIClient,
	TestAccount,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { Locator } from 'playwright';
import { tags, test } from '../../lib/pw-base';

const formData1 = {
	name: `${ DataHelper.getRandomPhrase() }`,
	email: `test${ DataHelper.getTimestamp() + DataHelper.getRandomInteger( 0, 100 ) }@example.com`,
	phone: '(877) 273-3049',
	hearAboutUsOption: 'Search Engine',
	otherDetails: 'Test submission details - First',
};

const formData2 = {
	name: `${ DataHelper.getRandomPhrase() }`,
	email: `test${ DataHelper.getTimestamp() + DataHelper.getRandomInteger( 100, 200 ) }@example.com`,
	phone: '(877) 273-3050',
	hearAboutUsOption: 'Social Media',
	otherDetails: 'Test submission details - Second',
};

const postTitle = DataHelper.getRandomPhrase();

test.describe(
	DataHelper.createSuiteTitle( 'Feedback: Form Submission' ),
	{ tag: [ tags.JETPACK_WPCOM_INTEGRATION ] },
	() => {
		const features = envToFeatureKey( envVariables );
		const accountName = getTestAccountByFeature( features );
		const testAccount = new TestAccount( accountName );
		// Held at suite scope so teardown can remove it even when the test fails.
		let postID: number | undefined;

		test.afterAll( async () => {
			// The test skips itself on a private site, so it created nothing to remove.
			if ( envVariables.ATOMIC_VARIATION === 'private' ) {
				return;
			}

			// Remove only what this run created — the two responses, matched by the
			// addresses generated above, and the post carrying the form. These sites
			// are shared, so deleting every response would break any run working
			// through its own at the time.
			const siteID = testAccount.credentials.testSites?.primary.id as number;
			const client = testAccount.restAPI;

			for ( const { email } of [ formData1, formData2 ] ) {
				try {
					await client.deleteFeedbackBySearch( siteID, email );
				} catch ( error ) {
					// Teardown must not fail the run — the responses may never have been
					// created if the test failed before submitting — but it must not fail
					// silently either, or a broken teardown goes unnoticed for months.
					console.warn( `Could not clean up responses for ${ email }: ${ error }` );
				}
			}

			if ( postID ) {
				try {
					await client.deletePost( siteID, postID );
				} catch ( error ) {
					console.warn( `Could not clean up post ${ postID }: ${ error }` );
				}
			}
		} );

		test( 'As a user, I can submit forms and validate responses in the feedback inbox', async ( {
			page,
		} ) => {
			test.skip(
				envVariables.ATOMIC_VARIATION === 'private',
				'Form submissions not supported on private sites'
			);

			let publishedFormLocator: Locator;
			let restAPIClient: RestAPIClient;
			let newPostDetails: PostResponse;

			await test.step( 'Setup: Create post with contact form', async () => {
				const postContent = `<!-- wp:jetpack/contact-form {"emailNotifications":false,"subject":"A new registration from your website","to":"","disableGoBack":false,"style":{"spacing":{"padding":{"top":"16px","right":"16px","bottom":"16px","left":"16px"}}}} -->
						<div class="wp-block-jetpack-contact-form" style="padding-top:16px;padding-right:16px;padding-bottom:16px;padding-left:16px"><!-- wp:jetpack/field-name {"required":true,"requiredText":"(required)"} /-->

						<!-- wp:jetpack/field-email {"required":true,"requiredText":"(required)"} /-->

						<!-- wp:jetpack/field-telephone {"requiredText":"(required)"} /-->

						<!-- wp:jetpack/field-select {"label":"How did you hear about us?","requiredText":"(required)","options":["Search Engine","Social Media","TV","Radio","Friend or Family"],"toggleLabel":"Select one option"} /-->

						<!-- wp:jetpack/field-textarea {"label":"Other Details","requiredText":"(required)"} /-->

						<!-- wp:jetpack/button {"element":"button","text":"Send","lock":{"remove":true}} /--></div>
						<!-- /wp:jetpack/contact-form -->
				`;

				restAPIClient = testAccount.restAPI;
				newPostDetails = await restAPIClient.createPost(
					testAccount.credentials.testSites?.primary.id as number,
					{ title: postTitle, content: postContent }
				);
				postID = newPostDetails.ID;
			} );

			// --- Fill and submit first form ---

			await test.step( 'View the published post', async () => {
				await page.goto( newPostDetails.URL );
			} );

			await test.step( 'Fill out first form', async () => {
				publishedFormLocator = page.locator( "[data-test='contact-form']" );

				await publishedFormLocator.getByRole( 'textbox', { name: 'Name' } ).fill( formData1.name );
				await publishedFormLocator
					.getByRole( 'textbox', { name: 'Email' } )
					.fill( formData1.email );
				await publishedFormLocator
					.getByRole( 'textbox', { name: 'Phone' } )
					.fill( formData1.phone );
				await publishedFormLocator
					.getByRole( 'combobox', { name: 'How did you hear about us?' } )
					.selectOption( { label: formData1.hearAboutUsOption } );
				await publishedFormLocator
					.getByRole( 'textbox', { name: 'Other details' } )
					.fill( formData1.otherDetails );
			} );

			await test.step( 'Submit first form', async () => {
				await publishedFormLocator.getByRole( 'button', { name: 'Send' } ).click();
				// TODO: "Thank you for your response" changed to "Your message has been sent" in the latest version of the plugin.
				await page
					.getByText( /Thank you for your response\.|Your message has been sent/ )
					.waitFor( { timeout: 20 * 1000 } );
			} );

			await test.step( 'Verify Back link appears', async () => {
				// TODO: "back" link changed from "Go back" to "← Back" in the latest version of the plugin.
				await page.getByRole( 'button', { name: /Back|Go back/ } ).waitFor();
			} );

			await test.step( 'Click Back to return to form', async () => {
				await page.getByRole( 'button', { name: /Back|Go back/ } ).click();
				await publishedFormLocator.getByRole( 'button', { name: 'Send' } ).waitFor();
			} );

			// --- Fill and submit second form ---

			await test.step( 'Reload the page to get a fresh form', async () => {
				await page.reload();
				publishedFormLocator = page.locator( "[data-test='contact-form']" );
				await publishedFormLocator.getByRole( 'button', { name: 'Send' } ).waitFor();
			} );

			await test.step( 'Fill out second form', async () => {
				await publishedFormLocator.getByRole( 'textbox', { name: 'Name' } ).fill( formData2.name );
				await publishedFormLocator
					.getByRole( 'textbox', { name: 'Email' } )
					.fill( formData2.email );
				await publishedFormLocator
					.getByRole( 'textbox', { name: 'Phone' } )
					.fill( formData2.phone );
				await publishedFormLocator
					.getByRole( 'combobox', { name: 'How did you hear about us?' } )
					.selectOption( { label: formData2.hearAboutUsOption } );
				await publishedFormLocator
					.getByRole( 'textbox', { name: 'Other details' } )
					.fill( formData2.otherDetails );
			} );

			await test.step( 'Submit second form', async () => {
				await publishedFormLocator.getByRole( 'button', { name: 'Send' } ).click();
				// TODO: "Thank you for your response" changed to "Your message has been sent" in the latest version of the plugin.
				await page
					.getByText( /Thank you for your response\.|Your message has been sent/ )
					.waitFor( { timeout: 20 * 1000 } );
			} );

			// --- Validate responses ---

			await test.step( 'Authenticate as site owner', async () => {
				await testAccount.authenticate( page );

				// Atomic tests sites might have local users, so the Jetpack SSO login will
				// show up when visiting the Jetpack dashboard directly. We can bypass it if
				// we simulate a redirect from Calypso to WP Admin with a hardcoded referer.
				if ( envVariables.TEST_ON_ATOMIC ) {
					const siteUrl = testAccount.getSiteURL( { protocol: true } );
					// Only the SSO hop matters here — the next step navigates away. Waiting
					// for "load" would wait on the dashboard's Site widget, which iframes a
					// whole front-end page and regularly outlasts the timeout.
					await page.goto( `${ siteUrl }wp-admin/`, {
						waitUntil: 'domcontentloaded',
						referer: 'https://wordpress.com/',
					} );
				}
			} );

			await test.step( 'Navigate to the Jetpack Forms Inbox', async () => {
				const feedbackInboxPage = new FeedbackInboxPage( page );
				await feedbackInboxPage.visit( testAccount.getSiteURL( { protocol: true } ) );
			} );

			// --- Validate first response ---

			let feedbackInboxPage = new FeedbackInboxPage( page );
			let isInSpam = false;

			await test.step( 'Search for first response email until result shows up', async () => {
				const MAX_ATTEMPTS = 3;
				for ( let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++ ) {
					try {
						// Clear first, so the retry re-enters a changed value and actually
						// fires a request. Re-filling the identical string produces no input
						// change, so nothing refetches and the retry waits on stale results.
						await feedbackInboxPage.clearSearch( true );
						await feedbackInboxPage.searchResponses( formData1.email );
						isInSpam =
							( await feedbackInboxPage.findFolderWithResult( formData1.email ) ) === 'Spam';
						return;
					} catch ( err ) {
						if ( attempt === MAX_ATTEMPTS ) {
							throw err;
						}
					}
				}
			} );

			await test.step( 'If in Spam, mark first response as not spam', async () => {
				if ( isInSpam ) {
					await feedbackInboxPage.viewResponseRowByText( formData1.email );
					await feedbackInboxPage.clickNotSpamAction();
				}
			} );

			await test.step( 'Navigate to Inbox tab if needed', async () => {
				if ( isInSpam ) {
					await feedbackInboxPage.clickFolderTab( 'Inbox' );
					// Leaving the single response page drops the active search. Clear
					// first: refilling an identical value fires no request.
					await feedbackInboxPage.clearSearch( true );
					await feedbackInboxPage.searchResponses( formData1.email );
				}
			} );

			await test.step( 'Validate first response data', async () => {
				await feedbackInboxPage.viewResponseRowByText( formData1.email );
				await feedbackInboxPage.validateTextInSubmission( formData1.name );
				await feedbackInboxPage.validateTextInSubmission( formData1.email );
				await feedbackInboxPage.validateTextInSubmission( formData1.phone );
				await feedbackInboxPage.validateTextInSubmission( formData1.hearAboutUsOption );
				await feedbackInboxPage.validateTextInSubmission( formData1.otherDetails );
				await feedbackInboxPage.clickCloseResponse();
			} );

			// --- Validate second response ---

			isInSpam = false;

			await test.step( 'Search for second response email until result shows up', async () => {
				feedbackInboxPage = new FeedbackInboxPage( page );

				const MAX_ATTEMPTS = 3;
				for ( let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++ ) {
					try {
						await feedbackInboxPage.clearSearch( true );
						await feedbackInboxPage.searchResponses( formData2.email );
						isInSpam =
							( await feedbackInboxPage.findFolderWithResult( formData2.email ) ) === 'Spam';
						return;
					} catch ( err ) {
						if ( attempt === MAX_ATTEMPTS ) {
							throw err;
						}
					}
				}
			} );

			await test.step( 'If in Spam, mark second response as not spam', async () => {
				if ( isInSpam ) {
					await feedbackInboxPage.viewResponseRowByText( formData2.email );
					await feedbackInboxPage.clickNotSpamAction();
				}
			} );

			await test.step( 'Navigate to Inbox tab if needed', async () => {
				if ( isInSpam ) {
					await feedbackInboxPage.clickFolderTab( 'Inbox' );
					// Leaving the single response page drops the active search. Clear
					// first: refilling an identical value fires no request.
					await feedbackInboxPage.clearSearch( true );
					await feedbackInboxPage.searchResponses( formData2.email );
				}
			} );

			await test.step( 'Validate second response data', async () => {
				await feedbackInboxPage.viewResponseRowByText( formData2.email );
				await feedbackInboxPage.validateTextInSubmission( formData2.name );
				await feedbackInboxPage.validateTextInSubmission( formData2.email );
				await feedbackInboxPage.validateTextInSubmission( formData2.phone );
				await feedbackInboxPage.validateTextInSubmission( formData2.hearAboutUsOption );
				await feedbackInboxPage.validateTextInSubmission( formData2.otherDetails );
				await feedbackInboxPage.clickCloseResponse();
			} );

			// --- Test response navigation ---

			await test.step( 'Clear search to show both responses', async () => {
				feedbackInboxPage = new FeedbackInboxPage( page );
				await feedbackInboxPage.clearSearch( true );
				await page.waitForTimeout( 1000 );
			} );

			await test.step( 'Click on first response', async () => {
				await feedbackInboxPage.viewResponseRowByText( formData1.email );
			} );

			await test.step( 'Verify first response data is visible', async () => {
				await feedbackInboxPage.validateTextInSubmission( formData1.name );
				await feedbackInboxPage.validateTextInSubmission( formData1.email );
			} );

			await test.step( 'Click Previous to navigate to second response (desktop only)', async () => {
				if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
					await feedbackInboxPage.clickPreviousResponse();
				}
			} );

			await test.step( 'Verify second response data is visible (desktop only)', async () => {
				if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
					await feedbackInboxPage.validateTextInSubmission( formData2.name );
					await feedbackInboxPage.validateTextInSubmission( formData2.email );
				}
			} );

			await test.step( 'Click Next to navigate back to first response (desktop only)', async () => {
				if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
					await feedbackInboxPage.clickNextResponse();
				}
			} );

			await test.step( 'Verify first response data is visible again (desktop only)', async () => {
				if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
					await feedbackInboxPage.validateTextInSubmission( formData1.name );
					await feedbackInboxPage.validateTextInSubmission( formData1.email );
				}
			} );

			// The response opens on a standalone page on every viewport, so the list
			// has to be restored before the next step reaches for a response row.
			await test.step( 'Return to the responses list', async () => {
				await feedbackInboxPage.clickCloseResponse();
			} );

			// --- Test response actions ---

			await test.step( 'Verify Trash action exists in actions menu', async () => {
				feedbackInboxPage = new FeedbackInboxPage( page );
				await feedbackInboxPage.verifyActionExistsInMenu( formData1.email, 'Trash' );
			} );

			await test.step( 'Ensure first response is opened', async () => {
				await feedbackInboxPage.viewResponseRowByText( formData1.email );
			} );

			await test.step( 'Mark first response as unread', async () => {
				await feedbackInboxPage.clickMarkAsUnreadAction();
			} );

			await test.step( 'Mark first response as read', async () => {
				// CFM auto-marks a response as read on open, so no mark-as-read
				// action is offered and there is nothing to assert here.
				if ( await feedbackInboxPage.isCentralFormManagement() ) {
					return;
				}
				await feedbackInboxPage.clickMarkAsReadAction();
			} );

			await test.step( 'Mark first response as spam', async () => {
				await feedbackInboxPage.clickMarkAsSpamAction();
			} );

			await test.step( 'Navigate to Spam folder', async () => {
				await feedbackInboxPage.clickFolderTab( 'Spam' );
			} );

			await test.step( 'Verify first response is in Spam', async () => {
				await feedbackInboxPage.searchResponses( formData1.email );
				await feedbackInboxPage.viewResponseRowByText( formData1.email );
				await feedbackInboxPage.validateTextInSubmission( formData1.name );
			} );

			await test.step( 'Mark first response as not spam', async () => {
				await feedbackInboxPage.clickNotSpamAction();
			} );

			await test.step( 'Navigate back to Inbox', async () => {
				await feedbackInboxPage.clickFolderTab( 'Inbox' );
			} );

			await test.step( 'Verify first response is back in Inbox', async () => {
				await feedbackInboxPage.searchResponses( formData1.email, true );
				await feedbackInboxPage.viewResponseRowByText( formData1.email );
				await feedbackInboxPage.validateTextInSubmission( formData1.name );
			} );

			await test.step( 'Move first response to trash', async () => {
				await feedbackInboxPage.clickMoveToTrashAction();
			} );

			await test.step( 'Navigate to Trash folder', async () => {
				await feedbackInboxPage.clickFolderTab( 'Trash' );
			} );

			await test.step( 'Verify first response is in Trash', async () => {
				await feedbackInboxPage.searchResponses( formData1.email, true );
				await feedbackInboxPage.viewResponseRowByText( formData1.email );
				await feedbackInboxPage.validateTextInSubmission( formData1.name );
			} );

			await test.step( 'Restore first response from trash', async () => {
				await feedbackInboxPage.clickRestoreAction();
			} );

			await test.step( 'Navigate back to Inbox to confirm', async () => {
				await feedbackInboxPage.clickFolderTab( 'Inbox' );
			} );

			await test.step( 'Verify first response is restored in Inbox', async () => {
				await feedbackInboxPage.searchResponses( formData1.email, true );
				await feedbackInboxPage.viewResponseRowByText( formData1.email );
				await feedbackInboxPage.validateTextInSubmission( formData1.name );
			} );
		} );
	}
);
