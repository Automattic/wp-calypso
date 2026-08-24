import {
	BrowserManager,
	NewTestUserDetails,
	NewUserResponse,
	RestAPIClient,
} from '@automattic/calypso-e2e';
import { skipIfNotTrunk, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	'Start Domain Only Flows',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		skipIfNotTrunk();

		const accountsToCleanup: {
			testUser: NewTestUserDetails;
			newUserDetails: NewUserResponse;
		}[] = [];

		test( 'As a new user, I can complete the domain-only flow and purchase just a domain (no site)', async ( {
			page,
			componentDomainSearch,
			helperData,
			pageCartCheckout,
			pageUserSignUp,
		} ) => {
			const testUser = helperData.getNewTestUser();
			let selectedDomain: string;
			let newUserDetails: NewUserResponse;

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

			await test.step( 'And I sign up as a new user', async function () {
				newUserDetails = await pageUserSignUp.signupWithEmail( testUser.email );
				accountsToCleanup.push( { testUser, newUserDetails } );
			} );

			await test.step( 'Then I see the domain at checkout', async function () {
				await pageCartCheckout.validateCartItem( selectedDomain );
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
