import { NewTestUserDetails, NewUserResponse, RestAPIClient } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	'Signup: Tailored Start Writing Flow',
	{
		tag: [ tags.CALYPSO_RELEASE ],
		annotation: { type: 'flowchart', description: 'TBA' },
	},
	() => {
		let newUserDetailsStartWriting: NewUserResponse;
		let testUserStartWriting: NewTestUserDetails;

		test( 'One: As a new WordPress.com blogger I can sign up for a new free site and start writing straight away', async ( {
			flowStartWriting,
			helperData,
		} ) => {
			testUserStartWriting = helperData.getNewTestUser( {
				usernamePrefix: 'start_writing',
			} );

			await test.step( 'When I visit the /setup/start-writing page', async function () {
				await flowStartWriting.visit();
			} );

			await test.step( 'Then I see the Create your account page', async function () {
				await expect( flowStartWriting.userSignupPage.createYourAccountHeading ).toBeVisible();
			} );

			await test.step( 'When I sign up with my email', async function () {
				newUserDetailsStartWriting = await flowStartWriting.userSignupPage.signupWithEmail(
					testUserStartWriting.email
				);
			} );

			await test.step( 'Then I am taken to the editor', async function () {
				await flowStartWriting.editorPage.waitUntilLoaded();
				await flowStartWriting.editorPage.closeWelcomeGuideIfNeeded();
			} );

			await test.step( 'When I publish my first post', async function () {
				await flowStartWriting.editorPage.enterTitle( helperData.getRandomPhrase() );
				await flowStartWriting.editorPage.publish();
			} );

			await test.step( 'Then I see "Your blog\'s almost ready!" message', async function () {
				await expect( flowStartWriting.blogsAlmostReadyHeading ).toBeVisible();
				await expect( flowStartWriting.keepUpMomentumText ).toBeVisible();
			} );

			await test.step( 'And I see "Write your first post" as Completed', async function () {
				await expect( flowStartWriting.completedWriteFirstPostItem ).toBeVisible();
			} );

			await test.step( 'And I see my progress as 1/5', async function () {
				await expect( flowStartWriting.progressBar ).toHaveText( '1/5' );
			} );

			await test.step( 'When I add my blog name and description', async function () {
				await flowStartWriting.selectToNameYourBlogLink.click();
				await flowStartWriting.blogNameInput.fill( 'Cacti Chronicles' );
				await flowStartWriting.blogDescriptionInput.fill( 'The Call of the Desert' );
				await flowStartWriting.saveBlogNameAndContinueButton.click();
			} );

			await test.step( 'Then I see "Your blog\'s almost ready!" message', async function () {
				await expect( flowStartWriting.blogsAlmostReadyHeading ).toBeVisible();
				await expect( flowStartWriting.keepUpMomentumText ).toBeVisible();
			} );

			await test.step( 'And I see "Name your blog" as Completed', async function () {
				await expect( flowStartWriting.completedNameYourBlogItem ).toBeVisible();
			} );

			await test.step( 'And I see my progress as 2/5', async function () {
				await expect( flowStartWriting.progressBar ).toHaveText( '2/5' );
			} );

			await test.step( 'When I search for a domain and skip the domain selection step', async function () {
				await flowStartWriting.selectToChooseDomainLink.click();
				await flowStartWriting.domainSearchComponent.search( 'cactus' );
				await flowStartWriting.domainSearchComponent.skipPurchase();
			} );

			await test.step( 'Then I see see "Your blog\'s almost ready!" message', async function () {
				await expect( flowStartWriting.blogsAlmostReadyHeading ).toBeVisible();
				await expect( flowStartWriting.keepUpMomentumText ).toBeVisible();
			} );

			await test.step( 'And I see "Choose a domain" as Completed', async function () {
				await expect( flowStartWriting.completedChooseADomainItem ).toBeVisible();
			} );

			await test.step( 'And I see my progress as 3/5', async function () {
				await expect( flowStartWriting.progressBar ).toHaveText( '3/5' );
			} );

			await test.step( 'When I select a plan', async function () {
				await flowStartWriting.selectToChoosePlanLink.click();
				await flowStartWriting.startWithFreePlanButton.click();
			} );

			await test.step( 'Then I see see "Your blog\'s almost ready!" message', async function () {
				await expect( flowStartWriting.blogsAlmostReadyHeading ).toBeVisible();
				await expect( flowStartWriting.keepUpMomentumText ).toBeVisible();
			} );

			await test.step( 'And I see "Choose a plan" as Completed', async function () {
				await expect( flowStartWriting.completedChooseAPlanItem ).toBeVisible();
			} );

			await test.step( 'And I see my progress as 4/5', async function () {
				await expect( flowStartWriting.progressBar ).toHaveText( '4/5' );
			} );

			await test.step( 'When I launch my blog', async function () {
				await flowStartWriting.launchYourBlogButton.click();
			} );

			await test.step( 'Then I see "Your blog\'s ready!" message', async function () {
				await expect( flowStartWriting.yourBlogsReadyHeading ).toBeVisible( { timeout: 20000 } );
				await expect( flowStartWriting.nowItsTimeToConnectYourSocialAccountsText ).toBeVisible();
			} );

			await test.step( 'When I choose "Connect to social"', async function () {
				await flowStartWriting.connectToSocialButton.click();
			} );

			await test.step( 'Then I see I am taken to the Jetpack Social page', async function () {
				await expect( flowStartWriting.jetpackSocialPageHeading ).toBeVisible();
				await expect( flowStartWriting.connectAccountsButton ).toBeVisible();
			} );
		} );

		test.afterAll( 'Delete all user accounts generated', async function () {
			if ( newUserDetailsStartWriting && testUserStartWriting ) {
				const restAPIClient = new RestAPIClient(
					{
						username: testUserStartWriting.username,
						password: testUserStartWriting.password,
					},
					newUserDetailsStartWriting.body.bearer_token
				);

				await apiCloseAccount( restAPIClient, {
					userID: newUserDetailsStartWriting.body.user_id,
					username: newUserDetailsStartWriting.body.username,
					email: testUserStartWriting.email,
				} );
			}
		} );
	}
);
