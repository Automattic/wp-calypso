import { Page } from 'playwright';
import {
	CartCheckoutPage,
	DataHelper,
	DomainSearchComponent,
	LoggedOutHomePage,
	LoggedOutThemesPage,
	MyHomePage,
	SignupPickPlanPage,
	ThemesDetailPage,
	UserSignupPage,
} from '../..';

/**
 * Class encapsulating the flow when starting at the logged out home page (LOHP) and selecting a theme for a new site
 */
export class LOHPThemeSignupFlow {
	readonly loggedOutHomePage: LoggedOutHomePage;
	readonly loggedOutThemesPage: LoggedOutThemesPage;
	readonly userSignupPage: UserSignupPage;
	readonly domainSearchComponent: DomainSearchComponent;
	readonly signupPickPlanPage: SignupPickPlanPage;
	readonly cartCheckoutPage: CartCheckoutPage;
	readonly themesDetailPage: ThemesDetailPage;
	readonly myHomePage: MyHomePage;

	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.loggedOutHomePage = new LoggedOutHomePage( page );
		this.loggedOutThemesPage = new LoggedOutThemesPage( page );
		this.userSignupPage = new UserSignupPage( page );
		this.domainSearchComponent = new DomainSearchComponent( page );
		this.signupPickPlanPage = new SignupPickPlanPage( page );
		this.cartCheckoutPage = new CartCheckoutPage( page );
		this.themesDetailPage = new ThemesDetailPage( page );
		this.myHomePage = new MyHomePage( page );
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
