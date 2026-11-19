import config from '@automattic/calypso-config';

const STORAGE_KEY = 'signup_email_tracking_consent';

// French and Italian signup pages ask before tracking email opens and clicks.
const LANGUAGES = [ 'fr', 'it' ];

// The answer on the signup form that is open now, or null when no form is asking.
let currentAnswer: boolean | null = null;

export function shouldAskEmailTrackingConsent( locale: string | null | undefined ): boolean {
	return (
		config.isEnabled( 'me/email-tracking-consent' ) &&
		LANGUAGES.includes( ( locale ?? '' ).split( '-' )[ 0 ] )
	);
}

function readSavedAnswer(): boolean | null {
	try {
		const answer = window.sessionStorage.getItem( STORAGE_KEY );
		return answer === null ? null : answer === 'true';
	} catch {
		return null;
	}
}

export function setEmailTrackingConsent( agreed: boolean | null ): void {
	currentAnswer = agreed;
}

/**
 * Saves the answer before a social login leaves the page. The login can return to another page,
 * which has no form to ask again. A page that does not ask clears an answer saved earlier.
 */
export function saveEmailTrackingConsentForSocialLogin(): void {
	if ( currentAnswer === null ) {
		forgetSavedEmailTrackingConsent();
		return;
	}
	try {
		window.sessionStorage.setItem( STORAGE_KEY, String( currentAnswer ) );
	} catch {}
}

/**
 * The answer to send with an email signup. Empty unless the open form asked.
 */
export function getEmailTrackingConsentPayload(): { email_tracking?: boolean } {
	return currentAnswer === null ? {} : { email_tracking: currentAnswer };
}

/**
 * The answer to send with a social signup: the one saved when the social button was clicked, or
 * the open form's.
 */
export function getEmailTrackingConsentPayloadForSocialLogin(): { email_tracking?: boolean } {
	const answer = readSavedAnswer() ?? currentAnswer;
	return answer === null ? {} : { email_tracking: answer };
}

// Called once the social signup went through or the answer changed, so an old answer is not reused.
export function forgetSavedEmailTrackingConsent(): void {
	try {
		window.sessionStorage.removeItem( STORAGE_KEY );
	} catch {}
}
