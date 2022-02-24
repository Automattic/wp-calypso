import { Page, FrameLocator } from 'playwright';
import envVariables from '../../env-variables';
import { NavbarComponent } from '.';

const panel = 'div.wpcom-block-editor-nav-sidebar-nav-sidebar__container';
const selectors = {
	sidebarButton: `button.wpcom-block-editor-nav-sidebar-toggle-sidebar-button__button`,
	exitLink: `${ panel } a.wpcom-block-editor-nav-sidebar-nav-sidebar__home-button`,
};

/**
 * Represents an instance of the WordPress.com Editor's navigation sidebar.
 * The component is available only in the Desktop viewport.
 */
export class EditorNavSidebarComponent {
	private page: Page;
	private frameLocator: FrameLocator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {FrameLocator} frameLocator Locator of the editor iframe.
	 */
	constructor( page: Page, frameLocator: FrameLocator ) {
		this.page = page;
		this.frameLocator = frameLocator;
	}

	/**
	 * Exits the editor.
	 *
	 * For Desktop viewports, the sidebar is used to exit.
	 * For Mobile viewports, My Sites button is used to exit.
	 */
	async exitEditor(): Promise< void > {
		if ( envVariables.VIEWPORT_NAME !== 'mobile' ) {
			await this.openSidebar();
		}

		// There are three different places to return to,
		// depending on how the editor was entered.
		const navigationPromise = Promise.race( [
			this.page.waitForNavigation( { url: '**/home/**' } ),
			this.page.waitForNavigation( { url: '**/posts/**' } ),
			this.page.waitForNavigation( { url: '**/pages/**' } ),
		] );
		const actions: Promise< unknown >[] = [ navigationPromise ];

		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// Mobile viewports do not use a sidebar.
			const navbarComponent = new NavbarComponent( this.page );
			actions.push( navbarComponent.clickMySites() );
		} else {
			const exitLinkLocator = this.frameLocator.locator( selectors.exitLink );
			actions.push( exitLinkLocator.click() );
		}

		// Perform the actions and resolve promises.
		await Promise.all( actions );
	}

	/**
	 * Returns whether the sidebar is open.
	 *
	 * @returns {boolean} True if the sidebar is open. False otherwise.
	 */
	private async sidebarIsOpen(): Promise< boolean > {
		const locator = this.frameLocator.locator( selectors.sidebarButton );
		const status = await locator.getAttribute( 'aria-expanded' );

		return status === 'true';
	}

	/**
	 * Opens the sidebar if not already open.
	 */
	async openSidebar(): Promise< void > {
		if ( ! ( await this.sidebarIsOpen() ) ) {
			const locator = this.frameLocator.locator( selectors.sidebarButton );
			await locator.click();
		}
	}
}
