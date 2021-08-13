import config from 'config';
import MailosaurClient from 'mailosaur';
import type { Message, Link } from 'mailosaur/lib/models';

/**
 * Wrapper client around the Mailosaur.io Node.JS client.
 */
export class EmailClient {
	private client: MailosaurClient;

	/**
	 * Construct and instance of the EmailClient.
	 */
	constructor() {
		this.client = new MailosaurClient( config.get( 'mailosaurAPIKey' ) );
	}

	/**
	 * Given an inbox and email address, retrieves the latest email.
	 *
	 * @param param0 Keyed parameter object.
	 * @param {string} param0.inboxId ID of the inbox to look into. Also known as serverId in Mailosaur parlance.
	 * @param {string} param0.emailAddress Email address of the recipient.
	 * @returns {Message} Message object returned by Mailosaur client.
	 */
	async getLastEmail( {
		inboxId,
		emailAddress,
	}: {
		inboxId: string;
		emailAddress: string;
	} ): Promise< Message > {
		const searchCriteria = {
			sentTo: emailAddress,
		};

		const message = await this.client.messages.get( inboxId, searchCriteria );

		return message;
	}

	/**
	 * Extracts and returns all links from an email message.
	 *
	 * @param {Message} message Representing the email message.
	 * @returns {Promise<Link[]} Array of links contained in the email message.
	 * @throws {Error} If the email did not contain a body or no links were found.
	 */
	async getLinksFromMessage( message: Message ): Promise< Link[] > {
		if ( ! message.html ) {
			throw new Error( 'Email did not contain a body.' );
		}

		const links = message.html.links as Link[];
		if ( ! links || links.length === 0 ) {
			throw new Error( 'Email did not contain any links.' );
		}

		return links;
	}
}
