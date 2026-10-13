/**
 * PROTOTYPE — proof of concept only.
 *
 * Stops the browser and password managers from offering saved addresses or
 * contact details on the demo form, since all demo data is fake.
 *
 * Chrome ignores `autocomplete="off"` for address fields, but it does skip
 * autofill for an unrecognized token, so every input gets one. A
 * MutationObserver covers inputs rendered later (the phone input waits for its
 * country list, and the country combobox lives inside a shared component).
 */
import { RefObject, useEffect } from 'react';

const AUTOCOMPLETE_TOKEN = 'a4a-prototype-no-autofill';

function disableAutofill( root: HTMLElement ) {
	root
		.querySelectorAll< HTMLInputElement | HTMLSelectElement >( 'input, select' )
		.forEach( ( field ) => {
			if ( field.getAttribute( 'autocomplete' ) === AUTOCOMPLETE_TOKEN ) {
				return;
			}
			field.setAttribute( 'autocomplete', AUTOCOMPLETE_TOKEN );
			field.setAttribute( 'data-1p-ignore', 'true' );
			field.setAttribute( 'data-lpignore', 'true' );
			field.setAttribute( 'data-bwignore', 'true' );
			field.setAttribute( 'data-form-type', 'other' );
		} );
}

export default function useDisableAutofill( ref: RefObject< HTMLElement | null > ) {
	useEffect( () => {
		const root = ref.current;
		if ( ! root ) {
			return;
		}

		disableAutofill( root );
		const observer = new MutationObserver( () => disableAutofill( root ) );
		observer.observe( root, { childList: true, subtree: true } );

		return () => observer.disconnect();
	}, [ ref ] );
}
