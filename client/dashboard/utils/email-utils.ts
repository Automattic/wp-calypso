import { EmailAccount } from '@automattic/api-core';
import { dashboardLink } from './link';

export type EmailWarningType =
	| 'google_pending_tos_acceptance'
	| 'unverified_forwards'
	| 'unused_mailboxes';

export function accountHasWarningWithSlug(
	warningType: EmailWarningType,
	emailAccount: EmailAccount
) {
	const accountWarnings = emailAccount.warnings.some(
		( warning ) => warningType === warning?.warning_slug
	);

	const emailWarnings = emailAccount.emails.some( ( emailBox ) =>
		emailBox.warnings.some( ( warning ) => warningType === warning.warning_slug )
	);

	return accountWarnings || emailWarnings;
}

// Internal helper to build common Google AccountChooser links
function buildGoogleAccountChooserLink(
	service: 'CPanel' | 'mail',
	continueUrl: string,
	email: string,
	domainName: string
) {
	const accountChooserUrl = new URL( 'https://accounts.google.com/AccountChooser' );
	accountChooserUrl.searchParams.append( 'service', service );
	accountChooserUrl.searchParams.append( 'continue', continueUrl );
	accountChooserUrl.searchParams.append( 'Email', email );
	accountChooserUrl.searchParams.append( 'hd', domainName );
	return accountChooserUrl.href;
}

export function buildGoogleFinishSetupLink( email: string, domainName: string ) {
	return buildGoogleAccountChooserLink(
		'CPanel',
		`https://admin.google.com/${ domainName }/AcceptTermsOfService`,
		email,
		domainName
	);
}

export function buildGoogleMailboxLink( email: string, domainName: string ) {
	return buildGoogleAccountChooserLink(
		'mail',
		'https://mail.google.com/mail/',
		email,
		domainName
	);
}

export function buildGoogleManageWorkspaceLink( email: string, domainName: string ) {
	return buildGoogleAccountChooserLink(
		'CPanel',
		`https://admin.google.com/${ domainName }`,
		email,
		domainName
	);
}

export function buildTitanMailboxLink( email: string ) {
	const titanMailUrl = new URL( 'https://wp.titan.email/mail/' );
	titanMailUrl.searchParams.append( 'email_account', email );
	titanMailUrl.searchParams.append( 'topbar.redirect_url', dashboardLink( '/emails' ) );

	return titanMailUrl.href;
}

/**
 * Masks an email address for privacy while keeping it recognizable.
 *
 * The domain is always shown in full. The local part is masked as follows:
 * - 1 char: first char + 3 asterisks (a → a***)
 * - 2-5 chars: first char + 3 asterisks + last char (john → j***n)
 * - 6 chars: first 2 chars + 3 asterisks + last char (abcdef → ab***f)
 * - 7+ chars: first 2 chars + 3 asterisks + last 2 chars (johndoe → jo***oe)
 *
 * Examples:
 * - a@example.com → a***@example.com
 * - ab@example.com → a***b@example.com
 * - john@example.com → j***n@example.com
 * - abcdef@example.com → ab***f@example.com
 * - johndoe@example.com → jo***oe@example.com
 */
export function maskEmail( email: string ): string {
	const atIndex = email.indexOf( '@' );
	if ( atIndex === -1 ) {
		return email;
	}

	const localPart = email.slice( 0, atIndex );
	const domain = email.slice( atIndex );

	if ( localPart.length === 1 ) {
		// Single char: show first char + asterisks
		return localPart[ 0 ] + '***' + domain;
	}

	if ( localPart.length <= 5 ) {
		// 2-5 chars: show first and last char
		return localPart[ 0 ] + '***' + localPart[ localPart.length - 1 ] + domain;
	}

	if ( localPart.length === 6 ) {
		// 6 chars: show first 2 and last 1 char
		return localPart.slice( 0, 2 ) + '***' + localPart[ localPart.length - 1 ] + domain;
	}

	// 7+ chars: show first 2 and last 2 chars
	return localPart.slice( 0, 2 ) + '***' + localPart.slice( -2 ) + domain;
}
