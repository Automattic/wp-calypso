import { extractDomainWithExtension } from '@automattic/onboarding';
import { getGmailUrl } from 'calypso/lib/gsuite/get-services-urls';

export interface InboxLink {
	// Lowercase provider slug for analytics (aliases collapse, e.g. hotmail → outlook).
	provider: string;
	url: string;
}

// Inbox URLs by provider, built from the signup address. Gmail routes through the account
// chooser so multi-account users land on the right mailbox; the rest are the vetted URLs from
// client/login/magic-login/magic-login-email.
const PROVIDER_INBOX_URL: Record< string, ( email: string ) => string > = {
	gmail: ( email ) => getGmailUrl( email ),
	outlook: () => 'https://outlook.live.com/mail/',
	yahoo: () => 'https://mail.yahoo.com/',
	icloud: () => 'https://www.icloud.com/mail/',
	aol: () => 'https://mail.aol.com/',
	proton: () => 'https://mail.proton.me/',
};

const DOMAIN_TO_PROVIDER: Record< string, string > = {
	'gmail.com': 'gmail',
	'googlemail.com': 'gmail',
	'outlook.com': 'outlook',
	'hotmail.com': 'outlook',
	'live.com': 'outlook',
	'msn.com': 'outlook',
	'yahoo.com': 'yahoo',
	'icloud.com': 'icloud',
	'me.com': 'icloud',
	'mac.com': 'icloud',
	'aol.com': 'aol',
	'proton.me': 'proton',
	'protonmail.com': 'proton',
};

// The inbox link for an email's provider, or null for an unrecognized/self-hosted domain.
export function getInboxLink( email: string | undefined ): InboxLink | null {
	const domain = email ? extractDomainWithExtension( email ) : undefined;
	const provider = domain ? DOMAIN_TO_PROVIDER[ domain ] : undefined;
	return provider && email ? { provider, url: PROVIDER_INBOX_URL[ provider ]( email ) } : null;
}
