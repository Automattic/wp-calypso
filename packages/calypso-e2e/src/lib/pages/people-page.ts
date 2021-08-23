import { Page } from 'playwright';

export type PeoplePageTabs = 'Team' | 'Followers' | 'Email Followers' | 'Invites';

const selectors = {
	// Navigation tabs
	navTabs: '.section-nav-tabs',

	// Invites
	pendingInvite: ( email: string ) => `[title="${ email }"]`,
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
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Clicks on the navigation tab (desktop) or dropdown (mobile).
	 *
	 * @param {string} name Name of the tab to click.
	 * @returns {Promise<void>} No return value.
	 */
	async clickTab( name: PeoplePageTabs ): Promise< void > {
		// These navtabs do not change into a dropdown, unlike the navtabs present
		// elsewhere in Calypso (eg. MediaPage).
		await this.page.click( `${ selectors.navTabs } span:text("${ name }")` );
	}

	/**
	 * Click on the `Invite` button to navigate to the invite user page.
	 */
	async clickInviteUser(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( 'span:text-is("Invite")' ),
		] );
	}

	/**
	 * Revokes the pending invite.
	 *
	 * @param {string} emailAddress Email address of the user to revoke invite.
	 */
	async revokeInvite( emailAddress: string ): Promise< void > {
		await this.page.click( selectors.pendingInvite( emailAddress ) );
		await this.page.click( selectors.revokeInviteButton );
		await this.page.waitForSelector( selectors.inviteRevokedMessage );
	}
}
