import {
	BrowserManager,
	NewTestUserDetails,
	NewUserResponse,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { tags, test, expect } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	'Setup Hundred Year Domain Flow',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		const accountsToCleanup: {
			testUser: NewTestUserDetails;
			newUserDetails: NewUserResponse;
		}[] = [];

		test( 'As a new user I can purchase a 100-year domain and see the thank you page', async ( {
			page,
			componentDomainSearch,
			helperData,
			pageCartCheckout,
			pageLogin,
			pageUserSignUp,
		} ) => {
			const testUser = helperData.getNewTestUser();
			let newUserDetails: NewUserResponse;
			let selectedDomain: string;

			await test.step( 'When I navigate to the Login page', async function () {
				BrowserManager.setStoreCookie( page, { currency: 'USD' } );
				await pageLogin.visit();
			} );

			await test.step( 'And I click on button to create a new account', async function () {
				await pageLogin.clickCreateNewAccount();
			} );

			await test.step( 'And I create the account', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
				accountsToCleanup.push( { testUser, newUserDetails } );
			} );

			await test.step( 'And I enter the 100-year domain flow', async function () {
				// Use the flow URL (marketing entry is wordpress.com/100-year-domain/#search)
				await page.goto( helperData.getCalypsoURL( '/setup/hundred-year-domain' ) );
			} );

			await test.step( 'And I search for a domain', async function () {
				await componentDomainSearch.search( `${ helperData.getBlogName() }.blog` );
			} );

			await test.step( 'And I pick the first .blog domain in the list', async function () {
				selectedDomain = await componentDomainSearch.selectFirstSuggestion( false );
			} );

			await test.step( 'And I pay at checkout', async function () {
				const registrarDetails = helperData.getTestDomainRegistrarDetails( testUser.email );
				await pageCartCheckout.enterDomainRegistrarDetails( registrarDetails );

				const paymentDetails = helperData.getTestPaymentDetails();
				await pageCartCheckout.enterPaymentDetails( paymentDetails );

				await pageCartCheckout.purchase( { timeout: 90 * 1000 } );
			} );

			await test.step( 'Then I see the hundred year thank you page', async function () {
				await expect(
					page.getByText( `Your 100-Year Domain ${ selectedDomain } has been registered.` )
				).toBeVisible( {
					timeout: 60 * 1000,
				} );
			} );

			await test.step( 'When I click "Manage your domain"', async function () {
				await page.getByRole( 'button', { name: 'Manage your domain' } ).click();
			} );

			await test.step( 'Then I am on the domain management page', async function () {
				await expect( page ).toHaveURL( new RegExp( `/domains/manage/${ selectedDomain }` ) );
			} );
		} );

		test.afterAll( 'Close all user accounts generated', async function () {
			for ( const account of accountsToCleanup ) {
				const restAPIClient = new RestAPIClient(
					{
						username: account.testUser.username,
						password: account.testUser.password,
					},
					account.newUserDetails.body.bearer_token
				);

				await apiCloseAccount( restAPIClient, {
					userID: account.newUserDetails.body.user_id,
					username: account.newUserDetails.body.username,
					email: account.testUser.email,
				} );
			}
		} );
	}
);
