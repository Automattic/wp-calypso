import config from 'config';
import MailosaurClient from 'mailosaur';
import type { Message, Link } from 'mailosaur/lib/models';

/**
 * Wrapper client around the Mailosaur.io Node.JS client.
 */
export class EmailClient {
	private client;

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
	 * @param {string} param0.subject Subject of the email.
	 * @returns {Message} Message object returned by Mailosaur client.
	 */
	async getLastEmail( {
		inboxId,
		emailAddress,
		subject,
	}: {
		inboxId: string;
		emailAddress: string;
		subject?: string;
	} ): Promise< Message > {
		const searchCriteria = {
			sentTo: emailAddress,
			subject: subject !== undefined ? subject : '',
		};

		// Get messages sent within the last 30 seconds.
		const message = await this.client.messages.get( inboxId, searchCriteria, {
			receivedAfter: new Date( Date.now() - 30 * 1000 ),
		} );
		return message;
	}

	/**
	 * Extracts and returns all links from an email message.
	 *
	 * @param {Message} message Representing the email message.
	 * @returns {Promise<string[]} Array of links contained in the email message.
	 * @throws {Error} If the email did not contain a body or no links were found.
	 */
	async getLinksFromMessage( message: Message ): Promise< string[] > {
		if ( ! message.html ) {
			throw new Error( 'Email did not contain a body.' );
		}

		const links = message.html.links as Link[];
		if ( ! links || links.length === 0 ) {
			throw new Error( 'Email did not contain any links.' );
		}

		const results = new Set< string >();
		for ( const link of links ) {
			if ( link.href ) {
				results.add( link.href );
			}
		}
		return Array.from( results );
	}

	/**
	 * Given a Message object, permanently deletes the message from the server.
	 *
	 * @param {Message} message E-mail message to delete.
	 */
	async deleteMessage( message: Message ): Promise< void > {
		if ( ! message.id ) {
			throw new Error( 'Message ID not found.' );
		}
		return await this.client.messages.del( message.id );
	}
}
