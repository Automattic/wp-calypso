import { Page } from 'playwright';

export type Roles = 'Administrator' | 'Editor' | 'Author' | 'Contributor' | 'Follower';

const selectors = {
	// Form inputs
	emailInput: '#usernamesOrEmails',
	roleRadio: ( role: Roles ) => `input[value="${ role.toLowerCase() }"]`,
	messageInput: '#message',
	sendInviteButton: 'button:text("Send invitation")',

	// Banner
	inviteSuccessful: 'span:text("Invitation sent successfully")',
};

/**
 * Represents the Users > Add New page.
 */
export class InvitePeoplePage {
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
	 * Given an email address, role and optinally a message, sends an invite.
	 *
	 * @param param0 Keyed parameter object.
	 * @param {string} param0.email Email address of the invited user.
	 * @param {Roles} param0.role Role of the invited user.
	 * @param {string} param0.message Optional message for the invitation.
	 */
	async invite( {
		email,
		role,
		message = '',
	}: {
		email: string;
		role: Roles;
		message?: string;
	} ): Promise< void > {
		await this.page.fill( selectors.emailInput, email );
		await this.page.press( selectors.emailInput, 'Enter' );
		await this.page.check( selectors.roleRadio( role ) );
		if ( message ) {
			await this.page.fill( selectors.messageInput, message );
		}
		await this.page.click( selectors.sendInviteButton );
		await this.page.waitForSelector( selectors.inviteSuccessful );
	}
}
