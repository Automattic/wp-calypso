import { Page, Locator } from 'playwright';
import { clickNavTab } from '../../element-helper';

export type PeoplePageTabs = 'Users' | 'Followers' | 'Email Followers' | 'Invites';

/**
 * Represents the Users > All Users page.
 * route: /people/team/{site}
 */
export class PeoplePage {
	private page: Page;

	// User details
	readonly clearUserButton: Locator;
	readonly revokeInviteButton: Locator;

	// Header
	readonly addPeopleButton: Locator;
	readonly invitePeopleButton: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page
	 */
	constructor( page: Page ) {
		this.page = page;

		// User details
		this.clearUserButton = this.page.getByRole( 'button', { name: 'Clear' } );
		this.revokeInviteButton = this.page.getByRole( 'button', { name: 'Revoke' } );

		// Header
		this.addPeopleButton = this.page.locator( 'a:text("Add a user")' );
		this.invitePeopleButton = this.page.locator( '.people-list-section-header__add-button' );
	}

	/**
	 * Get the underlying Playwright page instance.
	 * @returns the Playwright page instance
	 */
	getPage(): Page {
		return this.page;
	}

	/**
	 * Click view all link if its available.
	 *
	 * The widget renders asynchronously after navigation; a bare `count()` check races
	 * the render and silently bails when the link isn't there yet. Wait briefly for it.
	 */
	async clickViewAllIfAvailable(): Promise< void > {
		const viewAllLink = this.page.getByRole( 'link', { name: 'View all' } ).first();
		try {
			await viewAllLink.waitFor( { state: 'visible', timeout: 3000 } );
			await viewAllLink.click();
		} catch {
			// No "View all" widget on this page — already on a full list.
		}
	}

	/**
	 * Clicks on the navigation tab (desktop) or dropdown (mobile).
	 *
	 * @param {string} name Name of the tab to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTab( name: PeoplePageTabs ): Promise< void > {
		// For Invites tab, wait for the full request to be completed.
		if ( name === 'Invites' ) {
			await Promise.all( [
				this.page.waitForURL( '**/people/invites/**', { waitUntil: 'networkidle' } ),
				clickNavTab( this.page, name ),
			] );
			return;
		}
		await clickNavTab( this.page, name );
	}

	/**
	 * Waits for an invitation to appear in the pending invites list. Reloads the page until the invitation is found or the timeout is reached.
	 *
	 * On the user-management-revamp /people/team/<site> page, the invites widget only
	 * renders the most recent invite (singleInviteView), so a test invite is invisible
	 * whenever a concurrent test on the same shared site creates a newer one. Hop to
	 * /people/pending-invites/<site> first, which lists every pending invite.
	 *
	 * @param emailaddress Email address of the invited user.
	 * @param timeout Maximum time to wait in milliseconds (default: 60000).
	 */
	async waitForInvitation( emailaddress: string, timeout = 60000 ): Promise< void > {
		await this.ensureFullInvitesList();
		const invitationLocator = this.invitationLink( emailaddress );
		const deadline = Date.now() + timeout;

		// Poll-and-reload until the backend surfaces the pending invite. Each
		// iteration gives the freshly loaded page a bounded grace window (so we
		// don't hammer reloads on a single-shot visibility check), and the
		// per-attempt wait is capped by the time left so the method honours its
		// overall `timeout` contract.
		for (;;) {
			const remaining = deadline - Date.now();
			if ( remaining <= 0 ) {
				// Out of budget: one final bounded wait that throws a real
				// Playwright "not visible" error if the invite never appeared.
				await invitationLocator.waitFor( { state: 'visible', timeout: 5000 } );
				return;
			}
			try {
				await invitationLocator.waitFor( {
					state: 'visible',
					timeout: Math.min( 5000, remaining ),
				} );
				return;
			} catch {
				await this.page.reload();
				await this.page.waitForLoadState( 'domcontentloaded' );
			}
		}
	}

	/**
	 * If the current page is the All Users summary (/people/team/<site>), navigate to the
	 * dedicated pending invites list so every invite is in the DOM.
	 */
	private async ensureFullInvitesList(): Promise< void > {
		const currentUrl = new URL( this.page.url() );
		const teamMatch = currentUrl.pathname.match( /^\/people\/team\/([^/]+)/ );
		if ( ! teamMatch ) {
			return;
		}
		const target = new URL( `/people/pending-invites/${ teamMatch[ 1 ] }`, currentUrl );
		await this.page.goto( target.toString() );
	}

	/**
	 * Locator for the pending-invite list entry of a given email.
	 *
	 * The row's accessible name is `<email> <role>` (e.g. "user@x.com Editor"), so a
	 * substring match on the email is enough and avoids strict-mode collisions with
	 * inner generics that also expose the email as their accessible name.
	 */
	private invitationLink( email: string ): Locator {
		return this.page.getByRole( 'link', { name: email } ).first();
	}

	/**
	 * Locate and click on an user in the pending invites list container.
	 *
	 * @param {string} email Email of the user.
	 */
	async selectInvitation( email: string ): Promise< void > {
		await this.invitationLink( email ).click();
	}

	/**
	 * Clear the invitation of a user from site.
	 */
	async clearUserInvitation(): Promise< void > {
		await this.clearUserButton.click();
		await this.page.getByText( 'Invite deleted' ).waitFor( { state: 'visible' } );
	}

	/**
	 * Removes a user from site. Handles both the team member edit page
	 * (Remove button) and the invite detail page (Clear button).
	 * @param username Username of the user to remove.
	 */
	async removeUserFromSite( username: string ): Promise< void > {
		const removeButton = this.page.getByRole( 'button', {
			name: `Remove ${ username }`,
		} );

		// Wait for either destructive control to render before the one-shot
		// visibility read, so it can't race the page and take the wrong branch.
		await removeButton.or( this.clearUserButton ).first().waitFor();

		if ( await removeButton.isVisible() ) {
			await removeButton.click();
			await this.page.getByRole( 'button', { name: 'Remove', exact: true } ).click();
			await this.page
				.getByText( `Successfully removed @${ username }` )
				.waitFor( { state: 'visible' } );
		} else {
			await this.clearUserButton.click();
			await this.page.getByText( 'Invite deleted' ).waitFor( { state: 'visible' } );
		}
	}

	/**
	 * Click on the `Invite` button to navigate to the invite user page.
	 */
	async clickInviteUser(): Promise< void > {
		await Promise.all( [ this.page.waitForNavigation(), this.invitePeopleButton.click() ] );
	}

	/**
	 * Click on the `Add a user` button to navigate to the invite user page.
	 */
	async clickAddTeamMember(): Promise< void > {
		await this.addPeopleButton.click();
	}

	/**
	 * Revokes the pending invite.
	 */
	async revokeInvite(): Promise< void > {
		await this.revokeInviteButton.click();
		await this.page.getByText( 'Invite deleted' ).waitFor( { state: 'visible' } );
	}

	/**
	 * Navigates to the team member user details page by searching for
	 * the user in the team members list and clicking their profile link.
	 *
	 * Callers must navigate to the Users > All Users page before calling
	 * this method (e.g. via componentSidebar.navigate).
	 *
	 * @param username Username of the team member.
	 */
	async visitTeamMemberUserDetails( username: string ): Promise< void > {
		if ( ! username ) {
			throw new Error( 'username is required' );
		}

		// Open the pinned search and filter by username.
		await this.page.getByRole( 'button', { name: 'Open Search' } ).click();
		await this.page.getByRole( 'searchbox', { name: 'Search' } ).fill( username );

		// Wait for filtered results, then click on the user's profile link.
		const userLink = this.page.getByRole( 'link', { name: username } );
		await userLink.first().click();

		// The user may land on the team member edit page (Remove button) or
		// the invite detail page (Clear button) depending on whether a
		// pending invite record still exists for the user.
		const removeButton = this.page.getByRole( 'button', { name: 'Remove' } );
		const clearButton = this.page.getByRole( 'button', { name: 'Clear' } );
		await removeButton.or( clearButton ).first().waitFor( { state: 'visible' } );
	}
}
