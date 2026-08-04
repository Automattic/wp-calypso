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

const DOMAIN_TO_PROVIDER: Record< string, string > = {
	'gmail.com': 'gmail',
	'googlemail.com': 'gmail',
	'yahoo.co.jp': 'yahoojp',
	'icloud.com': 'icloud',
	'me.com': 'icloud',
	'mac.com': 'icloud',
	'proton.me': 'proton',
	'protonmail.com': 'proton',
	'pm.me': 'proton',
};

// Microsoft, Yahoo and AOL each run dozens of per-country domains — hotmail.co.uk, yahoo.fr,
// outlook.com.br — and serve them all from the one webmail host, so they're matched by brand
// instead of enumerated. `me`, `mac` and the Google brands stay exact: they're either too short
// to be distinctive as a label, or have no country domains to match.
const BRAND_TO_PROVIDER: Record< string, string > = {
	hotmail: 'outlook',
	live: 'outlook',
	outlook: 'outlook',
	msn: 'outlook',
	yahoo: 'yahoo',
	ymail: 'yahoo',
	rocketmail: 'yahoo',
	aol: 'aol',
};

// A brand followed by a country suffix and nothing else, so a host that merely starts with one
// of the brands — live.somecompany.com — isn't taken for the webmail provider.
const BRAND_WITH_COUNTRY_SUFFIX = /^([a-z]+)\.(?:[a-z]{2,3}\.)?[a-z]{2,4}$/;

// The inbox link for an email's provider, or null for an unrecognized/self-hosted domain.
export function getInboxLink( email: string | undefined ): InboxLink | null {
	const domain = email ? extractDomainWithExtension( email ) : undefined;
	if ( ! email || ! domain ) {
		return null;
	}

	const brand = BRAND_WITH_COUNTRY_SUFFIX.exec( domain )?.[ 1 ];
	// Exact first, so a domain that needs its own mailbox isn't swept up by its brand.
	const provider =
		DOMAIN_TO_PROVIDER[ domain ] ?? ( brand ? BRAND_TO_PROVIDER[ brand ] : undefined );

	return provider ? { provider, url: PROVIDER_INBOX_URL[ provider ]( email ) } : null;
}
