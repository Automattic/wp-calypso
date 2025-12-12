import { Page, Locator, expect } from 'playwright/test';
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
	 */
	async clickViewAllIfAvailable(): Promise< void > {
		const viewAllLink = this.page.getByRole( 'link', {
			name: 'View all',
		} );

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
				this.page.waitForURL( '**/people/invites/**', { waitUntil: 'networkidle' } ),
				clickNavTab( this.page, name ),
			] );
			return;
		}
		await clickNavTab( this.page, name );
	}

	/**
	 * Waits for an invitation to appear in the pending invites list. Reloads the page until the invitation is found or the timeout is reached.
	 * @param emailaddress Email address of the invited user.
	 */
	async expectInvitation( emailaddress: string ): Promise< void > {
		await this.clickViewAllIfAvailable();
		await expect( async () => {
			await this.page.reload();
			await expect( this.page.getByTitle( emailaddress ) ).toBeVisible();
		} ).toPass( { timeout: 60000 } );
	}

	/**
	 * Locate and click on an user in the pending invites list container.
	 *
	 * @param {string} email Email of the user.
	 */
	async selectInvitation( email: string ): Promise< void > {
		await this.page.getByTitle( email ).click();
	}

	/**
	 * Clear the invitation of a user from site.
	 */
	async clearUserInvitation(): Promise< void > {
		await this.clearUserButton.click();
		await expect(
			this.page.getByText( 'Invite deleted' ),
			'Invite deleted notice should be visible'
		).toBeVisible();
	}

	/**
	 * Removes a user from site.
	 */
	async removeUserFromSite( username: string ): Promise< void > {
		await this.page.getByRole( 'button', { name: `Remove ${ username }` } ).click();
		await this.page.getByRole( 'button', { name: 'Remove', exact: true } ).click();
		await expect(
			this.page.getByText( `Successfully removed @${ username }` ),
			'User removed notice should be visible'
		).toBeVisible();
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
		await expect(
			this.page.getByText( 'Invite deleted' ),
			'Invite deleted notice should be visible'
		).toBeVisible();
	}

	/**
	 * Navigates to the team member user details page with a direct URL. Verifies that the page is loaded by checking the presence of the Remove button.
	 * @param baseURL Calypso URL.
	 * @param siteURL User's primary site URL.
	 * @param username Username of the team member.
	 */
	async visitTeamMemberUserDetails(
		baseURL: string,
		siteURL: string,
		username: string
	): Promise< void > {
		expect( baseURL, 'Base URL should be defined' ).toBeDefined();
		expect( siteURL, 'Site URL should be defined' ).toBeDefined();
		expect( username, 'Username should be defined' ).toBeDefined();
		await this.page.goto( `${ baseURL }/people/edit/${ siteURL }/${ username }` );

		await expect( this.page.getByRole( 'button', { name: 'Remove' } ) ).toBeVisible();
	}
}
