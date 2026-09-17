import {
	CartCheckoutPage,
	DataHelper,
	DomainSearchComponent,
	NewUserResponse,
	RestAPIClient,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { skipIfNotTrunk, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

/**
 * We need this test to ensure that the post-domain selection navigation
 * sends the user to the plans page or checkout.
 */
test.describe(
	DataHelper.createSuiteTitle(
		'New Hosted Site Flow: With domain selection and pre-selected plan'
	),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		skipIfNotTrunk();

		const planSlug = 'business-bundle';
		const planName = 'Business';
		const blogName = DataHelper.getBlogName();
		const testUser = DataHelper.getNewTestUser();
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

		test( 'As a new user, selecting a domain with pre-selected plan goes directly to checkout', async ( {
			page,
		} ) => {
			let selectedDomain: string;

			await test.step( 'When I enter the flow with domain selection and pre-selected plan', async () => {
				const flowUrl = DataHelper.getCalypsoURL( '/setup/new-hosted-site', {
					showDomainStep: 'true',
					plan: planSlug,
				} );
				await page.goto( flowUrl );
			} );

			await test.step( 'When I sign up as a new user', async () => {
				const userSignupPage = new UserSignupPage( page );
				newUserDetails = await userSignupPage.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'When I select a domain name', async () => {
				const domainSearchComponent = new DomainSearchComponent( page );
				await domainSearchComponent.search( blogName );
				selectedDomain = await domainSearchComponent.selectFirstSuggestion();
				await Promise.all( [
					domainSearchComponent.continue(),
					page.waitForURL( /.*\/checkout\/.*/, { timeout: 30 * 1000 } ),
				] );
			} );

			await test.step( 'Then I see domain and plan at checkout', async () => {
				const cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
				await cartCheckoutPage.validateCartItem( selectedDomain! );
			} );
		} );
	}
);
