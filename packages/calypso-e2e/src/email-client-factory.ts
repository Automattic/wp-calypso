import { EmailClient } from './email-client';
import { MailpitEmailClient } from './mailpit-email-client';
import type { IEmailClient } from './email-client-interface';

// Re-export types for convenience
export type { IEmailClient, EmailMessage, EmailSearchCriteria } from './email-client-interface';

/**
 * Union type of all email client implementations.
 * Both have the same public API, so they can be used interchangeably.
 *
 * @deprecated Use IEmailClient instead for better type safety
 */
export type EmailClientInstance = IEmailClient;

/**
 * Supported email provider types.
 */
export type EmailProviderType = 'mailosaur' | 'mailpit';

/**
 * Creates the appropriate email client based on the EMAIL_PROVIDER environment variable.
 *
 * Usage:
 *   - Default (Mailosaur): Just run tests normally
 *   - Mailpit: Set EMAIL_PROVIDER=mailpit and optionally MAILPIT_URL
 *
 * @returns An instance implementing IEmailClient (Mailosaur or Mailpit based on env var)
 *
 * @example
 * // Use Mailosaur (default)
 * const client = createEmailClient();
 *
 * @example
 * // Use Mailpit (set env vars before running)
 * // EMAIL_PROVIDER=mailpit MAILPIT_URL=http://localhost:8025
 * const client = createEmailClient();
 */
export function createEmailClient(): IEmailClient {
	const provider = ( process.env.EMAIL_PROVIDER?.toLowerCase() ??
		'mailosaur' ) as EmailProviderType;

	switch ( provider ) {
		case 'mailpit':
			console.log(
				`[Email] Using Mailpit provider (URL: ${
					process.env.MAILPIT_URL ?? 'http://localhost:8025'
				})`
			);
			return new MailpitEmailClient() as IEmailClient;

		case 'mailosaur':
		default:
			console.log( '[Email] Using Mailosaur provider (default)' );
			return new EmailClient() as IEmailClient;
	}
}

/**
 * Check if the current email provider is Mailpit.
 * Useful for provider-specific test logic.
 */
export function isMailpitProvider(): boolean {
	return process.env.EMAIL_PROVIDER?.toLowerCase() === 'mailpit';
}

/**
 * Check if the current email provider is Mailosaur.
 * Useful for provider-specific test logic.
 */
export function isMailosaurProvider(): boolean {
	const provider = process.env.EMAIL_PROVIDER?.toLowerCase();
	return ! provider || provider === 'mailosaur';
}
