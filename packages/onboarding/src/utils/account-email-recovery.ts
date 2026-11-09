import { getEmailDomain, isValidEmailAddress } from './email-validation';

// Match complete domains so a domain like yahoo.school.edu still receives the warning.
const WEBMAIL_DOMAINS = new Set( [
	'126.com',
	'163.com',
	'abv.bg',
	'aim.com',
	'aol.com',
	'atomicmail.io',
	'bk.ru',
	'daum.net',
	'duck.com',
	'duckduckgo.com',
	'email.com',
	'fastmail.com',
	'fastmail.fm',
	'freemail.hu',
	'freenet.de',
	'gmail.com',
	'gmx.at',
	'gmx.ch',
	'gmx.com',
	'gmx.de',
	'gmx.net',
	'googlemail.com',
	'hanmail.net',
	'hey.com',
	'hotmail.co.uk',
	'hotmail.com',
	'hotmail.de',
	'hotmail.es',
	'hotmail.fr',
	'hotmail.it',
	'hushmail.com',
	'i.ua',
	'icloud.com',
	'inbox.ru',
	'interia.pl',
	'laposte.net',
	'libero.it',
	'list.ru',
	'live.co.uk',
	'live.com',
	'live.de',
	'live.fr',
	'mac.com',
	'mail.com',
	'mail.ru',
	'mailfence.com',
	'me.com',
	'msn.com',
	'myyahoo.com',
	'naver.com',
	'o2.pl',
	'onet.pl',
	'outlook.co.uk',
	'outlook.com',
	'outlook.de',
	'outlook.es',
	'outlook.fr',
	'pm.me',
	'posteo.de',
	'privaterelay.appleid.com',
	'proton.me',
	'protonmail.com',
	'qq.com',
	'rambler.ru',
	'rediff.com',
	'rediffmail.com',
	'rocketmail.com',
	'sapo.pt',
	'seznam.cz',
	'sina.cn',
	'sina.com',
	'tuta.com',
	'tuta.io',
	'tutamail.com',
	'tutanota.com',
	'ukr.net',
	'virgilio.it',
	'web.de',
	'wp.pl',
	'yahoo.ca',
	'yahoo.co.in',
	'yahoo.co.uk',
	'yahoo.com',
	'yahoo.com.au',
	'yahoo.com.br',
	'yahoo.com.mx',
	'yahoo.de',
	'yahoo.es',
	'yahoo.fr',
	'yahoo.it',
	'yandex.com',
	'yandex.ru',
	'ymail.com',
	'zoho.com',
] );

export function isAccountEmailAtRisk( email: string ): boolean {
	return (
		isValidEmailAddress( email ) && ! WEBMAIL_DOMAINS.has( getEmailDomain( email ).toLowerCase() )
	);
}

export type VerifiedAccountRecovery = { verifiedEmail?: string; hasVerifiedPhone: boolean };

export function hasVerifiedAccountRecovery(
	email: string,
	recovery: VerifiedAccountRecovery | undefined
): boolean {
	const backup = recovery?.verifiedEmail?.trim().toLowerCase();
	return !! recovery?.hasVerifiedPhone || ( !! backup && backup !== email.trim().toLowerCase() );
}

export function getAccountEmailRecoverySnoozeUntil( now = new Date() ): number {
	const expiry = new Date( now );
	const day = expiry.getUTCDate();
	expiry.setUTCDate( 1 );
	expiry.setUTCMonth( expiry.getUTCMonth() + 7, 0 );
	expiry.setUTCDate( Math.min( day, expiry.getUTCDate() ) );
	return Math.floor( expiry.getTime() / 1000 );
}

export function isAccountEmailRecoverySnoozed( until: unknown ): boolean {
	return typeof until === 'number' && Number.isSafeInteger( until ) && until > Date.now() / 1000;
}
