import { Page } from 'playwright';
import { clickNavTab } from '../../element-helper';

export type PeoplePageTabs = 'Team' | 'Followers' | 'Email Followers' | 'Invites';

const selectors = {
	// Navigation tabs
	navTabs: '.section-nav-tabs',
	navTabsDropdownOptions: '.select-dropdown__option',

	// Team people
	teamUser: ( username: string ) => `.people-profile:has(:text("${ username }"))`,
	deletedUserContentAction: ( action: 'reassign' | 'delete' ) => `input[value="${ action }"]`,
	deleteUserButton: `button:text("Delete user")`,
	deleteConfirmBanner: ':text("Successfully deleted")',

	// Header
	invitePeopleButton: '.people-list-section-header__add-button',

	// Invites
	invitedUser: ( email: string ) => `[title="${ email }"]`,
	revokeInviteButton: 'button:text("Revoke invite")',
	inviteRevokedMessage: 'span:text("Invite deleted.")',
};

/**
 * Represents the Users > All Users page.
 */
export class PeoplePage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Wait until the page is loaded.
	 */
	async waitUntilLoaded(): Promise< void > {
		await this.page.waitForLoadState( 'load' );
	}

	/**
	 * Clicks on the navigation tab (desktop) or dropdown (mobile).
	 *
	 * @param {string} name Name of the tab to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTab( name: PeoplePageTabs ): Promise< void > {
		await clickNavTab( this.page, name );
	}

	/* Team People */

	/**
	 * Locate and click on an user.
	 *
	 * @param {string} username Username of the user.
	 */
	async selectUser( username: string ): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.teamUser( username ) ),
		] );
	}

	/**
	 * Delete the user from site.
	 */
	async deleteUser(): Promise< void > {
		const elementHandle = await this.page.waitForSelector(
			selectors.deletedUserContentAction( 'delete' )
		);

		// Invoke scroll directly via JavaScript.
		// Playwright's built-in `click` or `check` methods are not able to
		// scroll the radio buttons into view for uncertain reasons.
		await this.page.evaluate(
			( element: SVGElement | HTMLElement ) => element.scrollIntoView(),
			elementHandle
		);

		await this.page.check( selectors.deletedUserContentAction( 'delete' ) );
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.deleteUserButton ),
		] );
		await this.page.waitForSelector( selectors.deleteConfirmBanner );
	}

	/* Invites */

	/**
	 * Click on the `Invite` button to navigate to the invite user page.
	 */
	async clickInviteUser(): Promise< void > {
		await this.waitUntilLoaded();

		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.invitePeopleButton ),
		] );
	}

	/**
	 * Locate and click on a pending invite.
	 *
	 * @param {string} emailAddress Email address of the pending user.
	 */
	async selectInvitedUser( emailAddress: string ): Promise< void > {
		await this.waitUntilLoaded();

		// Ensure the card for the invited user is stable and loaded before clicking,
		// otherwise the click is ignored.
		const elementHandle = await this.page.waitForSelector( selectors.invitedUser( emailAddress ) );
		await elementHandle.waitForElementState( 'stable' );

		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( selectors.invitedUser( emailAddress ) ),
		] );
	}

	/**
	 * Revokes the pending invite.
	 */
	async revokeInvite(): Promise< void > {
		await this.waitUntilLoaded();

		await this.page.click( selectors.revokeInviteButton );
		await this.page.waitForSelector( selectors.inviteRevokedMessage );
	}
}
