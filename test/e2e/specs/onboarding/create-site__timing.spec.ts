import { NewTestUserDetails, NewUserResponse, RestAPIClient } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	'Performance: Create Site Timing',
	{
		tag: [ tags.CALYPSO_PR ],
	},
	() => {
		let newUserDetails: NewUserResponse;
		let testUser: NewTestUserDetails;

		test( 'Create site step completes within 10 seconds', async ( {
			flowStartWriting,
			helperData,
			page,
		} ) => {
			testUser = helperData.getNewTestUser( {
				usernamePrefix: 'timing_test',
			} );

			await test.step( 'Given I visit the /setup/start-writing page', async function () {
				await flowStartWriting.visit();
			} );

			await test.step( 'And I see the Create your account page', async function () {
				await expect( flowStartWriting.userSignupPage.createYourAccountHeading ).toBeVisible();
			} );

			await test.step( 'When I sign up with my email', async function () {
				newUserDetails = await flowStartWriting.userSignupPage.signupWithEmail( testUser.email );
			} );

			let elapsedMs: number;

			await test.step( 'Then I wait for site creation to complete and measure elapsed time', async function () {
				// Wait for the create-site step to appear (URL contains create-site)
				// For new users with no sites, start-writing flow redirects directly to create-site
				await page.waitForURL( /create-site/, { timeout: 30000 } );

				// Start timing when create-site step is visible
				const startTime = Date.now();

				// Wait for processing to complete - the URL will change away from both
				// create-site and processing steps. The start-writing flow redirects to
				// wp-admin/post-new.php after successful site creation.
				await page.waitForURL(
					( url ) => {
						const pathname = url.pathname;
						return (
							! pathname.includes( 'create-site' ) &&
							! pathname.includes( 'processing' ) &&
							// Ensure we've actually navigated somewhere meaningful
							( pathname.includes( 'wp-admin' ) || pathname.includes( 'launchpad' ) )
						);
					},
					{ timeout: 30000 }
				);

				elapsedMs = Date.now() - startTime;

				// Log the elapsed time for debugging and CI visibility
				// eslint-disable-next-line no-console
				console.log( `Create site elapsed time: ${ elapsedMs }ms` );
			} );

			await test.step( 'And the elapsed time is less than 10 seconds', async function () {
				expect(
					elapsedMs,
					`Create site took ${ elapsedMs }ms, which exceeds the 10000ms threshold`
				).toBeLessThan( 10000 );
			} );
		} );

		test.afterAll( 'Delete test user account', async function () {
			if ( newUserDetails && testUser ) {
				const restAPIClient = new RestAPIClient(
					{
						username: testUser.username,
						password: testUser.password,
					},
					newUserDetails.body.bearer_token
				);

				await apiCloseAccount( restAPIClient, {
					userID: newUserDetails.body.user_id,
					username: newUserDetails.body.username,
					email: testUser.email,
				} );
			}
		} );
	}
);
