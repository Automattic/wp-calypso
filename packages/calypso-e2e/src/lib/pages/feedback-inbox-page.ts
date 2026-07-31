import { Locator, Page } from 'playwright';
import { envVariables } from '../..';

/**
 * Page repsresenting the Feedback page, Inbox view variant. Accessed under Sidebar > Feedback.
 */
export class FeedbackInboxPage {
	private page: Page;
	private isCFM = false;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Returns a locator for a response row matching the given text.
	 *
	 * @param {string} text The text to match in the row.
	 * @returns {Locator} The row locator.
	 */
	private getResponseRow( text: string ): Locator {
		return this.page.locator( '.dataviews-view-table__row' ).filter( { hasText: text } ).first();
	}

	/**
	 * Visit the Jetpack Forms Inbox page.
	 *
	 * Handles both the old dashboard (lands directly on responses) and the
	 * new Central Form Management dashboard (lands on Forms tab — needs to
	 * click "Responses" to get to the inbox).
	 *
	 * @param {string} siteUrlWithProtocol Site URL with the protocol.
	 */
	async visit( siteUrlWithProtocol: string ): Promise< void > {
		const url = new URL( '/wp-admin/admin.php?page=jetpack-forms-admin', siteUrlWithProtocol );
		await this.page.goto( url.href, { timeout: 20 * 1000 } );

		// With Central Form Management enabled, the dashboard lands on the Forms tab.
		// Click "Responses" to navigate to the inbox.
		const responsesTab = this.page.getByRole( 'tab', { name: 'Responses' } );
		if ( await responsesTab.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
			this.isCFM = true;
			await responsesTab.click();
			// Wait for the Folder filter chip to render — that's the signal that the
			// Responses tab content has actually loaded.
			await this.page
				.locator( '.dataviews-filters__summary-chip' )
				.filter( { hasText: /Folder is:/i } )
				.waitFor( { state: 'visible', timeout: 5000 } );
		}
	}

	/**
	 * View a response row that has the provided text.
	 * Doesn't verify the row is selected, it just makes sure the response
	 * is visible (inspector on desktop, modal on mobile)
	 *
	 * @param {string} text The text to match in the row. Using the name field is a good choice.
	 */
	async viewResponseRowByText( text: string ): Promise< void > {
		const responseRowLocator = this.getResponseRow( text );
		await responseRowLocator.waitFor( { state: 'visible' } );
		await responseRowLocator.getByRole( 'button', { name: 'Actions' } ).click();
		// The menu item is on a popover portal, so outside of the response row locator
		const viewMenuItem = this.page.getByRole( 'menuitem', { name: 'View' } ).first();
		await viewMenuItem.click();

		if ( await this.isCentralFormManagement() ) {
			// CFM uses the DataViews inspector on both desktop and mobile.
			await this.page.locator( '.jp-forms-response-header' ).waitFor( { state: 'visible' } );
		} else if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
			await this.page.locator( '.jp-forms__inbox-response' ).waitFor( { state: 'visible' } );
		} else {
			await this.page
				.getByRole( 'dialog' )
				.filter( { has: this.page.getByRole( 'heading', { name: 'Response' } ) } )
				.waitFor();
		}
	}

	/**
	 * Validates a piece of text in the submitted form response.
	 *
	 * @param {string} text The text to validate.
	 * @throws If the text is not found in the response.
	 */
	async validateTextInSubmission( text: string ): Promise< void > {
		if ( await this.isCentralFormManagement() ) {
			// CFM uses the DataViews inspector on both desktop and mobile.
			await this.page.getByText( text ).first().waitFor();
		} else if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await this.page
				.locator( '.jp-forms__inbox__response-mobile' )
				.getByText( text )
				.first()
				.waitFor();
		} else {
			await this.page.locator( '.jp-forms__inbox-response' ).getByText( text ).first().waitFor();
		}
	}

	/**
	 * Use the search input to search for a form response. Useful for filtering and triggering a data reload.
	 *
	 * @param {string} search The text to search for.
	 * @param {boolean} skipWaiting Whether to skip waiting for the response request to complete.
	 */
	async searchResponses( search: string, skipWaiting: boolean = false ): Promise< void > {
		const searchBox = this.page
			.getByRole( 'searchbox', { name: 'Search' } )
			.or( this.page.getByRole( 'textbox', { name: 'Search responses' } ) );

		if ( skipWaiting ) {
			await searchBox.fill( search );
			await this.page.waitForTimeout( 1000 );
			return;
		}

		const responseRequestPromise = this.page.waitForResponse(
			( response ) =>
				// Atomic
				( response.url().includes( '/wp-json/wp/v2/feedback' ) ||
					// Simple
					!! response.url().match( /\/wp\/v2\/sites\/[0-9]+\/feedback/ ) ) &&
				response.url().includes( encodeURIComponent( search ) )
		);
		await searchBox.fill( search );
		await responseRequestPromise;

		await this.page.waitForTimeout( 500 );
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
		const responseRequestPromise = this.page.waitForResponse(
			( response ) =>
				// Atomic
				( response.url().includes( '/wp-json/wp/v2/feedback' ) ||
					// Simple
					!! response.url().match( /\/wp\/v2\/sites\/[0-9]+\/feedback/ ) ) &&
				! response.url().includes( 'search=' )
		);
		await this.page.getByRole( 'searchbox', { name: 'Search' } ).clear();
		await responseRequestPromise;
		await this.page.waitForTimeout( 500 ); // Wait for the UI to update
	}

	/**
	 * Clicks on a folder tab (Inbox, Spam, or Trash).
	 *
	 * Handles both the old dashboard (role="tab" within a tablist) and the
	 * new CFM dashboard (DataViews "Folder" filter pill with dropdown options).
	 *
	 * @param {string} folderName The name of the folder to click (e.g., 'Inbox', 'Spam', 'Trash').
	 */
	async clickFolderTab( folderName: string ): Promise< void > {
		if ( await this.isCentralFormManagement() ) {
			// On mobile, the DataViews inspector may overlap the filter chips.
			// Close it first if it's open.
			const closeButton = this.page.locator( '.jp-forms-response-header' ).getByRole( 'button', {
				name: 'Close',
			} );
			if ( await closeButton.isVisible( { timeout: 500 } ).catch( () => false ) ) {
				await closeButton.click();
				await this.page
					.locator( '.jp-forms-response-header' )
					.waitFor( { state: 'hidden', timeout: 5000 } );
			}

			// CFM: folder is a DataViews filter chip ("Folder is: Inbox (0)").
			const folderChip = this.page.locator( '.dataviews-filters__summary-chip' ).filter( {
				hasText: /Folder is:/i,
			} );
			const folderOption = this.page.getByRole( 'option', {
				name: new RegExp( folderName, 'i' ),
			} );
			// Selecting a folder leaves the popover open, so clicking the chip
			// unconditionally would close it. Only open it when it is shut.
			if ( ! ( await folderOption.isVisible( { timeout: 1000 } ).catch( () => false ) ) ) {
				await folderChip.click();
			}
			await folderOption.click();
			// Wait for the chip text to reflect the selected folder.
			await this.page
				.locator( '.dataviews-filters__summary-chip' )
				.filter( { hasText: new RegExp( `Folder is:\\s*${ folderName }`, 'i' ) } )
				.waitFor( { timeout: 5000 } );
			// The popover stays open over the table and swallows row clicks, so
			// dismiss it before handing back control.
			if ( await folderOption.isVisible( { timeout: 500 } ).catch( () => false ) ) {
				await this.page.keyboard.press( 'Escape' );
				await folderOption.waitFor( { state: 'hidden', timeout: 5000 } );
			}
			return;
		}

		// Handle both tab and radio-button layouts (some Atomic sites use radios).
		const tab = this.page
			.getByRole( 'tab', { name: folderName } )
			.or( this.page.getByRole( 'radio', { name: new RegExp( folderName, 'i' ) } ) );
		await tab.click();
		// Wait for the tab/radio to actually be selected before returning.
		await this.page
			.getByRole( 'tab', { name: folderName, selected: true } )
			.or(
				this.page.getByRole( 'radio', {
					name: new RegExp( folderName, 'i' ),
					checked: true,
				} )
			)
			.waitFor( { timeout: 5000 } );
	}

	/**
	 * Reads the result count from the CFM folder filter chip.
	 *
	 * The chip reads "Folder is: Inbox (0)", and the count respects the active
	 * search — CFM refetches `feedback/counts?search=…` on every query.
	 *
	 * @returns {Promise<number>} Responses in the selected folder, 0 if unreadable.
	 */
	private async getSelectedFolderCount(): Promise< number > {
		const chipText = await this.page
			.locator( '.dataviews-filters__summary-chip' )
			.filter( { hasText: /Folder is:/i } )
			.textContent();
		const count = chipText?.match( /\(\s*(\d+)\s*\)/ );
		return count ? parseInt( count[ 1 ], 10 ) : 0;
	}

	/**
	 * Selects the folder that holds the response matching the given text, and
	 * returns that folder's name.
	 *
	 * Akismet decides whether a submission lands in Inbox or Spam, so the caller
	 * cannot know up front which folder to look in.
	 *
	 * The old dashboard answers this cheaply: folders are tabs (radios on some
	 * Atomic sites) labelled with a result count, so the tab reading "1" is the
	 * one holding the match. CFM has no folder tabs — the folder is a DataViews
	 * filter chip — so there we select each folder in turn and look for the row.
	 *
	 * @param {string} text Text identifying the response row, e.g. the name field.
	 * @returns {Promise<string>} The folder holding the response.
	 * @throws If neither Inbox nor Spam holds a matching response.
	 */
	async findFolderWithResult( text: string ): Promise< 'Inbox' | 'Spam' > {
		if ( await this.isCentralFormManagement() ) {
			// The chip carries a search-scoped count for the selected folder
			// ("Folder is: Inbox (0)"), so one folder switch answers the question.
			await this.clickFolderTab( 'Inbox' );
			if ( ( await this.getSelectedFolderCount() ) > 0 ) {
				return 'Inbox';
			}

			await this.clickFolderTab( 'Spam' );
			if ( ( await this.getSelectedFolderCount() ) > 0 ) {
				return 'Spam';
			}

			throw new Error( `No response matching "${ text }" found in Inbox or Spam.` );
		}

		const tabLocator = this.page
			.getByRole( 'tab', { name: /(Inbox|Spam) 1/ } )
			.or( this.page.getByRole( 'radio', { name: /(Inbox|Spam)\s*\(\s*1\s*\)/ } ) );
		await tabLocator.click( { timeout: 4000 } );
		const tabText = await tabLocator.textContent();
		return tabText?.toLowerCase().includes( 'spam' ) ? 'Spam' : 'Inbox';
	}

	/**
	 * Clicks the "Not spam" action button for the current response.
	 */
	async clickNotSpamAction(): Promise< void > {
		// Use .last() to get the button in the side panel, not in the table row
		await this.page.getByRole( 'button', { name: 'Not spam' } ).last().click();
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			// On mobile, the modal closes after the action. Wait for it to actually
			// close rather than using a fixed timeout, so slow CI agents don't leave
			// the modal covering the folder tabs when the next action runs.
			await this.page
				.getByRole( 'dialog', { name: 'Response' } )
				.waitFor( { state: 'hidden', timeout: 5000 } );
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
			// On mobile, the modal closes after the action. Wait for it to actually
			// close rather than using a fixed timeout.
			await this.page
				.getByRole( 'dialog', { name: 'Response' } )
				.waitFor( { state: 'hidden', timeout: 5000 } );
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
		if ( await this.isCentralFormManagement() ) {
			// CFM auto-marks responses as read when viewed, so the button toggle
			// won't stick. Just wait briefly for the action to process.
			await this.page.waitForTimeout( 1000 );
		} else if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
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
			// On mobile, the modal closes after the action. Wait for it to actually
			// close rather than using a fixed timeout.
			await this.page
				.getByRole( 'dialog', { name: 'Response' } )
				.waitFor( { state: 'hidden', timeout: 5000 } );
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
			// On mobile, the modal closes after the action. Wait for it to actually
			// close rather than using a fixed timeout.
			await this.page
				.getByRole( 'dialog', { name: 'Response' } )
				.waitFor( { state: 'hidden', timeout: 5000 } );
		} else {
			// Wait for the success notification (use .first() to avoid a11y-speak duplicate)
			await this.page.getByText( 'Response restored.' ).first().waitFor( { timeout: 5000 } );
		}
	}

	/**
	 * Clicks the "Next" navigation button in the response view.
	 */
	async clickNextResponse(): Promise< void > {
		// The selected response is encoded in the URL's responseIds query param,
		// so we wait for the URL to change rather than guessing how long it takes.
		const before = this.page.url();
		// Use .last() to get the button in the side panel, not pagination buttons
		await this.page.getByRole( 'button', { name: 'Next', exact: true } ).last().click();
		await this.page.waitForFunction( ( prev ) => window.location.href !== prev, before, {
			timeout: 5000,
		} );
	}

	/**
	 * Clicks the "Previous" navigation button in the response view.
	 */
	async clickPreviousResponse(): Promise< void > {
		// The selected response is encoded in the URL's responseIds query param,
		// so we wait for the URL to change rather than guessing how long it takes.
		const before = this.page.url();
		// Use .last() to get the button in the side panel, not pagination buttons
		await this.page.getByRole( 'button', { name: 'Previous', exact: true } ).last().click();
		await this.page.waitForFunction( ( prev ) => window.location.href !== prev, before, {
			timeout: 5000,
		} );
	}

	/**
	 * Clicks the "Close" button in the response view.
	 */
	async clickCloseResponse(): Promise< void > {
		await this.page.getByRole( 'button', { name: 'Close' } ).last().click();
		// Wait for whichever panel was open (CFM inspector, legacy desktop side
		// panel, or mobile dialog) to actually close.
		await this.page
			.locator( '.jp-forms-response-header' )
			.or( this.page.locator( '.jp-forms__inbox-response' ) )
			.or( this.page.getByRole( 'dialog', { name: 'Response' } ) )
			.waitFor( { state: 'hidden', timeout: 5000 } );
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
	 * Whether Central Form Management is enabled on the current site.
	 * Checks for the Forms/Responses tab bar that only exists with CFM.
	 *
	 * @returns {Promise<boolean>} True if CFM is detected.
	 */
	async isCentralFormManagement(): Promise< boolean > {
		if ( this.isCFM ) {
			return true;
		}
		// Detect by checking for the CFM-specific URL pattern or Forms tab
		const url = this.page.url();
		if ( url.includes( 'jetpack-forms-responses-wp-admin' ) || url.includes( '/responses/' ) ) {
			this.isCFM = true;
			return true;
		}
		const formsTab = this.page.getByRole( 'tab', { name: 'Forms' } );
		this.isCFM = await formsTab.isVisible( { timeout: 2000 } ).catch( () => false );
		return this.isCFM;
	}

	/**
	 * Check if a response row with the given text is visible.
	 *
	 * @param {string}  text    The text to look for in a row.
	 * @param {number} timeout  How long to wait (ms).
	 * @returns {boolean} True if the row is visible.
	 */
	async hasResponseRow( text: string, timeout = 3000 ): Promise< boolean > {
		return this.getResponseRow( text )
			.isVisible( { timeout } )
			.catch( () => false );
	}

	/**
	 * Opens the actions menu (three dot menu) and verifies the specified action exists.
	 *
	 * @param {string} text The text to match in the row. Using the name field is a good choice.
	 * @param {string} actionName The name of the action to verify in the dropdown menu.
	 */
	async verifyActionExistsInMenu( text: string, actionName: string ): Promise< void > {
		const responseRowLocator = this.getResponseRow( text );

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
