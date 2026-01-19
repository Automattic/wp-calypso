import { BrowserManager, RestAPIClient } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import { apiDeleteSite } from '../shared';
import type { NewSiteResponse, TestAccount } from '@automattic/calypso-e2e';

test.describe(
	'Plans: Create a WordPress.com/Business site as existing user',
	{
		tag: [ tags.CALYPSO_RELEASE ],
	},
	() => {
		const planName = 'Business';

		let siteCreatedFlag = false;
		let newSiteDetails: NewSiteResponse | undefined;
		let accountUsed: TestAccount;

		test( `As an existing WordPress.com user, I can purchase a ${ planName } plan during signup`, async ( {
			accountPreRelease,
			componentDomainSearch,
			componentSidebar,
			helperData,
			page,
			pageCartCheckout,
			pageSignupPickPlan,
		} ) => {
			await test.step( `Given I am authenticated as '${ accountPreRelease.accountName }'`, async function () {
				await accountPreRelease.authenticate( page );
				accountUsed = accountPreRelease;
			} );

			await test.step( 'And store cookies are set for purchases', async function () {
				await BrowserManager.setStoreCookie( page );
			} );

			await test.step( 'When I navigate to /start', async function () {
				await page.goto( helperData.getCalypsoURL( 'start' ) );
			} );

			await test.step( 'And I skip domain selection', async function () {
				await componentDomainSearch.search( 'foo' );
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( `And I select the WordPress.com ${ planName } plan`, async function () {
				newSiteDetails = await pageSignupPickPlan.selectPlan( planName );
				siteCreatedFlag = true;
			} );

			await test.step( 'Then I see secure checkout with the plan in the cart', async function () {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
			} );

			await test.step( 'When I select a saved card', async function () {
				await pageCartCheckout.selectSavedCard( 'End to End Testing' );
			} );

			await test.step( 'And I complete the purchase', async function () {
				await pageCartCheckout.purchase( { timeout: 75 * 1000 } );
			} );

			await test.step( 'Then I land on Home', async function () {
				await page.waitForURL( /home/ );
			} );

			await test.step( `And the sidebar shows I am on the ${ planName } plan`, async function () {
				const currentPlan = await componentSidebar.getCurrentPlanName();
				expect( currentPlan ).toBe( planName );
			} );
		} );

		test.afterAll( 'Delete the created site', async function () {
			if ( ! siteCreatedFlag || ! newSiteDetails || ! accountUsed ) {
				return;
			}

			const restAPIClient = new RestAPIClient( {
				username: accountUsed.credentials.username,
				password: accountUsed.credentials.password,
			} );

			await apiDeleteSite( restAPIClient, {
				url: newSiteDetails.blog_details.url,
				id: newSiteDetails.blog_details.blogid,
				name: newSiteDetails.blog_details.blogname,
			} );
		} );
	}
);
