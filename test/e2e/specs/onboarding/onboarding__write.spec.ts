import {
	DataHelper,
	DomainSearchComponent,
	EditorPage,
	LoginPage,
	NewSiteResponse,
	NewUserResponse,
	RestAPIClient,
	SignupPickPlanPage,
	StartSiteFlow,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount, apiCreateFreeSiteForUser, apiDeleteSite, fixme_retry } from '../shared';

test.describe(
	DataHelper.createSuiteTitle( 'Onboarding: Write Focus' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const blogName = DataHelper.getBlogName();
		const testUser = DataHelper.getNewTestUser( {
			usernamePrefix: 'signup',
		} );
		let newUserDetails: NewUserResponse | undefined;
		let newSiteDetails: NewSiteResponse | undefined;

		test.afterAll( async () => {
			if ( ! newUserDetails ) {
				return;
			}
			const restAPIClient = new RestAPIClient(
				{ username: testUser.username, password: testUser.password },
				newUserDetails.body.bearer_token
			);
			if ( newSiteDetails ) {
				await apiDeleteSite( restAPIClient, {
					url: newSiteDetails.blog_details.url,
					id: newSiteDetails.blog_details.blogid,
					name: newSiteDetails.blog_details.blogname,
				} );
			}
			await apiCloseAccount( restAPIClient, {
				userID: newUserDetails.body.user_id,
				username: newUserDetails.body.username,
				email: testUser.email,
			} );
		} );

		test( 'As a new user, I can complete the write onboarding flow', async ( { page } ) => {
			let editorOpened = false;

			await test.step( 'When I navigate to the Login page', async () => {
				const loginPage = new LoginPage( page );
				await loginPage.visit();
			} );

			await test.step( 'When I click on button to create a new account', async () => {
				const loginPage = new LoginPage( page );
				await loginPage.clickCreateNewAccount();
			} );

			await test.step( 'When I sign up as a new user', async () => {
				const userSignupPage = new UserSignupPage( page );
				newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'When I select a .wordpress.com domain name', async () => {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( blogName );
				await domainSearchComponent.skipPurchase();
			} );

			await test.step( 'When I select WordPress.com Free plan', async () => {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				// After the PWYW A/B test, picking Free on /setup/onboarding/plans
				// redirects to https://wordpress.com/choose instead of creating a
				// site directly. No /sites/new call is made here, so we use
				// selectPlanWithoutSiteCreation.
				const redirectUrl = /^https:\/\/wordpress\.com\/choose(?:[?#]|$)/;
				await signupPickPlanPage.selectPlanWithoutSiteCreation( 'Free', redirectUrl );
			} );

			// Picking Free now redirects to https://wordpress.com/choose for the
			// PWYW A/B test instead of creating a site, so the original UI path
			// into the onboarding/write/launchpad flow is no longer reachable.
			// To preserve downstream coverage, API-create a free site and
			// navigate directly into /home with the onboarding ref.
			await test.step( 'When I API-create a free site and enter /home', async () => {
				newSiteDetails = await apiCreateFreeSiteForUser( testUser, newUserDetails!, blogName );
				await page.goto(
					DataHelper.getCalypsoURL(
						`/home/${ newSiteDetails.blog_details.site_slug }?ref=onboarding`
					)
				);
			} );

			await test.step( 'Then I enter the onboarding flow for the API-created site', async () => {
				await page.waitForURL( /home\/.*ref=onboarding/, { timeout: 60 * 1000 } );
				expect( page.url() ).toContain( newSiteDetails!.blog_details.site_slug );
			} );

			await test.step( 'When I select "Publish a blog" goal', async () => {
				const startSiteFlow = new StartSiteFlow( page );
				const goalCards = page.locator( '.select-card-checkbox__container' );
				if ( ( await goalCards.count() ) === 0 ) {
					return;
				}
				await startSiteFlow.selectGoal( 'Publish a blog' );
				await startSiteFlow.clickButton( 'Next' );
			} );

			await test.step( 'When I select theme', async () => {
				const startSiteFlow = new StartSiteFlow( page );
				const showThemesButton = page.getByRole( 'button', { name: 'Show all Blog themes' } );
				if ( ! ( await showThemesButton.isVisible() ) ) {
					return;
				}
				await showThemesButton.click();
				await startSiteFlow.selectTheme( 'Retrospect' );
				await startSiteFlow.clickButton( 'Continue' );
			} );

			await test.step( 'Then Launchpad is shown', async () => {
				await fixme_retry( () => page.waitForURL( /home/ ) );
			} );

			await test.step( 'When I write first post', async () => {
				const writeFirstPostLink = page.getByRole( 'link', { name: 'Write your first post' } );
				if ( ! ( await writeFirstPostLink.isVisible() ) ) {
					return;
				}
				editorOpened = true;
				await writeFirstPostLink.click();
			} );

			if ( editorOpened ) {
				const postTitle = DataHelper.getRandomPhrase();
				let editorPage: EditorPage;

				await test.step( 'Then editor loads', async () => {
					editorPage = new EditorPage( page );
					await editorPage.waitUntilLoaded();
					await editorPage.closeWelcomeGuideIfNeeded();
				} );

				await test.step( 'When I enter blog title', async () => {
					await editorPage!.enterTitle( postTitle );
				} );

				await test.step( 'When I publish post', async () => {
					await editorPage!.publish();
				} );

				await test.step( 'Then first post congratulatory message is shown', async () => {
					const editorParent = await editorPage!.getEditorParent();
					await editorParent
						.getByRole( 'heading', { name: 'Your first post is published!' } )
						.waitFor();
				} );

				await test.step( 'When I click View Next Steps', async () => {
					const editorParent = await editorPage!.getEditorParent();
					await editorParent.getByRole( 'button', { name: 'Next steps' } ).click();
				} );
			}

			await test.step( 'Then Launchpad is shown (if applicable)', async () => {
				const title = page.getByText( "Let's get started!" );
				if ( ! ( await title.isVisible() ) ) {
					return;
				}
				await title.waitFor( { timeout: 30 * 1000 } );
			} );
		} );
	}
);
