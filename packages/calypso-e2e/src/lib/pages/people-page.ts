import { Page } from 'playwright';
import { clickNavTab, reloadAndRetry } from '../../element-helper';
import { NoticeComponent } from '../components';

export type PeoplePageTabs = 'Users' | 'Followers' | 'Email Followers' | 'Invites';

const selectors = {
	// Navigation tabs
	navTabs: '.section-nav-tabs',
	navTabsDropdownOptions: '.select-dropdown__option',

	// Team people
	teamUser: ( username: string ) => `.people-profile:has(:text("${ username }"))`,
	clearUserButton: 'button:has-text("Clear")',
	removeUserButton: ( username: string ) => `button:has-text("Remove ${ username }")`,
	deleteConfirmBanner: ':text("Invite deleted.")',
	removeConfirmButton: '.dialog__action-buttons button:has-text("Remove")',
	removeConfirmBanner: ':text("Successfully removed")',

	// Header
	addPeopleButton: 'a:text("Add a user")',
	invitePeopleButton: '.people-list-section-header__add-button',

	// Invites
	invitedUser: ( email: string ) => `[title="${ email }"]`,
	revokeInviteButton: 'button:text("Revoke")',
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
	 * Click view all link if its available.
	 */
	async clickViewAllIfAvailable(): Promise< void > {
		const viewAllLink = await this.page.getByRole( 'link', { name: 'View all' } );

		if ( ( await viewAllLink.count() ) > 0 ) {
			await viewAllLink.click();
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
	async deleteUser( username: string ): Promise< void > {
		// Try the Clear button first (for pending invites)
		const clearButton = this.page.locator( selectors.clearUserButton );
		try {
			await clearButton.waitFor( { state: 'visible', timeout: 2000 } );
			if ( await clearButton.isVisible() ) {
				await clearButton.click();
				await this.page.waitForSelector( selectors.deleteConfirmBanner );
				return;
			}
		} catch ( e ) {}

		// If Clear button not found, try Remove flow (for accepted invites)
		const removeButton = this.page.locator( selectors.removeUserButton( username ) );
		await removeButton.click();
		await this.page.click( selectors.removeConfirmButton );
		await this.page.waitForSelector( selectors.removeConfirmBanner );
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
	 * Click on the `Invite` button to navigate to the invite user page.
	 */
	async clickAddTeamMember(): Promise< void > {
		await this.waitUntilLoaded();

		await this.page.click( selectors.addPeopleButton );
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
		/**
		 * Closure to wait for the invited user to be processed in the backend and then
		 * appear on the frontend.
		 *
		 * @param {Page} page Page on which the actions take place.
		 */
		async function waitForInviteToAppear( page: Page ): Promise< void > {
			await page.waitForSelector( selectors.invitedUser( emailAddress ), {
				timeout: 5 * 1000,
			} );
		}

		await reloadAndRetry( this.page, waitForInviteToAppear );

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

		const noticeComponent = new NoticeComponent( this.page );
		await noticeComponent.noticeShown( 'Invite deleted' );
	}
}
