import { extractDomainWithExtension } from '@automattic/onboarding';
import { getGmailUrl } from 'calypso/lib/gsuite/get-services-urls';

export interface InboxLink {
	// Lowercase provider slug for analytics (aliases collapse, e.g. hotmail → outlook).
	provider: string;
	url: string;
}

interface Provider {
	// Every domain this provider actually runs mail for. A brand in the name proves nothing:
	// live.io is Google-hosted, so `live.*` would send its owner to a mailbox they have no
	// account on — worse than the no link an unlisted domain gets. Verify MX before adding one.
	domains: string[];
	inboxUrl: ( email: string ) => string;
}

// Deliberately short: the top handful of domains cover almost every signup, and a long tail
// invites entries that have since been parked. URLs other than Gmail's come from
// client/login/magic-login/magic-login-email.
const PROVIDERS: Record< string, Provider > = {
	gmail: {
		domains: [ 'gmail.com', 'googlemail.com' ],
		// The account chooser, so multi-account users land on the right mailbox.
		inboxUrl: ( email ) => getGmailUrl( email ),
	},
	outlook: {
		domains: [
			'outlook.com',
			'hotmail.com',
			'hotmail.be',
			'hotmail.co.uk',
			'hotmail.de',
			'hotmail.es',
			'hotmail.fr',
			'hotmail.it',
			'hotmail.nl',
			'live.com',
			'live.co.uk',
			'live.fr',
			'live.nl',
			'msn.com',
		],
		inboxUrl: () => 'https://outlook.live.com/mail/',
	},
	yahoo: {
		domains: [
			'yahoo.com',
			'yahoo.ca',
			'yahoo.co.uk',
			'yahoo.com.br',
			'yahoo.de',
			'yahoo.es',
			'yahoo.fr',
			'yahoo.it',
			'ymail.com',
		],
		inboxUrl: () => 'https://mail.yahoo.com/',
	},
	// A separate service from the rest of Yahoo, with its own mailbox.
	yahoojp: {
		domains: [ 'yahoo.co.jp' ],
		inboxUrl: () => 'https://mail.yahoo.co.jp/',
	},
	icloud: {
		domains: [ 'icloud.com', 'me.com', 'mac.com' ],
		inboxUrl: () => 'https://www.icloud.com/mail/',
	},
	aol: {
		domains: [ 'aol.com' ],
		inboxUrl: () => 'https://mail.aol.com/',
	},
	proton: {
		domains: [ 'proton.me', 'protonmail.com', 'pm.me' ],
		inboxUrl: () => 'https://mail.proton.me/',
	},
};

const DOMAIN_TO_PROVIDER: Record< string, keyof typeof PROVIDERS > = Object.fromEntries(
	Object.entries( PROVIDERS ).flatMap( ( [ provider, { domains } ] ) =>
		domains.map( ( domain ) => [ domain, provider ] )
	)
);

// The inbox link for an email's provider, or null for an unrecognized/self-hosted domain.
export function getInboxLink( email: string | undefined ): InboxLink | null {
	const domain = email ? extractDomainWithExtension( email ) : undefined;
	const provider = domain ? DOMAIN_TO_PROVIDER[ domain ] : undefined;
	return provider && email ? { provider, url: PROVIDERS[ provider ].inboxUrl( email ) } : null;
}
