import {
	BrowserManager,
	DataHelper,
	RestAPIClient,
	type NewSiteResponse,
	type NewUserResponse,
	watchImportFailure,
} from '@automattic/calypso-e2e';
import { expect, skipIfNotTrunk, tags, test } from '../../lib/pw-base';
import { apiCancelAtomicPlan, apiCloseAccount, recordAccountLeakMarker } from '../shared';

const PLAYGROUND_NAVIGATION_TIMEOUT = 60 * 1000;

test.describe(
	DataHelper.createSuiteTitle( 'Onboarding: Publish a Playground site to Atomic' ),
	{ tag: [ tags.CALYPSO_RELEASE, tags.IMPORTS, tags.DESKTOP_ONLY ] },
	() => {
		skipIfNotTrunk();

		const testUser = DataHelper.getNewTestUser( { usernamePrefix: 'playground' } );
		const blogName = testUser.siteName;
		const playgroundSiteTitle = `Playground import ${ blogName }`;
		let signupAttempted = false;
		let newUserDetails: NewUserResponse | undefined;
		let newSiteDetails: NewSiteResponse | undefined;

		test.afterAll( async () => {
			if ( ! newUserDetails ) {
				if ( signupAttempted ) {
					recordAccountLeakMarker( {
						username: testUser.username,
						email: testUser.email,
						error: 'Signup did not return account details; account creation status is unknown.',
					} );
				}
				return;
			}

			test.setTimeout( 300 * 1000 );
			const restAPIClient = new RestAPIClient(
				{ username: testUser.username, password: testUser.password },
				newUserDetails.body.bearer_token
			);

			await apiCancelAtomicPlan( restAPIClient, newSiteDetails?.blog_details.blogid );
			await apiCloseAccount( restAPIClient, {
				userID: newUserDetails.body.user_id,
				username: newUserDetails.body.username,
				email: testUser.email,
			} );
		} );

		test( 'As a new user, I can publish my Playground site to WP Admin on Atomic', async ( {
			componentDomainSearch,
			page,
			pageCartCheckout,
			pageSignupPickPlan,
			pageUserSignUp,
		} ) => {
			test.setTimeout( 30 * 60 * 1000 );

			let playgroundId: string;
			const selectedFreeDomain = `${ blogName }.wordpress.com`;

			await test.step( 'Given the store is configured for sandbox purchases', async () => {
				await BrowserManager.setStoreCookie( page, { currency: 'GBP' } );
			} );

			await test.step( 'When I open the Playground onboarding flow', async () => {
				await page.goto( DataHelper.getCalypsoURL( '/setup/onboarding/playground' ) );
			} );

			await test.step( 'Then a persisted Playground is ready to launch', async () => {
				const launchButton = page.getByRole( 'button', { name: 'Launch on WordPress.com' } );
				await expect( launchButton ).toBeEnabled( { timeout: 120 * 1000 } );
				await expect( page.locator( 'iframe[title="WordPress Playground"]' ) ).toBeVisible();

				const generatedPlaygroundId = new URL( page.url() ).searchParams.get( 'playground' );
				expect( generatedPlaygroundId ).toBeTruthy();
				playgroundId = generatedPlaygroundId as string;
			} );

			await test.step( 'And I customize the site inside Playground', async () => {
				const playground = page
					.frameLocator( 'iframe[title="WordPress Playground"]' )
					.frameLocator( 'iframe[title="The WordPress site"]' );
				await expect( playground.locator( '#wpadminbar' ) ).toBeVisible( {
					timeout: PLAYGROUND_NAVIGATION_TIMEOUT,
				} );
				await playground.locator( '#wp-admin-bar-site-name' ).hover();
				await playground.locator( '#wp-admin-bar-dashboard > a' ).click();

				// Every page load inside Playground runs PHP in WebAssembly and can take
				// longer than the default action timeout, so wait for each navigation.
				const settingsLink = playground
					.getByRole( 'link', { name: 'Settings', exact: true } )
					.first();
				await expect( settingsLink ).toBeVisible( { timeout: PLAYGROUND_NAVIGATION_TIMEOUT } );
				await settingsLink.click();

				const siteTitle = playground.getByRole( 'textbox', { name: 'Site Title' } );
				await expect( siteTitle ).toBeVisible( { timeout: PLAYGROUND_NAVIGATION_TIMEOUT } );
				await siteTitle.fill( playgroundSiteTitle );
				await playground.getByRole( 'button', { name: 'Save Changes' } ).click();
				await expect( playground.getByText( 'Settings saved.' ) ).toBeVisible( {
					timeout: PLAYGROUND_NAVIGATION_TIMEOUT,
				} );
				await expect( siteTitle ).toHaveValue( playgroundSiteTitle );
			} );

			await test.step( 'When I launch the Playground site on WordPress.com', async () => {
				await page.getByRole( 'button', { name: 'Launch on WordPress.com' } ).click();
				await expect( page ).not.toHaveURL( /\/setup\/onboarding\/playground/ );
			} );

			await test.step( 'And I sign up as a new user', async () => {
				signupAttempted = true;
				newUserDetails = await pageUserSignUp.signupSocialFirstWithEmail( testUser.email );
			} );

			await test.step( 'And I choose a free WordPress.com address', async () => {
				await componentDomainSearch.search( blogName );
				await componentDomainSearch.skipPurchase();
			} );

			await test.step( 'And I select the Business plan', async () => {
				newSiteDetails = await pageSignupPickPlan.selectPlan( 'Business' );
				expect( newSiteDetails.blog_details.site_slug ).toBe( selectedFreeDomain );
			} );

			await test.step( 'Then the Business plan is ready for purchase', async () => {
				await pageCartCheckout.validateCartItem( 'WordPress.com Business' );
			} );

			await test.step( 'When I enter billing and payment details', async () => {
				const paymentDetails = DataHelper.getTestPaymentDetails();
				await pageCartCheckout.enterBillingDetails( paymentDetails );
				await pageCartCheckout.enterPaymentDetails( paymentDetails );
			} );

			await test.step( 'And I purchase the plan', async () => {
				await Promise.all( [
					page.waitForURL(
						( url ) =>
							url.pathname.includes( '/setup/site-setup/importerPlayground' ) &&
							url.searchParams.get( 'playground' ) === playgroundId,
						{ timeout: 120 * 1000 }
					),
					pageCartCheckout.purchase( { timeout: 90 * 1000 } ),
				] );
			} );

			await test.step( 'Then the Playground import runs on the same screen', async () => {
				const importerUrl = new URL( page.url() );
				expect( importerUrl.searchParams.get( 'playground' ) ).toBe( playgroundId );
				expect( importerUrl.searchParams.get( 'siteId' ) ).toBe(
					String( newSiteDetails!.blog_details.blogid )
				);
				await expect(
					page.getByText(
						'This usually takes a few minutes. Keep this window open until your site is ready.'
					)
				).toBeVisible( { timeout: 120 * 1000 } );
			} );

			await test.step( 'And the import completes on My Home', async () => {
				const siteId = String( newSiteDetails!.blog_details.blogid );
				// WordPress.com can fail the import without the step showing an error
				// screen, so also stop waiting as soon as its status poll reports a failure.
				const importFailure = watchImportFailure( page );
				const errorHeading = page.getByRole( 'heading', {
					name: 'Your site could not be imported',
				} );
				const importOutcome = page.waitForURL(
					( url ) =>
						url.pathname === `/home/${ siteId }` ||
						url.pathname === `/home/${ selectedFreeDomain }`,
					{ timeout: 10 * 60 * 1000 }
				);
				const errorShown = errorHeading.waitFor( { timeout: 10 * 60 * 1000 } ).then( () => {
					throw new Error( 'The Playground import failed on WordPress.com' );
				} );
				importOutcome.catch( () => {} );
				errorShown.catch( () => {} );
				try {
					await Promise.race( [ importOutcome, errorShown, importFailure.failed ] );
				} finally {
					importFailure.stop();
				}
			} );

			await test.step( 'And my Playground changes exist on the Atomic site', async () => {
				const expectedAtomicHostname = `${ blogName }.wpcomstaging.com`;
				await page.goto( `https://${ expectedAtomicHostname }/wp-admin/options-general.php` );
				await page.waitForURL(
					( url ) =>
						url.hostname === expectedAtomicHostname &&
						url.pathname === '/wp-admin/options-general.php',
					{ timeout: 180 * 1000 }
				);
				await expect( page.locator( '#wpadminbar' ) ).toBeVisible( { timeout: 60 * 1000 } );
				await expect( page.getByRole( 'textbox', { name: 'Site Title' } ) ).toHaveValue(
					playgroundSiteTitle,
					{ timeout: 60 * 1000 }
				);
			} );
		} );
	}
);
