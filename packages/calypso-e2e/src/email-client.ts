import MailosaurClient from 'mailosaur';
import { SecretsManager } from './secrets';
import { envVariables } from '.';
import type { Message, Link } from 'mailosaur/lib/models';

/**
 * Wrapper client around the Mailosaur.io Node.JS client.
 */
export class EmailClient {
	private client;
	private startTimestamp: Date;

	/**
	 * Construct and instance of the EmailClient.
	 */
	constructor() {
		this.client = new MailosaurClient( SecretsManager.secrets.mailosaur.apiKey );
		this.startTimestamp = new Date();
	}

	/**
	 * Returns a test email address.
	 *
	 * @param {string} inboxId Inbox ID to use for the test email address.
	 */
	getTestEmailAddress( inboxId: string ) {
		return this.client.servers.generateEmailAddress( inboxId );
	}

	/**
	 * Given an inbox ID and sentTo (phone/email), retrieves the latest message.
	 *
	 * @param param0 Keyed parameter object.
	 * @param {string} param0.inboxId ID of the inbox to look into. Also known as serverId in Mailosaur parlance.
	 * @param {Date} param0.receivedAfter Timestamp marking the earliest point the search should look up.
	 * @param {string} param0.sentTo Recipient email or phone number.
	 * @param {string} param0.sentFrom Sender email or phone number.
	 * @param {string} param0.subject Subject of the message.
	 * @param {string} param0.body Body of the message.
	 * @returns {Message} Message object returned by Mailosaur client.
	 */
	async getLastMatchingMessage( {
		inboxId,
		receivedAfter,
		sentTo,
		sentFrom,
		subject,
		body,
	}: {
		inboxId: string;
		receivedAfter?: Date;
		sentTo?: string;
		sentFrom?: string;
		subject?: string;
		body?: string;
	} ): Promise< Message > {
		const searchCriteria = {
			sentTo: sentTo !== undefined ? sentTo : '',
			sentFrom: sentFrom !== undefined ? sentFrom : '',
			subject: subject !== undefined ? subject : '',
			body: body !== undefined ? body : '',
		};

		// Get messages received after either when the client was
		// initialized, or a specified timestamp.
		const message = await this.client.messages.get( inboxId, searchCriteria, {
			receivedAfter: receivedAfter !== undefined ? receivedAfter : this.startTimestamp,
			timeout: 120 * 1000, // Sometimes email is slow to be received.
		} );
		return message;
	}

	/**
	 * Extracts and returns all links from a message.
	 *
	 * @param {Message} message Representing the message.
	 * @returns {Promise<string[]} Array of links contained in the message.
	 * @throws {Error} If the message did not contain a body or no links were found.
	 */
	async getLinksFromMessage( message: Message ): Promise< string[] > {
		if ( ! message.html ) {
			throw new Error( 'Message did not contain a body.' );
		}

		const links = message.html.links as Link[];
		if ( ! links || links.length === 0 ) {
			throw new Error( 'Message did not contain any links.' );
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
	 * Given an email message and a key, returns a URL if the link text
	 * matches the key.
	 *
	 * If no matching links are found, this method returns `null`.
	 *
	 * If the email message is not valid HTML, this method throws.
	 *
	 * @param {Message} message Representing the message.
	 * @param {string} key Link text.
	 * @returns {string|null} If a link text matching the supplied key is found
	 * 	the link URL is returned. Otherwise, returns null.
	 * @throws {Error} If the message is not valid HTML.
	 */
	getLinkFromMessageByKey( message: Message, key: string ): string | null {
		if ( ! message.html ) {
			throw new Error( 'Message did not contain a body.' );
		}

		const links = message.html.links as Link[];

		for ( const link of links ) {
			if ( link.text && link.text.trim().includes( key.trim() ) ) {
				return link.href as string;
			}
		}
		return null;
	}

	/**
	 * Specialized method to return human-friendly magic login link.
	 *
	 * Also performs normalization of the link.
	 * (eg. target calypso.live if run from that environment.)
	 *
	 * @param {Message} message Representing the message.
	 * @returns {URL} URL object for the magic link.
	 * @throws {Error} IF the message did not have any links.
	 */
	getMagicLink( message: Message ): URL {
		const link = message.text?.links?.shift();

		if ( ! link ) {
			throw new Error( 'Message did not contain text links. ' );
		}

		const magicLinkURL = new URL( link?.href as string );
		const baseURL = new URL( envVariables.CALYPSO_BASE_URL );

		// Returns a new URL object with normalized magic link.
		// Useful when running tests against environments other than the default
		// CALYPSO_BASE_URL.
		// Example: https://wordpress.com -> https://container-something.calypso.live.
		return new URL( magicLinkURL.pathname + magicLinkURL.search, baseURL.origin );
	}

	/**
	 * Extracts and returns a 2FA code from the message.
	 *
	 * @param {Message} message Instance of a Mailosaur message.
	 * @returns {string} 2FA code.
	 * @throws {Error} If the message did not contain a 2FA code.
	 */
	get2FACodeFromMessage( message: Message ): string {
		if ( ! message.text ) {
			throw new Error( 'Message is not defined.' );
		}

		if ( message.text.codes?.length === 0 ) {
			throw new Error( 'Message has no OTP code.' );
		}
		return message.text.codes?.at( 0 )?.value as string;
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
