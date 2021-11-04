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
		// For Invites tab, wait for the full request to be completed.
		if ( name === 'Invites' ) {
			await Promise.all( [
				this.page.waitForNavigation( { url: '**/people/invites/**', waitUntil: 'networkidle' } ),
				clickNavTab( this.page, name ),
			] );
			return;
		}
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
		await this.page.waitForLoadState( 'networkidle' );

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

		// Native `page.check` sometimes fails here. Instead, click on the radio and wait for the
		// Delete user button to become enabled.
		await this.page.click( selectors.deletedUserContentAction( 'delete' ) );
		await this.page.waitForSelector(
			`${ selectors.deletedUserContentAction( 'delete' ) }:checked`
		);

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
	 * This method will make several attempts to locate the pending invite.
	 * Each attempt will wait 5 seconds before the page is refreshed and another attempt made.
	 *
	 * The retry mechanism is necessary due to Calypso sometimes not immediately reflecting
	 * the newly invited user. This can occur due to large number of pending invites and also
	 * because of faster-than-human execution speed of automated test frameworks.
	 *
	 * @param {string} emailAddress Email address of the pending user.
	 */
	async selectInvitedUser( emailAddress: string ): Promise< void > {
		// Retry three times, each time allowing 5 seconds for Playwright to locate the
		// pending user invite.
		for ( let retries = 3; retries > 0; retries -= 1 ) {
			console.log( retries );
			try {
				await this.page.waitForSelector( selectors.invitedUser( emailAddress ), {
					timeout: 5 * 1000,
				} );
			} catch {
				await this.page.reload();
			}
		}

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
