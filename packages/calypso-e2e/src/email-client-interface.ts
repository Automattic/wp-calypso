/**
 * Common email message interface that works with both Mailosaur and Mailpit.
 *
 * This interface represents the subset of message properties that tests actually use,
 * allowing both email providers to be used interchangeably.
 */
export interface EmailMessage {
	/** Unique message identifier */
	id?: string;

	/** Email subject */
	subject?: string;

	/** HTML content of the message */
	html?: {
		/** Raw HTML body */
		body?: string;
		/** Parsed links from HTML */
		links?: Array< {
			href?: string;
			text?: string;
		} >;
	};

	/** Plain text content of the message */
	text?: {
		/** Raw text body */
		body?: string;
		/** Links extracted from text */
		links?: Array< {
			href?: string;
		} >;
		/** OTP/verification codes extracted from text */
		codes?: Array< {
			value?: string;
		} >;
	};
}

/**
 * Search criteria for finding email messages.
 */
export interface EmailSearchCriteria {
	/** Inbox/server ID to search in */
	inboxId: string;
	/** Only return messages received after this date */
	receivedAfter?: Date;
	/** Filter by recipient email address */
	sentTo?: string;
	/** Filter by sender email address */
	sentFrom?: string;
	/** Filter by subject (partial match) */
	subject?: string;
	/** Filter by body content */
	body?: string;
}

/**
 * Common interface for email testing clients.
 *
 * Both EmailClient (Mailosaur) and MailpitEmailClient implement this interface,
 * allowing tests to work with either provider transparently.
 */
export interface IEmailClient {
	/**
	 * Generate a test email address for the given inbox.
	 */
	getTestEmailAddress( inboxId: string ): string;

	/**
	 * Search for and return the latest matching email message.
	 */
	getLastMatchingMessage( criteria: EmailSearchCriteria ): Promise< EmailMessage >;

	/**
	 * Extract all link URLs from a message's HTML content.
	 */
	getLinksFromMessage( message: EmailMessage ): Promise< string[] >;

	/**
	 * Find a link URL by its text label.
	 */
	getLinkFromMessageByKey( message: EmailMessage, key: string ): string | null;

	/**
	 * Extract and normalize a magic login link from a message.
	 */
	getMagicLink( message: EmailMessage ): URL;

	/**
	 * Extract a 2FA/OTP code from a message.
	 */
	get2FACodeFromMessage( message: EmailMessage ): string;

	/**
	 * Delete a message from the email server.
	 */
	deleteMessage( message: EmailMessage ): Promise< void >;
}
