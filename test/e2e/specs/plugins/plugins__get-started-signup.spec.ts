import { BrowserManager, RestAPIClient } from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
import { apiDeleteSite } from '../shared';
import type { NewSiteResponse, TestAccount } from '@automattic/calypso-e2e';

/**
 * Verifies the per-plugin "Get started" signup flow (/start/with-plugin) shows the paid plans
 * grid — with the free plan hidden — and keeps the selected marketplace plugin in the cart,
 * instead of forcing the Business plan and skipping the grid.
 *
 * Keywords: Plugins, Marketplace, Signup, Get started, Plan, Checkout
 */
test.describe(
	'Plugins: "Get started" shows the paid plans grid',
	{ tag: [ tags.CALYPSO_RELEASE ] },
	() => {
		const planName = 'Personal';
		// A paid marketplace plugin, so the flow carries a plugin product into the cart.
		const pluginSlug = 'sensei-pro';
		const pluginName = 'Sensei Pro';

		let siteCreatedFlag = false;
		let newSiteDetails: NewSiteResponse | undefined;
		let accountUsed: TestAccount;

		test.afterAll( 'Delete the created site', async () => {
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

		test( 'As a user, plugin "Get started" leads to the paid plans grid with the plugin in the cart', async ( {
			accountPreRelease,
			componentDomainSearch,
			helperData,
			page,
			pageCartCheckout,
			pagePlans,
			pageSignupPickPlan,
		} ) => {
			// Signup + site creation dominate the runtime; the 120s default isn't enough.
			test.setTimeout( 180 * 1000 );

			await test.step( `Given I am authenticated as '${ accountPreRelease.accountName }'`, async () => {
				await accountPreRelease.authenticate( page );
				accountUsed = accountPreRelease;
			} );

			await test.step( 'And store cookies are set for purchases', async () => {
				await BrowserManager.setStoreCookie( page );
			} );

			await test.step( 'When I open the with-plugin flow from a plugin "Get started" CTA', async () => {
				// Mirrors the URL the per-plugin "Get started" CTA builds
				// (client/my-sites/plugins/plugin-details-CTA/index.jsx). intervalType is
				// intentionally omitted to confirm the flow treats it as an optional query dependency.
				await page.goto(
					helperData.getCalypsoURL( 'start/with-plugin', {
						plugin: pluginSlug,
						ref: 'plugins-lp',
						billing_period: 'ANNUALLY',
					} )
				);
			} );

			await test.step( 'And I skip domain selection', async () => {
				await componentDomainSearch.search( 'foo' );
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( 'Then the plans step shows paid plans and hides the free plan', async () => {
				// The grid rendered (rather than a forced Business checkout): the paid plan CTA is
				// offered. Assert this first so the grid has finished loading before checking that
				// no free plan is offered.
				await pagePlans.validatePlanIsAvailable( planName );
				await pagePlans.validatePlanIsNotAvailable( 'Free' );
			} );

			await test.step( `When I select the ${ planName } plan`, async () => {
				newSiteDetails = await pageSignupPickPlan.selectPlan( planName );
				siteCreatedFlag = true;
			} );

			await test.step( `Then checkout contains the ${ planName } plan and the ${ pluginName } plugin`, async () => {
				await pageCartCheckout.validateCartItem( `WordPress.com ${ planName }` );
				await pageCartCheckout.validateCartItem( pluginName );
			} );
		} );
	}
);
