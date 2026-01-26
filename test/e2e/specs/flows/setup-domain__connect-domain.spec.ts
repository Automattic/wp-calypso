import { NewTestUserDetails, NewUserResponse, RestAPIClient } from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	'Domain flow: Connect a domain to a site',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		const targetDomain = 'testwoo.com';
		const planName = 'Personal';
		let testUser: NewTestUserDetails;
		let newUserDetails: NewUserResponse;

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
			testUser = helperData.getNewTestUser();

			await test.step( 'When I enter the domain setup flow', async function () {
				await page.goto( helperData.getCalypsoURL( '/setup/domain' ) );
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
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
