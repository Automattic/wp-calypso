import { Page, Locator } from 'playwright';
import { clickNavTab } from '../../element-helper';
import { NoticeComponent } from '../components';

export type PeoplePageTabs = 'Users' | 'Followers' | 'Email Followers' | 'Invites';

/**
 * Represents the Users > All Users page.
 */
export class PeoplePage {
	private page: Page;

	// Navigation tabs
	readonly navTabs: Locator;
	readonly navTabsDropdownOptions: Locator;

	// Team people
	readonly clearUserButton: Locator;
	readonly inviteDeletedConfirmNotice: Locator;
	readonly removeConfirmButton: Locator;
	readonly removeConfirmBanner: Locator;

	// Header
	readonly addPeopleButton: Locator;
	readonly invitePeopleButton: Locator;

	// Invites
	readonly revokeInviteButton: Locator;
	readonly inviteRevokedMessage: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page
	 */
	constructor( page: Page ) {
		this.page = page;

		// Navigation tabs
		this.navTabs = this.page.locator( '.section-nav-tabs' );
		this.navTabsDropdownOptions = this.page.locator( '.select-dropdown__option' );

		// Team people
		this.clearUserButton = this.page.getByRole( 'button', { name: 'Clear' } );
		this.inviteDeletedConfirmNotice = this.page.getByText( 'Invite deleted.' );
		this.removeConfirmButton = this.page.locator(
			'.dialog__action-buttons button:has-text("Remove")'
		);
		this.removeConfirmBanner = this.page.locator( ':text("Successfully removed")' );

		// Header
		this.addPeopleButton = this.page.locator( 'a:text("Add a user")' );
		this.invitePeopleButton = this.page.locator( '.people-list-section-header__add-button' );

		// Invites
		this.revokeInviteButton = this.page.locator( 'button:text("Revoke")' );
		this.inviteRevokedMessage = this.page.locator( 'span:text("Invite deleted.")' );
	}

	/**
	 * Get locator for a team user by username.
	 *
	 * @param {string} username Username of the user.
	 * @returns {Locator} Locator for the user.
	 */
	private teamUser( username: string ): Locator {
		return this.page.locator( `.people-profile:has(:text("${ username }"))` );
	}

	/**
	 * Get locator for remove user button by username.
	 *
	 * @param {string} username Username of the user.
	 * @returns {Locator} Locator for the remove button.
	 */
	private removeUserButton( username: string ): Locator {
		return this.page.locator( `button:has-text("Remove ${ username }")` );
	}

	/**
	 * Get locator for an invited user by email.
	 *
	 * @param {string} email Email address of the invited user.
	 * @returns {Locator} Locator for the invited user.
	 */
	private invitedUser( email: string ): Locator {
		return this.page.locator( `[title="${ email }"]` );
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
		const viewAllLink = this.page.getByRole( 'link', { name: 'View all' } );

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
		await this.page.getByTitle( username ).click();
	}

	/**
	 * Delete the user from site.
	 */
	async deleteUser( username: string ): Promise< void > {
		const removeButton = this.removeUserButton( username );
		await removeButton.click();
		await this.removeConfirmButton.click();
		await this.removeConfirmBanner.waitFor();
	}

	/**
	 * Clear the invitation of a user from site.
	 */
	async clearUserInvitation(): Promise< void > {
		await this.clearUserButton.click();
		await this.inviteDeletedConfirmNotice.waitFor();
	}

	/* Invites */

	/**
	 * Click on the `Invite` button to navigate to the invite user page.
	 */
	async clickInviteUser(): Promise< void > {
		await this.waitUntilLoaded();

		await Promise.all( [ this.page.waitForNavigation(), this.invitePeopleButton.click() ] );
	}

	/**
	 * Click on the `Invite` button to navigate to the invite user page.
	 */
	async clickAddTeamMember(): Promise< void > {
		await this.waitUntilLoaded();

		await this.addPeopleButton.click();
	}

	/**
	 * Revokes the pending invite.
	 */
	async revokeInvite(): Promise< void > {
		await this.waitUntilLoaded();

		await this.revokeInviteButton.click();

		const noticeComponent = new NoticeComponent( this.page );
		await noticeComponent.noticeShown( 'Invite deleted' );
	}
}
