import { CheckboxControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import {
	forgetSavedEmailTrackingConsent,
	setEmailTrackingConsent,
	shouldAskEmailTrackingConsent,
} from 'calypso/lib/signup/email-tracking-consent';

/**
 * The email tracking answer for the signup form, unticked by default. `isAsked` is false on pages
 * that don't ask, and they send no answer.
 */
export function useEmailTrackingConsent() {
	const isAsked = shouldAskEmailTrackingConsent( useTranslate().localeSlug );
	const [ hasAgreed, setHasAgreedState ] = useState( false );

	useEffect( () => {
		if ( ! isAsked ) {
			return;
		}
		setEmailTrackingConsent( hasAgreed );
		return () => setEmailTrackingConsent( null );
	}, [ isAsked, hasAgreed ] );

	const setHasAgreed = ( agreed: boolean ) => {
		// A changed answer replaces the one saved for a social login.
		forgetSavedEmailTrackingConsent();
		setHasAgreedState( agreed );
	};

	return { isAsked, hasAgreed, setHasAgreed };
}

interface EmailTrackingConsentProps {
	checked: boolean;
	onChange: ( checked: boolean ) => void;
}

export function EmailTrackingConsent( { checked, onChange }: EmailTrackingConsentProps ) {
	const { __ } = useI18n();

	return (
		<CheckboxControl
			className="signup-form__email-tracking-consent"
			label={ __(
				"[Optional] You agree that WordPress can use pixels and similar technologies to understand if you're opening our communications and what content you engage with."
			) }
			checked={ checked }
			onChange={ onChange }
		/>
	);
}
