import { NewTestUserDetails, NewUserResponse, RestAPIClient } from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	'Domain flow: Purchase only a domain',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		let selectedDomain: string;
		let testUser: NewTestUserDetails;
		let newUserDetails: NewUserResponse;

		test( 'As a new user, I can purchase only a domain', async ( {
			page,
			componentDomainSearch,
			componentSelectItems,
			helperData,
			pageCartCheckout,
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
				await componentDomainSearch.search( helperData.getBlogName() );
			} );

			await test.step( 'And I add the first suggestion to the cart', async function () {
				selectedDomain = await componentDomainSearch.selectFirstSuggestion();
			} );

			await test.step( 'And I continue to the next step', async function () {
				await componentDomainSearch.continue();
			} );

			await test.step( 'And I select domain only option', async function () {
				await componentSelectItems.clickButton( 'Just buy a domain', 'Continue' );
			} );

			await test.step( 'Then I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );
			} );
		} );

		test.afterEach( 'Delete all user accounts generated', async function () {
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
