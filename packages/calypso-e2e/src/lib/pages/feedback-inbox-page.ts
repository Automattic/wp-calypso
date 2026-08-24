import { Locator, Page } from 'playwright';
import { envVariables } from '../..';

/**
 * How long to wait for a response action to settle on the single response page.
 *
 * Jetpack caps the save at 30 seconds and keeps the "Actions" toggle disabled
 * until it resolves, so this matches that cap. It deliberately stops short of
 * the further 10 seconds Jetpack may spend refreshing the record cache: a save
 * that slow is already a failure, and a tighter bound keeps a wedged run failing
 * here — where the error names the toggle — instead of as a bare test timeout.
 *
 * @see https://github.com/Automattic/jetpack/blob/trunk/projects/packages/forms/routes/responses/actions.tsx
 */
const RESPONSE_ACTION_TIMEOUT = 30 * 1000;

/**
 * How long to wait for the actions dropdown itself to open or close.
 *
 * The menu opens and closes in a single render, so this only has to absorb
 * scheduling jitter — it must not soak up a whole request's worth of time.
 */
const RESPONSE_MENU_TIMEOUT = 10 * 1000;

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
	 * Returns a locator for the standalone single response page.
	 *
	 * Jetpack Forms moved the "View" row action from an in-place inspector panel
	 * to a full page at `/response/<id>`. Sites on an older Jetpack still open the
	 * inspector, so both have to be supported.
	 *
	 * @see https://github.com/Automattic/jetpack/pull/51127
	 * @returns {Locator} The single response page locator.
	 */
	private getSingleResponsePage(): Locator {
		return this.page.locator( '.jp-forms__single-response' );
	}

	/**
	 * Whether a response is currently open on the standalone single response page.
	 *
	 * @returns {Promise<boolean>} True if the single response page is showing.
	 */
	private async isOnSingleResponsePage(): Promise< boolean > {
		// `isVisible()` returns immediately rather than waiting. Every caller is
		// reached after an explicit wait on the response view, so by this point the
		// DOM has already settled on one UI or the other.
		return this.getSingleResponsePage()
			.isVisible()
			.catch( () => false );
	}

	/**
	 * Runs an action from the single response page's "Actions" dropdown.
	 *
	 * That page keeps every action behind a three dot menu in the page header,
	 * rather than rendering them as buttons the way the inspector and the legacy
	 * panels do. Callers check `isOnSingleResponsePage` before reaching for this.
	 *
	 * @param {string} menuItemName The action's label within the dropdown.
	 * @param {string} expectedFollowUpAction The action the menu should offer once the
	 * change has been accepted, so a rejected request fails here rather than several
	 * steps later. Read/unread qualifies too: it edits the record optimistically and
	 * reverts on failure, and the toggle has settled by the time this is checked.
	 */
	private async clickSingleResponseMenuAction(
		menuItemName: string,
		expectedFollowUpAction?: string
	): Promise< void > {
		const actionsMenu = this.page.locator( '.jp-forms__single-response-actions' );
		await actionsMenu.getByRole( 'button', { name: 'Actions' } ).click();

		const menuItem = this.page.getByRole( 'menuitem', { name: menuItemName, exact: true } );
		await menuItem.click();

		// The page stays put after an action, so there's no panel closing or
		// notification to wait on. The dropdown closes and disables its toggle in the
		// same render, so once the item is gone a re-enabled toggle means the request
		// settled.
		await menuItem.waitFor( { state: 'detached', timeout: RESPONSE_MENU_TIMEOUT } );
		await actionsMenu
			.getByRole( 'button', { name: 'Actions', disabled: false } )
			.waitFor( { timeout: RESPONSE_ACTION_TIMEOUT } );

		if ( ! expectedFollowUpAction ) {
			return;
		}

		// Settled only means the request came back — the toggle re-enables whether it
		// succeeded or failed, and this route renders no notice to tell the two apart.
		// Jetpack rewrites the record (and so this menu) only for a change the server
		// accepted, so the menu it now offers is what confirms the new status.
		await actionsMenu.getByRole( 'button', { name: 'Actions' } ).click();
		const followUpItem = this.page.getByRole( 'menuitem', {
			name: expectedFollowUpAction,
			exact: true,
		} );
		await followUpItem.waitFor( { state: 'visible', timeout: RESPONSE_MENU_TIMEOUT } );
		// Same close-and-confirm dance as verifyActionExistsInMenu.
		await this.page.keyboard.press( 'Escape' );
		await followUpItem.waitFor( { state: 'detached', timeout: RESPONSE_MENU_TIMEOUT } );
	}

	/**
	 * Returns to the responses list from the standalone single response page.
	 *
	 * Status actions leave the user on the page (the header badge changes instead),
	 * so anything that needs the list has to navigate back first. There's no Close
	 * button on this page — the "Forms" breadcrumb is the way back.
	 */
	private async leaveSingleResponsePage(): Promise< void > {
		if ( ! ( await this.isOnSingleResponsePage() ) ) {
			return;
		}

		// The breadcrumb always lands on the inbox. Arm the list wait before clicking:
		// callers that then ask for the Inbox take `clickFolderTab`'s already-on-it
		// early return, so this is the only chance to let the list settle before a
		// search runs against it.
		const listResponse = this.page.waitForResponse(
			( response ) =>
				( response.url().includes( '/wp-json/wp/v2/feedback' ) ||
					!! response.url().match( /\/wp\/v2\/sites\/[0-9]+\/feedback/ ) ) &&
				// The counts request shares the path and would resolve this early.
				! response.url().includes( '/counts' ) &&
				response.url().includes( `status=${ encodeURIComponent( 'draft,publish' ) }` ),
			{ timeout: 15 * 1000 }
		);

		await this.page
			.locator( '.jp-forms__single-response-breadcrumbs' )
			// Exact, so a form title containing "Forms" in the trailing crumb can't
			// be picked up instead.
			.getByRole( 'link', { name: 'Forms', exact: true } )
			.click();
		await this.getSingleResponsePage().waitFor( { state: 'hidden', timeout: 10 * 1000 } );
		await this.page
			.locator( '.dataviews-filters__summary-chip' )
			.filter( { hasText: /Folder is:/i } )
			.waitFor( { state: 'visible', timeout: 10 * 1000 } );

		// Tolerate the miss: the route's loader reads through the core-data cache, so
		// a warm cache renders the list without issuing a request at all.
		await listResponse.catch( () => undefined );
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
	 * @param {string} text The text to match in the row. Prefer the email address:
	 * it is what the list was searched by, so it is guaranteed to identify the row.
	 */
	async viewResponseRowByText( text: string ): Promise< void > {
		const responseRowLocator = this.getResponseRow( text );
		await responseRowLocator.waitFor( { state: 'visible' } );
		await responseRowLocator.getByRole( 'button', { name: 'Actions' } ).click();
		// The menu item is on a popover portal, so outside of the response row locator
		const viewMenuItem = this.page.getByRole( 'menuitem', { name: 'View' } ).first();
		await viewMenuItem.click();

		if ( await this.isCentralFormManagement() ) {
			// "View" navigates to the standalone single response page on newer
			// Jetpack versions, and opens the DataViews inspector on older ones.
			await this.getSingleResponsePage()
				.or( this.page.locator( '.jp-forms-response-header' ) )
				.first()
				.waitFor( { state: 'visible' } );
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
			// Status actions leave the user on the single response page, so get back
			// to the list before reaching for the folder chips.
			await this.leaveSingleResponsePage();

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

			// If the chip text includes the folder name, we're already on the correct folder.
			const chipText = ( await folderChip.textContent() )?.toLowerCase();
			if ( chipText?.includes( folderName.toLowerCase() ) ) {
				return;
			}

			const folderOption = this.page.getByRole( 'option', {
				name: new RegExp( folderName, 'i' ),
			} );
			// This method always leaves the popover closed, so an open popover here
			// means a caller opened it. Clicking the chip then would shut it.
			if ( ! ( await folderOption.isVisible() ) ) {
				await folderChip.click();
			}

			const status =
				folderName.toLowerCase() === 'inbox' ? 'draft,publish' : folderName.toLowerCase();
			const listResponse = this.page.waitForResponse(
				( response ) =>
					( response.url().includes( '/wp-json/wp/v2/feedback' ) ||
						!! response.url().match( /\/wp\/v2\/sites\/[0-9]+\/feedback/ ) ) &&
					// The counts request shares the path and would resolve this early.
					! response.url().includes( '/counts' ) &&
					response.url().includes( `status=${ encodeURIComponent( status ) }` )
			);
			await folderOption.click();
			// Wait for the chip text to reflect the selected folder.
			await this.page
				.locator( '.dataviews-filters__summary-chip' )
				.filter( { hasText: new RegExp( `Folder is:\\s*${ folderName }`, 'i' ) } )
				.waitFor();

			await listResponse;

			// Selecting a folder leaves the popover open over the table, where it
			// swallows clicks on the rows underneath. Toggle it shut with the chip:
			// an Escape landing within ~500ms of the filter's re-render segfaults the
			// renderer on Atomic (SIGSEGV, null deref on CrRendererMain), and the run
			// then dies at whatever call comes next.
			await folderChip.click();
			await folderOption.waitFor( { state: 'hidden', timeout: 5000 } );
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
	 * Deliberately not read from the chip's own count ("Folder is: Inbox (3)").
	 * That count is only correct once the search-scoped `feedback/counts` refetch
	 * has landed, and `searchResponses` cannot guarantee it has: its predicate
	 * matches both the list request and the counts request, so it resolves on
	 * whichever arrives first. A stale count returns the wrong folder without
	 * throwing, which hides the failure until several steps later.
	 *
	 * @param {string} text Text identifying the response row, e.g. the email address.
	 * @returns {Promise<'Inbox'|'Spam'>} The folder holding the response.
	 * @throws If neither Inbox nor Spam holds a matching response.
	 */
	async findFolderWithResult( text: string ): Promise< 'Inbox' | 'Spam' > {
		if ( await this.isCentralFormManagement() ) {
			for ( const folder of [ 'Inbox', 'Spam' ] as const ) {
				await this.clickFolderTab( folder );
				// Changing folder refetches without the search term — the request is
				// `status=spam` with no `search=`, so the list comes back unfiltered and
				// the row is only findable if it happens to be on the first page. Re-apply
				// the search. Clear first: refilling the identical value fires no request.
				await this.clearSearch( true );
				await this.searchResponses( text );
				if ( await this.hasResponseRow( text ) ) {
					return folder;
				}
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
		if ( await this.isOnSingleResponsePage() ) {
			await this.clickSingleResponseMenuAction( 'Not spam', 'Mark as spam' );
			return;
		}
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
		if ( await this.isOnSingleResponsePage() ) {
			// The single response page spells this one out in full.
			await this.clickSingleResponseMenuAction( 'Mark as spam', 'Not spam' );
			return;
		}
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
		if ( await this.isOnSingleResponsePage() ) {
			await this.clickSingleResponseMenuAction( 'Mark as read', 'Mark as unread' );
			return;
		}
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
		if ( await this.isOnSingleResponsePage() ) {
			await this.clickSingleResponseMenuAction( 'Mark as unread', 'Mark as read' );
			return;
		}
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
		if ( await this.isOnSingleResponsePage() ) {
			await this.clickSingleResponseMenuAction( 'Trash', 'Restore' );
			return;
		}
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
		if ( await this.isOnSingleResponsePage() ) {
			await this.clickSingleResponseMenuAction( 'Restore', 'Mark as spam' );
			return;
		}
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
		// The single response page has no Close button — the breadcrumb is the way
		// back to the list.
		if ( await this.isOnSingleResponsePage() ) {
			await this.leaveSingleResponsePage();
			return;
		}

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
		if (
			url.includes( 'jetpack-forms-responses-wp-admin' ) ||
			url.includes( '/responses/' ) ||
			// The standalone single response page, which is CFM-only.
			url.includes( '/response/' )
		) {
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
	async hasResponseRow( text: string, timeout = 5000 ): Promise< boolean > {
		// waitFor, not isVisible: isVisible() returns immediately and ignores its
		// timeout, so callers that check straight after a folder switch would read
		// the table mid-refetch and conclude the row is absent.
		return this.getResponseRow( text )
			.waitFor( { state: 'visible', timeout } )
			.then( () => true )
			.catch( () => false );
	}

	/**
	 * Opens the actions menu (three dot menu) and verifies the specified action exists.
	 *
	 * @param {string} text The text to match in the row. Prefer the email address:
	 * it is what the list was searched by, so it is guaranteed to identify the row.
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
