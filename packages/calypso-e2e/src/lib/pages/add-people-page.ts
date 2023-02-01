import { Page } from 'playwright';

export type RoleValue = 'administrator' | 'editor' | 'author' | 'contributor' | 'follower';

const selectors = {
	// Form inputs
	emailInput: '#token-0',
	roleSelect: `#role`,
	messageInput: '#message',
	addMessageButton: 'button:text("+ Add a message")',
	sendInviteButton: 'button:text("Send invitation")',
	formReadyForSubmit: '.team-invite-form-valid',

	// Banner
	inviteSuccessful: 'span:text("Invitation sent successfully")',
};

/**
 * Represents the Users > Add New page.
 */
export class AddPeoplePage {
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
	 * @param {RoleValue} param0.role Role of the invited user.
	 * @param {string} param0.message Optional message for the invitation.
	 */
	async addTeamMember( {
		email,
		role,
		message = '',
	}: {
		email: string;
		role: RoleValue;
		message?: string;
	} ): Promise< void > {
		await this.page.fill( selectors.emailInput, email );
		await this.page.press( selectors.emailInput, 'Tab' );
		await this.page.selectOption( selectors.roleSelect, role );
		if ( message ) {
			await this.page.click( selectors.addMessageButton );
			await this.page.fill( selectors.messageInput, message );
		}
		await this.page.waitForSelector( selectors.formReadyForSubmit );
		await this.page.click( selectors.sendInviteButton );
		await this.page.waitForSelector( selectors.inviteSuccessful );
	}
}
