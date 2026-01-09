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
