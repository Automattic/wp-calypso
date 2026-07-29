import { extractDomainWithExtension } from '@automattic/onboarding';

// Our verification email's sender domain, used to pre-filter provider inboxes to it
// ("sniper link" style) where the provider supports a search URL.
const SENDER = 'wordpress.com';

export interface InboxLink {
	providerName: string;
	url: string;
}

// Common webmail providers, keyed by email domain. Gmail and Yahoo take a search URL
// pre-filtered to our sender; the rest deep-link to the inbox (no reliable search URL).
const PROVIDERS: Record< string, InboxLink > = {
	'gmail.com': {
		providerName: 'Gmail',
		url: `https://mail.google.com/mail/u/0/#search/from%3A${ SENDER }+newer_than%3A1d`,
	},
	'googlemail.com': {
		providerName: 'Gmail',
		url: `https://mail.google.com/mail/u/0/#search/from%3A${ SENDER }+newer_than%3A1d`,
	},
	'yahoo.com': {
		providerName: 'Yahoo Mail',
		url: `https://mail.yahoo.com/d/search/keyword=from%253A${ SENDER }`,
	},
	'outlook.com': { providerName: 'Outlook', url: 'https://outlook.live.com/mail/0/' },
	'hotmail.com': { providerName: 'Outlook', url: 'https://outlook.live.com/mail/0/' },
	'live.com': { providerName: 'Outlook', url: 'https://outlook.live.com/mail/0/' },
	'msn.com': { providerName: 'Outlook', url: 'https://outlook.live.com/mail/0/' },
	'icloud.com': { providerName: 'iCloud Mail', url: 'https://www.icloud.com/mail/' },
	'me.com': { providerName: 'iCloud Mail', url: 'https://www.icloud.com/mail/' },
	'mac.com': { providerName: 'iCloud Mail', url: 'https://www.icloud.com/mail/' },
	'aol.com': { providerName: 'AOL Mail', url: 'https://mail.aol.com/' },
	'proton.me': { providerName: 'Proton Mail', url: 'https://mail.proton.me/u/0/' },
	'protonmail.com': { providerName: 'Proton Mail', url: 'https://mail.proton.me/u/0/' },
};

// The inbox link for an email's provider, or null for an unrecognized/self-hosted domain.
export function getInboxLink( email: string | undefined ): InboxLink | null {
	const domain = email ? extractDomainWithExtension( email ) : undefined;
	return ( domain && PROVIDERS[ domain ] ) || null;
}
