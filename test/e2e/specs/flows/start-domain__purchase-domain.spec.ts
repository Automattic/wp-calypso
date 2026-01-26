import {
	BrowserManager,
	NewTestUserDetails,
	NewUserResponse,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	'Domain-only flow: Purchase domain',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		let selectedDomain: string;
		let testUser: NewTestUserDetails;
		let newUserDetails: NewUserResponse;

		test( 'As a new user, I can complete the domain-only flow and purchase just a domain', async ( {
			page,
			componentDomainSearch,
			helperData,
			pageCartCheckout,
			pageUserSignUp,
		} ) => {
			testUser = helperData.getNewTestUser();

			await test.step( 'When I enter the domain-only flow', async function () {
				BrowserManager.setStoreCookie( page, { currency: 'USD' } );
				await page.goto( helperData.getCalypsoURL( '/start/domain' ) );
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

			await test.step( 'And I select "Just buy a domain" option', async function () {
				await componentDomainSearch.selectJustBuyADomain();
			} );

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupWithEmail( testUser.email );
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
