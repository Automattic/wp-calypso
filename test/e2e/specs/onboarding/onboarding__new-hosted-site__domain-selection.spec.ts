import {
	CartCheckoutPage,
	DataHelper,
	DomainSearchComponent,
	NewUserResponse,
	PlansPage,
	RestAPIClient,
	UserSignupPage,
} from '@automattic/calypso-e2e';
import { skipIfNotTrunk, tags, test } from '../../lib/pw-base';
import { apiCloseAccount } from '../shared';

test.describe(
	DataHelper.createSuiteTitle( 'New Hosted Site Flow: With domain selection' ),
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		skipIfNotTrunk();

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

		test( 'As a new user, I can select a domain during new hosted site signup', async ( {
			page,
		} ) => {
			let selectedDomain: string;
			let cartCheckoutPage: CartCheckoutPage;

			await test.step( 'When I enter the flow with domain selection', async () => {
				const flowUrl = DataHelper.getCalypsoURL( '/setup/new-hosted-site', {
					showDomainStep: 'true',
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
				await domainSearchComponent.continue();
			} );

			await test.step( `When I pick the ${ planName } plan`, async () => {
				const plansPage = new PlansPage( page );
				await Promise.all( [
					plansPage.selectPlan( planName ),
					page.waitForURL( /.*\/checkout\/.*/, { timeout: 30 * 1000 } ),
				] );
			} );

			await test.step( 'Then I see domain and plan at checkout', async () => {
				cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( `WordPress.com ${ planName }` );
				await cartCheckoutPage.validateCartItem( selectedDomain! );
			} );
		} );
	}
);
