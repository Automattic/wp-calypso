import { Page, FrameLocator } from 'playwright';
import envVariables from '../../env-variables';

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
	 * Opens the sidebar if not already open.
	 */
	async openSidebar(): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			return;
		}

		if ( await this.sidebarIsOpen() ) {
			return;
		}

		const locator = this.frameLocator.locator( selectors.sidebarButton );
		await locator.click();
	}

	/**
	 * Closes the sidebar if open.
	 */
	async closeSidebar(): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			return;
		}

		if ( ! ( await this.sidebarIsOpen() ) ) {
			return;
		}

		const locator = this.frameLocator.locator( selectors.sidebarButton );
		await locator.click();
	}

	/**
	 * Exits the editor.
	 *
	 * For Desktop viewports, the sidebar is used to exit.
	 * For Mobile viewports, nothing happens.
	 */
	async exitEditor(): Promise< void > {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			return;
		}

		const exitLinkLocator = this.frameLocator.locator( selectors.exitLink );
		await exitLinkLocator.click();
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
}
