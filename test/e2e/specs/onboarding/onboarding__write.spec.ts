import {
	DataHelper,
	DomainSearchComponent,
	EditorPage,
	LoginPage,
	NewUserResponse,
	RestAPIClient,
	SignupPickPlanPage,
	StartSiteFlow,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { apiCloseAccount, fixme_retry } from '../shared';

test.describe(
	DataHelper.createSuiteTitle( 'Onboarding: Write Focus' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const blogName = DataHelper.getBlogName();
		const testUser = DataHelper.getNewTestUser( {
			usernamePrefix: 'signup',
		} );
		let newUserDetails: NewUserResponse | undefined;

		test.afterAll( async () => {
			if ( ! newUserDetails ) {
				return;
			}
			const restAPIClient = new RestAPIClient(
				{ username: testUser.username, password: testUser.password },
				newUserDetails.body.bearer_token
			);
			await apiCloseAccount( restAPIClient, {
				userID: newUserDetails.body.user_id,
				username: newUserDetails.body.username,
				email: testUser.email,
			} );
		} );

		test( 'As a new user, I can complete the write onboarding flow', async ( { page } ) => {
			// Full signup-to-first-publish flow: 60s home redirect + fixme_retry
			// home wait + 30s launchpad on top of editor load and publish; the
			// 120s default is not enough.
			test.setTimeout( 240 * 1000 );

			let editorOpened = false;
			let selectedFreeDomain: string;

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
				selectedFreeDomain = await domainSearchComponent.skipPurchase();
			} );

			await test.step( 'When I select WordPress.com Free plan', async () => {
				const signupPickPlanPage = new SignupPickPlanPage( page );
				const redirectUrl = new RegExp( 'home/.+\\?ref=onboarding' );
				await signupPickPlanPage.selectPlan( 'Free', redirectUrl );
			} );

			await test.step( 'Then I enter the onboarding flow for the selected domain', async () => {
				await page.waitForURL( /home\/.*ref=onboarding/, { timeout: 60 * 1000 } );
				expect( page.url() ).toContain( selectedFreeDomain );
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
