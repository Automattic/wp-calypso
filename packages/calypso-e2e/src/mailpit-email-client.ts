import * as cheerio from 'cheerio';
import { envVariables } from '.';

/**
 * Message structure returned by MailpitEmailClient.
 * Mirrors the structure expected by tests (compatible with Mailosaur's Message type).
 */
export interface MailpitMessage {
	id: string;
	subject: string;
	from: { email: string; name?: string };
	to: Array< { email: string; name?: string } >;
	receivedAt: Date;
	html?: {
		body: string;
		links: Array< { href?: string; text?: string } >;
	};
	text?: {
		body: string;
		links: Array< { href?: string } >;
		codes: Array< { value?: string } >;
	};
}

/**
 * Raw message structure from Mailpit API.
 */
interface MailpitApiMessage {
	ID: string;
	MessageID: string;
	From: { Address: string; Name?: string };
	To: Array< { Address: string; Name?: string } >;
	Subject: string;
	Created: string;
	HTML: string;
	Text: string;
}

/**
 * Search result structure from Mailpit API.
 */
interface MailpitSearchResult {
	messages: Array< {
		ID: string;
		Created: string;
		Subject: string;
	} >;
	messages_count: number;
}

/**
 * Email client for Mailpit with the same public API as EmailClient (Mailosaur).
 *
 * Mailpit is an open-source email testing tool that runs locally or in Docker.
 * Unlike Mailosaur, it doesn't pre-parse links or OTP codes, so this client
 * implements that functionality using cheerio for HTML parsing and regex for
 * code extraction.
 *
 * @see https://mailpit.axllent.org/
 */
export class MailpitEmailClient {
	private baseUrl: string;
	private emailDomain: string;
	private startTimestamp: Date;

	/**
	 * Construct an instance of MailpitEmailClient.
	 *
	 * @param baseUrl - Mailpit API base URL (default: MAILPIT_URL env var or http://localhost:8025)
	 * @param emailDomain - Domain for generated test emails (default: MAILPIT_EMAIL_DOMAIN env var or test.local)
	 */
	constructor( baseUrl?: string, emailDomain?: string ) {
		this.baseUrl = ( baseUrl ?? process.env.MAILPIT_URL ?? 'http://localhost:8025' ).replace(
			/\/$/,
			''
		);
		this.emailDomain = emailDomain ?? process.env.MAILPIT_EMAIL_DOMAIN ?? 'test.local';
		this.startTimestamp = new Date();
	}

	/**
	 * Returns a test email address.
	 *
	 * Unlike Mailosaur which uses server-generated addresses, Mailpit accepts
	 * any email address. This method generates a unique address using the
	 * provided prefix, timestamp, and random suffix.
	 *
	 * @param inboxId - Prefix for the email address (used as inbox identifier)
	 * @returns Generated email address
	 */
	getTestEmailAddress( inboxId: string ): string {
		const timestamp = Date.now();
		const random = Math.random().toString( 36 ).substring( 2, 8 );
		return `${ inboxId }-${ timestamp }-${ random }@${ this.emailDomain }`;
	}

	/**
	 * Given search criteria, retrieves the latest matching message.
	 *
	 * This method polls the Mailpit API until a matching message is found
	 * or the timeout is reached. Unlike Mailosaur's SDK which has built-in
	 * polling, we implement it manually here.
	 *
	 * @param params - Search parameters
	 * @param params.inboxId - Inbox identifier (used for logging, not filtering in Mailpit)
	 * @param params.receivedAfter - Only return messages received after this timestamp
	 * @param params.sentTo - Filter by recipient email address
	 * @param params.sentFrom - Filter by sender email address
	 * @param params.subject - Filter by subject (partial match)
	 * @param params.body - Filter by body content (full-text search)
	 * @returns The matching message
	 * @throws Error if no matching message is found within the timeout
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
	} ): Promise< MailpitMessage > {
		const timeout = 120 * 1000; // Match Mailosaur's 120s timeout
		const pollInterval = 2000; // Poll every 2 seconds
		const endTime = Date.now() + timeout;
		const afterTimestamp = receivedAfter ?? this.startTimestamp;

		console.log(
			`[Mailpit] Searching for email: to=${ sentTo }, subject=${ subject }, inbox=${ inboxId }`
		);

		while ( Date.now() < endTime ) {
			try {
				const query = this.buildSearchQuery( {
					sentTo,
					sentFrom,
					subject,
					body,
				} );
				const searchUrl = `${ this.baseUrl }/api/v1/search?query=${ encodeURIComponent( query ) }`;

				const response = await fetch( searchUrl );
				if ( ! response.ok ) {
					throw new Error( `Mailpit search failed: ${ response.status } ${ response.statusText }` );
				}

				const data: MailpitSearchResult = await response.json();

				// Filter messages by receivedAfter timestamp
				// (Mailpit search only supports day-level date filtering)
				const matchingMessages = data.messages?.filter(
					( m ) => new Date( m.Created ) > afterTimestamp
				);

				if ( matchingMessages && matchingMessages.length > 0 ) {
					// Get the most recent matching message
					const latestMessage = matchingMessages[ 0 ];
					console.log( `[Mailpit] Found matching email: ${ latestMessage.Subject }` );
					return this.fetchAndNormalizeMessage( latestMessage.ID );
				}
			} catch ( error ) {
				console.warn( `[Mailpit] Search error (will retry): ${ error }` );
			}

			// Wait before next poll
			await this.sleep( pollInterval );
		}

		throw new Error(
			`[Mailpit] Timeout waiting for email matching: to=${ sentTo }, subject=${ subject }`
		);
	}

	/**
	 * Extracts and returns all links from a message.
	 *
	 * @param message - The email message
	 * @returns Array of unique link URLs from the message
	 * @throws Error if the message has no HTML body or no links
	 */
	async getLinksFromMessage( message: MailpitMessage ): Promise< string[] > {
		if ( ! message.html ) {
			throw new Error( 'Message did not contain a body.' );
		}

		const links = message.html.links;
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
	 * Given an email message and a key, returns a URL if the link text matches the key.
	 *
	 * @param message - The email message
	 * @param key - Link text to search for (partial match)
	 * @returns The link URL if found, null otherwise
	 * @throws Error if the message has no HTML body
	 */
	getLinkFromMessageByKey( message: MailpitMessage, key: string ): string | null {
		if ( ! message.html ) {
			throw new Error( 'Message did not contain a body.' );
		}

		const links = message.html.links;
		if ( ! links ) {
			return null;
		}

		for ( const link of links ) {
			if ( link.text && link.text.trim().includes( key.trim() ) ) {
				return link.href ?? null;
			}
		}
		return null;
	}

	/**
	 * Specialized method to return human-friendly magic login link.
	 *
	 * Also performs normalization of the link to target the correct Calypso environment.
	 *
	 * @param message - The email message
	 * @returns URL object for the normalized magic link
	 * @throws Error if the message has no text links
	 */
	getMagicLink( message: MailpitMessage ): URL {
		const link = message.text?.links?.[ 0 ];

		if ( ! link || ! link.href ) {
			throw new Error( 'Message did not contain text links.' );
		}

		const magicLinkURL = new URL( link.href );
		const baseURL = new URL( envVariables.CALYPSO_BASE_URL );

		// Returns a new URL object with normalized magic link.
		// Useful when running tests against environments other than the default.
		return new URL( magicLinkURL.pathname + magicLinkURL.search, baseURL.origin );
	}

	/**
	 * Extracts and returns a 2FA/OTP code from the message.
	 *
	 * Mailpit doesn't pre-parse codes like Mailosaur, so we use regex patterns
	 * to extract them from the message text.
	 *
	 * @param message - The email message
	 * @returns The extracted OTP code
	 * @throws Error if no code is found in the message
	 */
	get2FACodeFromMessage( message: MailpitMessage ): string {
		if ( ! message.text ) {
			throw new Error( 'Message is not defined.' );
		}

		const codes = message.text.codes;
		if ( ! codes || codes.length === 0 ) {
			throw new Error( 'Message has no OTP code.' );
		}

		const code = codes[ 0 ]?.value;
		if ( ! code ) {
			throw new Error( 'Message has no OTP code.' );
		}

		return code;
	}

	/**
	 * Permanently deletes a message from Mailpit.
	 *
	 * @param message - The message to delete
	 */
	async deleteMessage( message: MailpitMessage ): Promise< void > {
		if ( ! message.id ) {
			throw new Error( 'Message ID not found.' );
		}

		const response = await fetch( `${ this.baseUrl }/api/v1/messages`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { IDs: [ message.id ] } ),
		} );

		if ( ! response.ok ) {
			throw new Error( `Failed to delete message: ${ response.status } ${ response.statusText }` );
		}
	}

	/**
	 * Build a Mailpit search query string from criteria.
	 */
	private buildSearchQuery( criteria: {
		sentTo?: string;
		sentFrom?: string;
		subject?: string;
		body?: string;
	} ): string {
		const parts: string[] = [];

		if ( criteria.sentTo ) {
			parts.push( `to:"${ criteria.sentTo }"` );
		}
		if ( criteria.sentFrom ) {
			parts.push( `from:"${ criteria.sentFrom }"` );
		}
		if ( criteria.subject ) {
			parts.push( `subject:"${ criteria.subject }"` );
		}
		if ( criteria.body ) {
			// Body search in Mailpit is full-text, not field-specific
			parts.push( criteria.body );
		}

		return parts.length > 0 ? parts.join( ' ' ) : '*';
	}

	/**
	 * Fetch a message by ID and normalize it to our standard format.
	 */
	private async fetchAndNormalizeMessage( id: string ): Promise< MailpitMessage > {
		const response = await fetch( `${ this.baseUrl }/api/v1/message/${ id }` );
		if ( ! response.ok ) {
			throw new Error( `Failed to fetch message: ${ response.status } ${ response.statusText }` );
		}

		const msg: MailpitApiMessage = await response.json();
		return this.normalizeMessage( msg );
	}

	/**
	 * Convert a Mailpit API message to our normalized format.
	 *
	 * This includes parsing HTML for links and extracting OTP codes from text.
	 */
	private normalizeMessage( msg: MailpitApiMessage ): MailpitMessage {
		// Parse HTML links using cheerio
		const htmlLinks: Array< { href?: string; text?: string } > = [];
		if ( msg.HTML ) {
			const $ = cheerio.load( msg.HTML );
			$( 'a[href]' ).each( ( _, el ) => {
				htmlLinks.push( {
					href: $( el ).attr( 'href' ),
					text: $( el ).text().trim(),
				} );
			} );
		}

		// Extract links from plain text
		const textLinks: Array< { href?: string } > = [];
		if ( msg.Text ) {
			const urlMatches = msg.Text.match( /https?:\/\/[^\s]+/g ) ?? [];
			for ( const url of urlMatches ) {
				textLinks.push( { href: url } );
			}
		}

		// Extract OTP codes from text
		const codes: Array< { value?: string } > = [];
		if ( msg.Text ) {
			// Match 6-digit codes (most common OTP format)
			const codeMatches = msg.Text.matchAll( /\b(\d{6})\b/g );
			for ( const match of codeMatches ) {
				codes.push( { value: match[ 1 ] } );
			}

			// Also try "code: XXXXXX" patterns
			const labeledCodeMatches = msg.Text.matchAll( /(?:code|verification)[:\s]+(\d{4,8})/gi );
			for ( const match of labeledCodeMatches ) {
				// Avoid duplicates
				if ( ! codes.some( ( c ) => c.value === match[ 1 ] ) ) {
					codes.push( { value: match[ 1 ] } );
				}
			}
		}

		return {
			id: msg.ID,
			subject: msg.Subject,
			from: {
				email: msg.From?.Address ?? '',
				name: msg.From?.Name,
			},
			to:
				msg.To?.map( ( t ) => ( {
					email: t.Address ?? '',
					name: t.Name,
				} ) ) ?? [],
			receivedAt: new Date( msg.Created ),
			html: msg.HTML
				? {
						body: msg.HTML,
						links: htmlLinks,
				  }
				: undefined,
			text: msg.Text
				? {
						body: msg.Text,
						links: textLinks,
						codes: codes,
				  }
				: undefined,
		};
	}

	/**
	 * Sleep for the specified number of milliseconds.
	 */
	private sleep( ms: number ): Promise< void > {
		return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
	}
}
