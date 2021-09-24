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
	SidebarComponent,
	NavbarComponent,
	IndividualPurchasePage,
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
			await domainSearchComponent.selectDomain( '.live' );
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

		it( 'Prices are shown in Japanese Yen', async function () {
			const buttonText = await cartCheckoutPage.getPaymentButtonText();
			buttonText.startsWith( '¥' );
		} );

		it( 'Enter registrar details', async function () {
			await cartCheckoutPage.enterDomainRegistrarDetails(
				DataHelper.getTestDomainRegistrarDetails( email )
			);
		} );

		it( 'Enter credit card details', async function () {
			await cartCheckoutPage.enterPaymentDetails( DataHelper.getTestPaymentDetails() );
		} );

		it( 'Check out', async function () {
			await cartCheckoutPage.purchase();
		} );
	} );

	describe( 'Manage Domain', function () {
		let individualPurchasePage: IndividualPurchasePage;

		it( 'Click My Sites', async function () {
			// This step is affected by an issue with page redirect
			// of the post-checkout page.
			// See: https://github.com/Automattic/wp-calypso/issues/56548
			const navbarCompnent = new NavbarComponent( page );
			await navbarCompnent.clickMySites();
		} );

		it( 'Navigate to Settings', async function () {
			const sidebarComponent = new SidebarComponent( page );
			await sidebarComponent.navigate( 'Settings' );
		} );

		it( 'Manage domain', async function () {
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
		it( 'Close account', async function () {
			const closeAccountFlow = new CloseAccountFlow( page );
			await closeAccountFlow.closeAccount();
		} );
	} );
} );
