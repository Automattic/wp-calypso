import { extractDomainWithExtension } from '@automattic/onboarding';

export interface InboxLink {
	// Lowercase provider slug for analytics (aliases collapse, e.g. hotmail → outlook).
	provider: string;
	url: string;
}

// Inbox URLs for common webmail providers, matching the vetted set used by magic-login
// (client/login/magic-login/magic-login-email). Kept deliberately simple — a link to the
// provider's inbox; pre-filtering the search to our sender is a possible later refinement.
const PROVIDER_INBOX_URLS: Record< string, string > = {
	gmail: 'https://mail.google.com/mail/',
	outlook: 'https://outlook.live.com/mail/',
	yahoo: 'https://mail.yahoo.com/',
	icloud: 'https://www.icloud.com/mail/',
	aol: 'https://mail.aol.com/',
	proton: 'https://mail.proton.me/',
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
	return provider ? { provider, url: PROVIDER_INBOX_URLS[ provider ] } : null;
}
