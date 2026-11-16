import config from '@automattic/calypso-config';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';

const STORAGE_KEY = 'signup_email_tracking_consent';

// French and Italian signup pages ask before tracking email opens and clicks.
const LANGUAGES = [ 'fr', 'it' ];

export function shouldAskEmailTrackingConsent( locale: string | null | undefined ): boolean {
	return (
		config.isEnabled( 'me/email-tracking-consent' ) &&
		LANGUAGES.includes( ( locale ?? '' ).split( '-' )[ 0 ] )
	);
}

function readStoredAnswer(): string | null {
	try {
		return window.sessionStorage.getItem( STORAGE_KEY );
	} catch {
		return null;
	}
}

export function getStoredEmailTrackingConsent(): boolean {
	return readStoredAnswer() === 'true';
}

// Kept in sessionStorage so the answer survives a social login that reloads the page.
export function storeEmailTrackingConsent( agreed: boolean ): void {
	try {
		window.sessionStorage.setItem( STORAGE_KEY, String( agreed ) );
	} catch {}
}

export function clearEmailTrackingConsent(): void {
	try {
		window.sessionStorage.removeItem( STORAGE_KEY );
	} catch {}
}

/**
 * The answer to send with an account creation request. Empty unless the signup form asked, so an
 * answer left over from another page in the same tab is not sent.
 */
export function getEmailTrackingConsentPayload(): { email_tracking?: boolean } {
	const answer = readStoredAnswer();
	if ( answer === null || ! shouldAskEmailTrackingConsent( getLocaleSlug() ) ) {
		return {};
	}
	return { email_tracking: answer === 'true' };
}
