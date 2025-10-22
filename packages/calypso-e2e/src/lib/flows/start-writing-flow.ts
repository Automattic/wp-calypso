import { Locator, Page } from 'playwright';
import { DataHelper, DomainSearchComponent, EditorPage } from '../..';
import { UserSignupPage } from '../pages/signup/user-signup-page';

/**
 * Class encapsulating the flow when starting a new writing blog (`/setup/start-writing`)
 */
export class StartWritingFlow {
	private page: Page;
	readonly blogDescriptionInput: Locator;
	readonly blogNameInput: Locator;
	readonly blogsAlmostReadyHeading: Locator;
	readonly completedChooseADomainItem: Locator;
	readonly completedChooseAPlanItem: Locator;
	readonly completedNameYourBlogItem: Locator;
	readonly completedWriteFirstPostItem: Locator;
	readonly connectAccountsButton: Locator;
	readonly connectToSocialButton: Locator;
	/** Domain search component within the start writing flow */
	readonly domainSearchComponent: DomainSearchComponent;
	/** The editor page within the start writing flow */
	readonly editorPage: EditorPage;
	readonly jetpackSocialPageHeading: Locator;
	readonly keepUpMomentumText: Locator;
	readonly launchYourBlogButton: Locator;
	readonly nowItsTimeToConnectYourSocialAccountsText: Locator;
	readonly progressBar: Locator;
	readonly saveBlogNameAndContinueButton: Locator;
	readonly selectToChooseDomainLink: Locator;
	readonly selectToChoosePlanLink: Locator;
	readonly selectToNameYourBlogLink: Locator;
	readonly startWithFreePlanButton: Locator;
	/** User signup page within the start writing flow */
	readonly userSignupPage: UserSignupPage;
	readonly yourBlogsReadyHeading: Locator;

	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.blogDescriptionInput = this.page.getByPlaceholder(
			"Let people know what your blog's about"
		);
		this.blogNameInput = this.page.getByPlaceholder( 'A catchy name to make your blog memorable' );
		this.blogsAlmostReadyHeading = this.page.getByRole( 'heading', {
			name: "Your blog's almost ready!",
		} );
		this.completedChooseADomainItem = this.getCompletedItemLocator( 'Choose a domain' );
		this.completedChooseAPlanItem = this.getCompletedItemLocator( 'Choose a plan' );
		this.completedNameYourBlogItem = this.getCompletedItemLocator( 'Name your blog' );
		this.completedWriteFirstPostItem = this.getCompletedItemLocator( 'Write your first post' );
		this.connectAccountsButton = this.page.getByRole( 'button', { name: 'Connect accounts' } );
		this.connectToSocialButton = this.page.getByRole( 'button', { name: 'Connect to social' } );
		this.domainSearchComponent = new DomainSearchComponent( page );
		this.editorPage = new EditorPage( page );
		this.jetpackSocialPageHeading = this.page.getByText( 'Write once, post everywhere' );
		this.keepUpMomentumText = this.page.getByText( 'Keep up the momentum with these final steps.' );
		this.launchYourBlogButton = this.page.getByRole( 'button', { name: 'Launch your blog' } );
		this.nowItsTimeToConnectYourSocialAccountsText = this.page.getByText(
			'Now it’s time to connect your social accounts.'
		);
		this.progressBar = this.page.getByRole( 'progressbar' );
		this.saveBlogNameAndContinueButton = this.page.getByRole( 'button', {
			name: 'Save and continue',
		} );
		this.selectToChooseDomainLink = this.page.getByRole( 'link', {
			name: 'Select to choose a domain',
		} );
		this.selectToChoosePlanLink = this.page.getByRole( 'link', {
			name: 'Select to choose a plan',
		} );
		this.selectToNameYourBlogLink = this.page.getByRole( 'link', {
			name: 'Select to name your blog',
		} );
		this.startWithFreePlanButton = this.page.getByRole( 'button', { name: 'Start with Free' } );
		this.userSignupPage = new UserSignupPage( page );
		this.yourBlogsReadyHeading = this.page.getByRole( 'heading', { name: 'Your blog’s ready!' } );
	}

	/**
	 * Navigates to the /setup/start-writing endpoint.
	 * @returns {Promise<void>}
	 */
	async visit(): Promise< void > {
		await this.page.goto( DataHelper.getCalypsoURL( '/setup/start-writing' ) );
	}

	/**
	 * Locator for a completed item by its name.
	 * Used only by public getters to encapsulate the logic for completed items.
	 * @param itemName
	 * @returns {Locator}
	 */
	private getCompletedItemLocator( itemName: string ): Locator {
		return this.page.locator( 'li' ).filter( { hasText: `Completed: ${ itemName }` } );
	}
}
