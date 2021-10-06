/**
 * @group calypso-release
 */

import {
	DataHelper,
	DomainSearchComponent,
	setupHooks,
	BrowserManager,
	CloseAccountFlow,
	UserSignupPage,
	CartCheckoutPage,
	NavbarComponent,
	IndividualPurchasePage,
	LoginPage,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Signup: WordPress.com Domain Only' ), function () {
	const inboxId = DataHelper.config.get( 'signupInboxId' ) as string;
	const username = `e2eflowtestingdomainonly${ DataHelper.getTimestamp() }`;
	const email = DataHelper.getTestEmailAddress( {
		inboxId: inboxId,
		prefix: username,
	} );
	const signupPassword = DataHelper.config.get( 'passwordForNewTestSignUps' ) as string;

	let page: Page;
	let selectedDomain: string;
	let domainSearchComponent: DomainSearchComponent;
	let cartCheckoutPage: CartCheckoutPage;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe( 'Signup via /start/domain', function () {
		it( 'Navigate to /start/domain', async function () {
			await page.goto( DataHelper.getCalypsoURL( '/start/domain' ) );
		} );

		it( 'Set store cookie', async function () {
			await BrowserManager.setStoreCookie( page, { currency: 'JPY' } );
		} );

		it( 'Search for a domain', async function () {
			domainSearchComponent = new DomainSearchComponent( page );
			await domainSearchComponent.search( username + '.live' );
		} );

		it( 'Select a .live domain', async function () {
			selectedDomain = await domainSearchComponent.selectDomain( '.live' );
		} );

		it( 'Select to buy just the domain', async function () {
			await page.click( 'button:text("Just buy a domain")' );
		} );

		it( 'Sign up for a WordPress.com account', async function () {
			const userSignupPage = new UserSignupPage( page );
			await userSignupPage.signup( email, username, signupPassword );
		} );

		it( 'Land in checkout cart', async function () {
			cartCheckoutPage = new CartCheckoutPage( page );
			const totalAmount = await cartCheckoutPage.getCheckoutTotalAmount();
			expect( totalAmount ).toBeGreaterThan( 0 );
		} );

		it( 'Enter registrar details', async function () {
			await cartCheckoutPage.enterDomainRegistrarDetails(
				DataHelper.getTestDomainRegistrarDetails( email )
			);
		} );

		it( 'Enter credit card details', async function () {
			await cartCheckoutPage.enterPaymentDetails( DataHelper.getTestPaymentDetails() );
		} );

		it( 'Prices are shown in Japanese Yen', async function () {
			const cartAmount = ( await cartCheckoutPage.getCheckoutTotalAmount( {
				rawString: true,
			} ) ) as string;
			expect( cartAmount.startsWith( '¥' ) ).toBe( true );
		} );

		it( 'Check out', async function () {
			await Promise.all( [
				page.waitForNavigation( {
					url: `**/checkout/thank-you/${ selectedDomain }`,
					timeout: 90 * 1000,
				} ),
				cartCheckoutPage.purchase(),
			] );

			await page.waitForNavigation( {
				url: `**/checkout/thank-you/${ selectedDomain }`,
			} );
		} );
	} );

	describe( 'Manage Domain', function () {
		let individualPurchasePage: IndividualPurchasePage;

		it( 'Click My Sites', async function () {
			const navbarCompnent = new NavbarComponent( page );
			await navbarCompnent.clickMySites();
		} );

		it( 'Manage domain', async function () {
			// This isn't MyHomePage, nor is it PurchasesPage.
			// Instead of creating a POM for just one task, call the
			// raw selector.
			await page.click( 'a:text("Manage domain")' );
		} );

		it( 'Turn off auto-renew', async function () {
			individualPurchasePage = new IndividualPurchasePage( page );
			await individualPurchasePage.turnOffAutoRenew();
		} );

		it( 'Delete domain purchase', async function () {
			await individualPurchasePage.deleteDomain();
		} );
	} );

	describe( 'Delete user account', function () {
		it( 'Re-log in', async function () {
			// This step is necessary due to an issue exposed in PR
			// https://github.com/Automattic/wp-calypso/pull/56803.
			// When closing a Domain-only account that has never logged out,
			// the redirect to Account Closed page does not occur as expected.
			// See issue: https://github.com/Automattic/wp-calypso/issues/56841
			const loginPage = new LoginPage( page );
			await loginPage.visit();
			await Promise.all( [
				page.waitForNavigation( { url: '**/read' } ),
				loginPage.login( { username: username, password: signupPassword } ),
			] );
		} );

		it( 'Close account', async function () {
			const closeAccountFlow = new CloseAccountFlow( page );
			await closeAccountFlow.closeAccount();
		} );
	} );
} );
