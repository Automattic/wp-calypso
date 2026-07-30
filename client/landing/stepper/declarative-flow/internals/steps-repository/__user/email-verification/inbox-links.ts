import { extractDomainWithExtension } from '@automattic/onboarding';

// Our verification email's sender domain, used to pre-filter provider inboxes to it
// ("sniper link" style) where the provider supports a search URL.
const SENDER = 'wordpress.com';

export interface InboxLink {
	// Lowercase provider slug for analytics (aliases collapse, e.g. hotmail → outlook).
	provider: string;
	url: string;
}

// Common webmail providers, keyed by email domain. The URL is built from the address so
// multi-account users land on the right mailbox (e.g. Gmail's `authuser`). Gmail and Yahoo
// also pre-filter to our sender; the rest just deep-link to the inbox.
const PROVIDERS: Record< string, { provider: string; url: ( email: string ) => string } > = {
	'gmail.com': {
		provider: 'gmail',
		url: ( email ) =>
			`https://mail.google.com/mail/u/?authuser=${ encodeURIComponent(
				email
			) }#search/from%3A${ SENDER }+newer_than%3A1d`,
	},
	'googlemail.com': {
		provider: 'gmail',
		url: ( email ) =>
			`https://mail.google.com/mail/u/?authuser=${ encodeURIComponent(
				email
			) }#search/from%3A${ SENDER }+newer_than%3A1d`,
	},
	'yahoo.com': {
		provider: 'yahoo',
		url: () => `https://mail.yahoo.com/d/search/keyword=from%253A${ SENDER }`,
	},
	'outlook.com': { provider: 'outlook', url: () => 'https://outlook.live.com/mail/0/' },
	'hotmail.com': { provider: 'outlook', url: () => 'https://outlook.live.com/mail/0/' },
	'live.com': { provider: 'outlook', url: () => 'https://outlook.live.com/mail/0/' },
	'msn.com': { provider: 'outlook', url: () => 'https://outlook.live.com/mail/0/' },
	'icloud.com': { provider: 'icloud', url: () => 'https://www.icloud.com/mail/' },
	'me.com': { provider: 'icloud', url: () => 'https://www.icloud.com/mail/' },
	'mac.com': { provider: 'icloud', url: () => 'https://www.icloud.com/mail/' },
	'aol.com': { provider: 'aol', url: () => 'https://mail.aol.com/' },
	'proton.me': { provider: 'proton', url: () => 'https://mail.proton.me/u/0/' },
	'protonmail.com': { provider: 'proton', url: () => 'https://mail.proton.me/u/0/' },
};

// The inbox link for an email's provider, or null for an unrecognized/self-hosted domain.
export function getInboxLink( email: string | undefined ): InboxLink | null {
	const domain = email ? extractDomainWithExtension( email ) : undefined;
	const match = domain ? PROVIDERS[ domain ] : undefined;
	return match && email ? { provider: match.provider, url: match.url( email ) } : null;
}
