import { NewTestUserDetails, NewUserResponse, RestAPIClient } from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

interface testAccount {
	testUser: NewTestUserDetails;
	newUserDetails: NewUserResponse;
}

test.describe(
	'Domain flow: Connect a domain to a site',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		const accountsToCleanup: testAccount[] = [];

		test( 'As a new user, I can connect an external domain to a new site', async ( {
			page,
			componentDomainSearch,
			componentSelectItems,
			helperData,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUseADomainIAlreadyOwn,
			pageUserSignUp,
		} ) => {
			const targetDomain = 'testwoo.com';
			const planName = 'Personal';

			await test.step( 'When I enter the domain setup flow', async function () {
				await page.goto( helperData.getCalypsoURL( '/setup/domain' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				const testUser = helperData.getNewTestUser();
				const newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
				accountsToCleanup.push( { testUser, newUserDetails } );
			} );

			await test.step( 'And I search for a domain', async function () {
				await componentDomainSearch.search( targetDomain );
			} );

			await test.step( 'And I click the "Bring it over" button', async function () {
				await componentDomainSearch.clickBringItOver();
			} );

			await test.step( 'And I click the connect button', async function () {
				await pageUseADomainIAlreadyOwn.clickButtonToConnectDomain();
			} );

			await test.step( 'And I select the "New site" option', async function () {
				await componentSelectItems.clickButton( 'New site', 'Create a new site' );
			} );

			await test.step( `And I select the ${ planName } plan`, async function () {
				await pageSignupPickPlan.selectPlan( planName );
			} );

			await test.step( 'Then I see the plan at checkout', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'And I see the domain connection product at checkout', async function () {
				await pageCartCheckout.validateCartItem( targetDomain, 'Domain Connection' );
			} );
		} );

		test.afterAll( 'Delete all user accounts generated', async function () {
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
