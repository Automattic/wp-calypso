import { Page } from 'playwright';
import {
	cancelAtomicPurchaseFlow,
	CartCheckoutPage,
	DataHelper,
	DomainSearchComponent,
	LoggedOutHomePage,
	LoggedOutThemesPage,
	MyHomePage,
	NoticeComponent,
	PurchasesPage,
	SignupPickPlanPage,
	ThemesDetailPage,
	UserSignupPage,
} from '../..';

/**
 * Class encapsulating the flow when starting at the logged out home page (LOHP) and selecting a theme for a new site
 */
export class LOHPThemeSignupFlow {
	private page: Page;
	readonly loggedOutHomePage: LoggedOutHomePage;
	readonly loggedOutThemesPage: LoggedOutThemesPage;
	readonly userSignupPage: UserSignupPage;
	readonly domainSearchComponent: DomainSearchComponent;
	readonly signupPickPlanPage: SignupPickPlanPage;
	readonly cartCheckoutPage: CartCheckoutPage;
	readonly themesDetailPage: ThemesDetailPage;
	readonly myHomePage: MyHomePage;
	readonly purchasesPage: PurchasesPage;
	readonly noticeComponent: NoticeComponent;

	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.loggedOutHomePage = new LoggedOutHomePage( page );
		this.loggedOutThemesPage = new LoggedOutThemesPage( page );
		this.userSignupPage = new UserSignupPage( page );
		this.domainSearchComponent = new DomainSearchComponent( page );
		this.signupPickPlanPage = new SignupPickPlanPage( page );
		this.cartCheckoutPage = new CartCheckoutPage( page );
		this.themesDetailPage = new ThemesDetailPage( page );
		this.myHomePage = new MyHomePage( page );
		this.purchasesPage = new PurchasesPage( page );
		this.noticeComponent = new NoticeComponent( page );
	}

	/**
	 * Navigates to the Calypso Get Started link for the selected theme.
	 * @returns {Promise<string>} The theme slug of the selected theme.
	 */
	async visitCalypsoGetStartedLinkForTheme(): Promise< string > {
		const pageThemeDetails = new ThemesDetailPage( this.page );
		const calypsoGetStartedLink = await pageThemeDetails.calypsoGetStartedLink();
		const themeSlug =
			pageThemeDetails.getThemeSlugFromCalypsoGetStartedLink( calypsoGetStartedLink );
		await this.page.goto( calypsoGetStartedLink );
		return themeSlug;
	}

	/**
	 * Cancels the plan purchase during the flow.
	 * @returns {Promise<void>}
	 */
	async cancelPlanPurchase(): Promise< void > {
		await cancelAtomicPurchaseFlow( this.page, {
			reason: 'Another reason…',
			customReasonText: 'E2E TEST CANCELLATION',
		} );
	}

	/**
	 * Enters billing and payment details and purchases the selected plan.
	 * @returns {Promise<void>}
	 */
	async enterBillingPaymentDetailsAndPurchasePlan(): Promise< void > {
		const paymentDetails = DataHelper.getTestPaymentDetails();
		await this.cartCheckoutPage.enterBillingDetails( paymentDetails );
		await this.cartCheckoutPage.enterPaymentDetails( paymentDetails );
		await this.cartCheckoutPage.purchase();
	}
}
