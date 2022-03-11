import { Page, FrameLocator, Locator } from 'playwright';
import envVariables from '../../env-variables';

const panel = 'div.wpcom-block-editor-nav-sidebar-nav-sidebar__container';
const selectors = {
	sidebarButton: `button[aria-label="Block editor sidebar"]`,
	exitLink: `${ panel } a[aria-description="Returns to the dashboard"]`,
};

/**
 * Represents an instance of the WordPress.com Editor's navigation sidebar.
 * The component is available only in the Desktop viewport.
 */
export class EditorNavSidebarComponent {
	private page: Page;
	private editor: Locator | FrameLocator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 * @param {FrameLocator|Locator} editor Locator or FrameLocator to the editor.
	 */
	constructor( page: Page, editor: Locator | FrameLocator ) {
		this.page = page;
		this.editor = editor;
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

		const locator = this.editor.locator( selectors.sidebarButton );
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

		const locator = this.editor.locator( selectors.sidebarButton );
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

		const exitLinkLocator = this.editor.locator( selectors.exitLink );
		await exitLinkLocator.click();
	}

	/**
	 * Returns whether the sidebar is open.
	 *
	 * @returns {boolean} True if the sidebar is open. False otherwise.
	 */
	private async sidebarIsOpen(): Promise< boolean > {
		const locator = this.editor.locator( selectors.sidebarButton );
		const status = await locator.getAttribute( 'aria-expanded' );
		return status === 'true';
	}
}
