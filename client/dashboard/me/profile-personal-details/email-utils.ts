/**
 * Well-known free email providers whose addresses are not at risk of expiry.
 * Anything not on this list is treated as a custom domain that could expire.
 */
const FREE_EMAIL_PROVIDERS = new Set( [
	'gmail.com',
	'googlemail.com',
	'yahoo.com',
	'yahoo.co.uk',
	'yahoo.fr',
	'yahoo.de',
	'yahoo.es',
	'yahoo.it',
	'yahoo.ca',
	'yahoo.com.au',
	'hotmail.com',
	'hotmail.co.uk',
	'hotmail.fr',
	'hotmail.de',
	'hotmail.es',
	'hotmail.it',
	'outlook.com',
	'outlook.co.uk',
	'outlook.fr',
	'outlook.de',
	'live.com',
	'live.co.uk',
	'live.fr',
	'live.de',
	'msn.com',
	'icloud.com',
	'me.com',
	'mac.com',
	'aol.com',
	'protonmail.com',
	'proton.me',
	'tutanota.com',
	'tutamail.com',
	'zoho.com',
	'fastmail.com',
	'fastmail.fm',
	'yandex.com',
	'yandex.ru',
	'mail.ru',
	'gmx.com',
	'gmx.de',
	'gmx.net',
	'web.de',
	'wp.pl',
] );

function getEmailDomain( email: string ): string | null {
	const atIndex = email.lastIndexOf( '@' );
	if ( atIndex < 0 || atIndex === email.length - 1 ) {
		return null;
	}
	return email.slice( atIndex + 1 ).toLowerCase();
}

/**
 * Returns true if the email domain is a custom domain (i.e. not a well-known
 * free email provider), meaning it is subject to expiry risk.
 */
export function isCustomDomainEmail( email: string ): boolean {
	const domain = getEmailDomain( email );
	return domain !== null && ! FREE_EMAIL_PROVIDERS.has( domain );
}
