import { Locator, Page } from 'playwright';
import { DataHelper, DomainSearchComponent, EditorPage } from '../..';
import { UserSignupPage } from '../pages/signup/user-signup-page';

/**
 * Class encapsulating the flow when starting a new writing blog /setup/start-writing
 */
export class StartWritingFlow {
	private page: Page;
	userSignupPage: UserSignupPage;
	editorPage: EditorPage;
	domainSearchComponent: DomainSearchComponent;

	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		this.userSignupPage = new UserSignupPage( page );
		this.editorPage = new EditorPage( page );
		this.domainSearchComponent = new DomainSearchComponent( page );
	}

	/**
	 * Navigates to the /setup/start-writing endpoint.
	 * @returns {Promise<void>}
	 */
	async visit(): Promise< void > {
		await this.page.goto( DataHelper.getCalypsoURL( '/setup/start-writing' ) );
	}

	/**
	 * Heading locator for the "Your blog's almost ready!" message.
	 * @returns {Locator}
	 */
	get blogsAlmostReadyHeading(): Locator {
		return this.page.getByRole( 'heading', { name: "Your blog's almost ready!" } );
	}

	/**
	 * Locator for the "Keep up the momentum with these final steps." text.
	 * @returns {Locator}
	 */
	get keepUpMomentumText(): Locator {
		return this.page.getByText( 'Keep up the momentum with these final steps.' );
	}

	/**
	 * Locator for a completed item by its name.
	 * @param itemName
	 * @returns {Locator}
	 */
	private getCompletedItemLocator( itemName: string ): Locator {
		return this.page.locator( 'li' ).filter( { hasText: `Completed: ${ itemName }` } );
	}

	/**
	 * Locator for the "Completed: Write your first post" item.
	 * @returns {Locator}
	 */
	get completedWriteFirstPostItem(): Locator {
		return this.getCompletedItemLocator( 'Write your first post' );
	}

	/**
	 * Locator for the "Completed: Name your blog" item.
	 * @returns {Locator}
	 */
	get completedNameYourBlogItem(): Locator {
		return this.getCompletedItemLocator( 'Name your blog' );
	}

	/**
	 * Locator for the "Completed: Choose a domain" item.
	 * @returns {Locator}
	 */
	get completedChooseADomainItem(): Locator {
		return this.getCompletedItemLocator( 'Choose a domain' );
	}

	/**
	 * Locator for the "Completed: Choose a plan" item.
	 * @returns {Locator}
	 */
	get completedChooseAPlanItem(): Locator {
		return this.getCompletedItemLocator( 'Choose a plan' );
	}

	/**
	 * Locator for the progress bar.
	 * @returns {Locator}
	 */
	get progressBar(): Locator {
		return this.page.getByRole( 'progressbar' );
	}

	/**
	 * Locator for the blog name input field.
	 * @returns {Locator}
	 */
	get blogNameInput(): Locator {
		return this.page.getByPlaceholder( 'A catchy name to make your blog memorable' );
	}

	/**
	 * 	Locator for the blog description input field.
	 * @returns {Locator}
	 */
	get blogDescriptionInput(): Locator {
		return this.page.getByPlaceholder( "Let people know what your blog's about" );
	}

	/**
	 * Locator for the "Select to name your blog" link.
	 * @returns {Locator}
	 */
	get selectToNameYourBlogLink(): Locator {
		return this.page.getByRole( 'link', { name: 'Select to name your blog' } );
	}

	/**
	 * Locator for the "Select to choose a domain" link.
	 * @returns {Locator}
	 */
	get selectToChooseDomainLink(): Locator {
		return this.page.getByRole( 'link', { name: 'Select to choose a domain' } );
	}

	/**
	 * Locator for the "Select to choose a plan" link.
	 * @returns {Locator}
	 */
	get selectToChoosePlanLink(): Locator {
		return this.page.getByRole( 'link', { name: 'Select to choose a plan' } );
	}

	/**
	 * Locator for the "Start with Free" plan button.
	 * @returns {Locator}
	 */
	get startWithFreePlanButton(): Locator {
		return this.page.getByRole( 'button', { name: 'Start with Free' } );
	}

	/**
	 * Locator for the "Save and continue" button.
	 * @returns {Locator}
	 */
	get saveBlogNameAndContinueButton(): Locator {
		return this.page.getByRole( 'button', { name: 'Save and continue' } );
	}

	/**
	 * Locator for the "Launch your blog" button.
	 * @returns {Locator}
	 */
	get launchYourBlogButton(): Locator {
		return this.page.getByRole( 'button', { name: 'Launch your blog' } );
	}

	/**
	 * Locator for the "Your blog's ready!" heading.
	 * @returns {Locator}
	 */
	get yourBlogsReadyHeading(): Locator {
		return this.page.getByRole( 'heading', { name: 'Your blog’s ready!' } );
	}

	/**
	 * Locator for the "Now it’s time to connect your social accounts." text.
	 * @returns {Locator}
	 */
	get nowItsTimeToConnectYourSocialAccountsText(): Locator {
		return this.page.getByText( 'Now it’s time to connect your social accounts.' );
	}

	/**
	 * Locator for the "Connect to social" button.
	 * @returns {Locator}
	 */
	get connectToSocialButton(): Locator {
		return this.page.getByRole( 'button', { name: 'Connect to social' } );
	}

	/**
	 * Locator for the Jetpack Social page heading.
	 * @returns {Locator}
	 */
	get jetpackSocialPageHeading(): Locator {
		return this.page.getByText( 'Write once, post everywhere' );
	}

	/**
	 * Locator for the Jetpack Social "Connect accounts" button.
	 * @returns {Locator}
	 */
	get connectAccountsButton(): Locator {
		return this.page.getByRole( 'button', { name: 'Connect accounts' } );
	}
}
