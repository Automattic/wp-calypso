import { Page } from 'playwright';
import { envVariables } from '../..';

/**
 * Page repsresenting the Feedback page, Inbox view variant. Accessed under Sidebar > Feedback.
 */
export class FeedbackInboxPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Visit the Jetpack Forms Inbox page.
	 *
	 * @param {string} siteUrlWithProtocol Site URL with the protocol.
	 */
	async visit( siteUrlWithProtocol: string ): Promise< void > {
		const url = new URL(
			'/wp-admin/admin.php?page=jetpack-forms-responses-wp-admin',
			siteUrlWithProtocol
		);
		await this.page.goto( url.href, { timeout: 20 * 1000 } );
	}

	/**
	 * View a response row that has the provided text.
	 * Doesn't verify the row is selected, it just makes sure the response
	 * is visible (inspector on desktop, modal on mobile)
	 *
	 * @param {string} text The text to match in the row. Using the name field is a good choice.
	 */
	async viewResponseRowByText( text: string ): Promise< void > {
		const responseRowLocator = this.page
			.locator( '.dataviews-view-table__row' )
			.filter( { hasText: text } )
			.first();
		await responseRowLocator.waitFor( { state: 'visible' } );
		await responseRowLocator.getByRole( 'button', { name: 'Actions' } ).click();
		// The menu item is on a popover portal, so outside of the response row locator
		const viewMenuItem = this.page.getByRole( 'menuitem', { name: 'View' } ).first();
		await viewMenuItem.click();

		await this.page.locator( '.jp-forms__inbox-response-data' ).waitFor( { state: 'visible' } );
	}

	/**
	 * Validates a piece of text in the submitted form response.
	 *
	 * @param {string} text The text to validate.
	 * @throws If the text is not found in the response.
	 */
	async validateTextInSubmission( text: string ): Promise< void > {
		await this.page.locator( '.boot-layout__inspector' ).getByText( text ).first().waitFor();
	}

	/**
	 * Use the search input to search for a form response. Useful for filtering and triggering a data reload.
	 *
	 * @param {string} search The text to search for.
	 * @param {boolean} skipWaiting Whether to skip waiting for the response request to complete.
	 */
	async searchResponses( search: string, skipWaiting: boolean = false ): Promise< void > {
		if ( skipWaiting ) {
			await this.page.getByRole( 'searchbox', { name: 'Search' } ).fill( search );
			await this.page.waitForTimeout( 500 ); // Wait for the UI to update
			return;
		}
		await this.page.getByRole( 'searchbox', { name: 'Search' } ).fill( search );
		// Wait for the table to update with search results.
		// Use a short delay since we can't rely on specific API URL patterns
		// across different environments (wpcom, atomic, wp-admin).
		await this.page.waitForTimeout( 2000 );
	}

	/**
	 * Clears the search input.
	 *
	 * @param {boolean} skipWaiting Whether to skip waiting for the response request to complete.
	 */
	async clearSearch( skipWaiting: boolean = false ): Promise< void > {
		if ( skipWaiting ) {
			await this.page.getByRole( 'searchbox', { name: 'Search' } ).clear();
			await this.page.waitForTimeout( 500 ); // Wait for the UI to update
			return;
		}
		await this.page.getByRole( 'searchbox', { name: 'Search' } ).clear();
		await this.page.waitForTimeout( 2000 ); // Wait for the results to reload
	}

	/**
	 * Clicks on a folder tab (Inbox, Spam, or Trash).
	 *
	 * @param {string} folderName The name of the folder to click (e.g., 'Inbox', 'Spam', 'Trash').
	 */
	async clickFolderTab( folderName: string ): Promise< void > {
		// Open the folder dropdown by clicking the "Folder is:" button
		const folderButton = this.page.getByRole( 'button' ).filter( { hasText: 'Folder is:' } );
		await folderButton.click();
		// Select the folder option from the listbox
		await this.page.getByRole( 'option', { name: folderName, exact: false } ).click();
		await this.page.waitForTimeout( 500 ); // Wait for the data to load
	}

	/**
	 * Clicks the "Not spam" action button for the current response.
	 */
	async clickNotSpamAction(): Promise< void > {
		// Use .last() to get the button in the side panel, not in the table row
		await this.page.getByRole( 'button', { name: 'Not spam' } ).last().click();
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// On mobile, the modal closes after the action
			await this.page.waitForTimeout( 1000 );
		} else {
			// Wait for the success notification (use .first() to avoid a11y-speak duplicate)
			await this.page
				.getByText( 'Response marked as not spam.' )
				.first()
				.waitFor( { timeout: 5000 } );
		}
	}

	/**
	 * Clicks the "Mark as spam" action button for the current response.
	 */
	async clickMarkAsSpamAction(): Promise< void > {
		// Use .last() to get the button in the side panel, not in the table row
		await this.page.getByRole( 'button', { name: 'Spam' } ).last().click();
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// On mobile, the modal closes after the action
			await this.page.waitForTimeout( 1000 );
		} else {
			// Wait for the success notification (use .first() to avoid a11y-speak duplicate)
			await this.page.getByText( 'Response marked as spam.' ).first().waitFor( { timeout: 5000 } );
		}
	}

	/**
	 * Clicks the "Mark as read" action button for the current response.
	 */
	async clickMarkAsReadAction(): Promise< void > {
		// Use .last() to get the button in the side panel, not in the table row
		await this.page.getByRole( 'button', { name: 'Mark as read' } ).last().click();
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// On mobile, read/unread actions keep the modal open, so wait for button state change
			await this.page
				.getByRole( 'button', { name: 'Mark as unread' } )
				.last()
				.waitFor( { timeout: 5000 } );
		} else {
			// Wait for the success notification (use .first() to avoid a11y-speak duplicate)
			await this.page.getByText( 'Response marked as read.' ).first().waitFor( { timeout: 5000 } );
		}
	}

	/**
	 * Clicks the "Mark as unread" action button for the current response.
	 */
	async clickMarkAsUnreadAction(): Promise< void > {
		// Use .last() to get the button in the side panel, not in the table row
		await this.page.getByRole( 'button', { name: 'Mark as unread' } ).last().click();
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// On mobile, read/unread actions keep the modal open, so wait for button state change
			await this.page
				.getByRole( 'button', { name: 'Mark as read' } )
				.last()
				.waitFor( { timeout: 5000 } );
		} else {
			// Wait for the success notification (use .first() to avoid a11y-speak duplicate)
			await this.page
				.getByText( 'Response marked as unread.' )
				.first()
				.waitFor( { timeout: 5000 } );
		}
	}

	/**
	 * Clicks the "Move to trash" action button for the current response.
	 */
	async clickMoveToTrashAction(): Promise< void > {
		// Use .last() to get the button in the side panel, not in the table row
		await this.page.getByRole( 'button', { name: 'Trash' } ).last().click();
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// On mobile, the modal closes after the action
			await this.page.waitForTimeout( 1000 );
		} else {
			// Wait for the success notification (use .first() to avoid a11y-speak duplicate)
			await this.page.getByText( 'Response moved to trash.' ).first().waitFor( { timeout: 5000 } );
		}
	}

	/**
	 * Clicks the "Restore" action button for the current response.
	 */
	async clickRestoreAction(): Promise< void > {
		// Use .last() to get the button in the side panel, not in the table row
		await this.page.getByRole( 'button', { name: 'Restore' } ).last().click();
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// On mobile, the modal closes after the action
			await this.page.waitForTimeout( 1000 );
		} else {
			// Wait for the success notification (use .first() to avoid a11y-speak duplicate)
			await this.page.getByText( 'Response restored.' ).first().waitFor( { timeout: 5000 } );
		}
	}

	/**
	 * Clicks the "Next" navigation button in the response view.
	 */
	async clickNextResponse(): Promise< void > {
		// Use .last() to get the button in the side panel, not pagination buttons
		await this.page.getByRole( 'button', { name: 'Next', exact: true } ).last().click();
		await this.page.waitForTimeout( 1000 ); // Wait for the navigation to complete
	}

	/**
	 * Clicks the "Previous" navigation button in the response view.
	 */
	async clickPreviousResponse(): Promise< void > {
		// Use .last() to get the button in the side panel, not pagination buttons
		await this.page.getByRole( 'button', { name: 'Previous', exact: true } ).last().click();
		await this.page.waitForTimeout( 1000 ); // Wait for the navigation to complete
	}

	/**
	 * Clicks the "Close" button in the response view.
	 */
	async clickCloseResponse(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'Close' } ).last().click();
		await this.page.waitForTimeout( 300 ); // Wait for the panel to close
	}

	/**
	 * Verifies that the Next navigation button is disabled.
	 */
	async verifyNextButtonDisabled(): Promise< void > {
		// Use .last() to get the button in the side panel, not pagination buttons
		await this.page
			.getByRole( 'button', { name: 'Next', exact: true, disabled: true } )
			.last()
			.waitFor();
	}

	/**
	 * Verifies that the Previous navigation button is disabled.
	 */
	async verifyPreviousButtonDisabled(): Promise< void > {
		// Use .last() to get the button in the side panel, not pagination buttons
		await this.page
			.getByRole( 'button', { name: 'Previous', exact: true, disabled: true } )
			.last()
			.waitFor();
	}

	/**
	 * Opens the actions menu (three dot menu) and verifies the specified action exists.
	 *
	 * @param {string} text The text to match in the row. Using the name field is a good choice.
	 * @param {string} actionName The name of the action to verify in the dropdown menu.
	 */
	async verifyActionExistsInMenu( text: string, actionName: string ): Promise< void > {
		const responseRowLocator = this.page
			.locator( '.dataviews-view-table__row' )
			.filter( { hasText: text } )
			.first();

		// Click the Actions button (three dot menu)
		await responseRowLocator.getByRole( 'button', { name: 'Actions' } ).click();

		// Wait for the dropdown menu to appear and assign it to a variable
		const menu = this.page.getByRole( 'menu' ).last();
		await menu.waitFor();

		// Verify the specified action exists in the dropdown menu
		const menuItem = this.page.getByRole( 'menuitem', { name: actionName } );
		await menuItem.waitFor( { state: 'visible' } );

		// Close the menu by pressing Escape key (trying to click the "Dismiss popup" button didn't work)
		await this.page.keyboard.press( 'Escape' );
		await menuItem.waitFor( { state: 'detached' } );
	}
}
