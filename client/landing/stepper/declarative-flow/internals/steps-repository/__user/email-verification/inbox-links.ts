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
	// Yahoo Japan is a separate service from the rest of Yahoo, with its own mailbox.
	yahoojp: () => 'https://mail.yahoo.co.jp/',
	icloud: () => 'https://www.icloud.com/mail/',
	aol: () => 'https://mail.aol.com/',
	proton: () => 'https://mail.proton.me/',
};

// An allowlist, not a pattern: a brand name in the domain proves nothing about who runs the
// mail. `live.io` is a Google-hosted business domain, so anything matching `live.*` would send
// its owner to a Microsoft mailbox they have no account on. A domain that isn't listed here
// gets no link at all, which is the safe answer — the poll resolves the gate regardless.
// Adding a country domain a provider actually runs is a one-line change.
const PROVIDER_DOMAINS: Record< string, string[] > = {
	gmail: [ 'gmail.com', 'googlemail.com' ],
	outlook: [
		'outlook.com',
		'outlook.at',
		'outlook.be',
		'outlook.cl',
		'outlook.co.id',
		'outlook.co.nz',
		'outlook.co.th',
		'outlook.com.au',
		'outlook.com.br',
		'outlook.com.tr',
		'outlook.com.vn',
		'outlook.cz',
		'outlook.de',
		'outlook.dk',
		'outlook.es',
		'outlook.fr',
		'outlook.hu',
		'outlook.ie',
		'outlook.in',
		'outlook.it',
		'outlook.jp',
		'outlook.kr',
		'outlook.my',
		'outlook.ph',
		'outlook.pt',
		'outlook.sa',
		'outlook.sg',
		'hotmail.com',
		'hotmail.at',
		'hotmail.be',
		'hotmail.ca',
		'hotmail.ch',
		'hotmail.co.il',
		'hotmail.co.jp',
		'hotmail.co.nz',
		'hotmail.co.th',
		'hotmail.co.uk',
		'hotmail.com.ar',
		'hotmail.com.br',
		'hotmail.com.mx',
		'hotmail.com.tr',
		'hotmail.cz',
		'hotmail.de',
		'hotmail.dk',
		'hotmail.es',
		'hotmail.fi',
		'hotmail.fr',
		'hotmail.gr',
		'hotmail.hu',
		'hotmail.it',
		'hotmail.nl',
		'hotmail.no',
		'hotmail.se',
		'live.com',
		'live.at',
		'live.be',
		'live.ca',
		'live.cl',
		'live.cn',
		'live.co.uk',
		'live.co.za',
		'live.com.ar',
		'live.com.au',
		'live.com.mx',
		'live.de',
		'live.dk',
		'live.fi',
		'live.fr',
		'live.hk',
		'live.ie',
		'live.in',
		'live.it',
		'live.jp',
		'live.nl',
		'live.no',
		'live.pt',
		'live.ru',
		'live.se',
		'msn.com',
	],
	yahoo: [
		'yahoo.com',
		'yahoo.ca',
		'yahoo.co.id',
		'yahoo.co.in',
		'yahoo.co.nz',
		'yahoo.co.th',
		'yahoo.co.uk',
		'yahoo.com.ar',
		'yahoo.com.au',
		'yahoo.com.br',
		'yahoo.com.hk',
		'yahoo.com.mx',
		'yahoo.com.ph',
		'yahoo.com.sg',
		'yahoo.com.tr',
		'yahoo.com.tw',
		'yahoo.com.vn',
		'yahoo.de',
		'yahoo.dk',
		'yahoo.es',
		'yahoo.fi',
		'yahoo.fr',
		'yahoo.gr',
		'yahoo.ie',
		'yahoo.it',
		'yahoo.nl',
		'yahoo.no',
		'yahoo.pl',
		'yahoo.pt',
		'yahoo.se',
		'ymail.com',
		'rocketmail.com',
	],
	yahoojp: [ 'yahoo.co.jp' ],
	icloud: [ 'icloud.com', 'me.com', 'mac.com' ],
	aol: [ 'aol.com', 'aol.co.uk', 'aol.de', 'aol.fr' ],
	proton: [ 'proton.me', 'protonmail.com', 'pm.me' ],
};

const DOMAIN_TO_PROVIDER: Record< string, string > = Object.fromEntries(
	Object.entries( PROVIDER_DOMAINS ).flatMap( ( [ provider, domains ] ) =>
		domains.map( ( domain ) => [ domain, provider ] )
	)
);

// The inbox link for an email's provider, or null for an unrecognized/self-hosted domain.
export function getInboxLink( email: string | undefined ): InboxLink | null {
	const domain = email ? extractDomainWithExtension( email ) : undefined;
	const provider = domain ? DOMAIN_TO_PROVIDER[ domain ] : undefined;
	return provider && email ? { provider, url: PROVIDER_INBOX_URL[ provider ]( email ) } : null;
}
