// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#non-printable_keys_function_keys
const keyboardNavigationKeycodes = [ 9, 32, 37, 38, 39, 40 ]; // keyCodes for tab, space, left, up, right, down respectively

// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
const keyboardNavigationKeyValues = [
	'Tab',
	' ',
	// Some browsers returned `'Spacebar'` rather than `' '` for the Space key
	'Spacebar',
	'ArrowDown',
	'ArrowUp',
	'ArrowLeft',
	'ArrowRight',
];

declare global {
	interface KeyboardEvent {
		/**
		 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyIdentifier
		 * Provides Safari support
		 *
		 * @deprecated
		 */
		keyIdentifier: string;
	}
}

/**
 * `event.keyCode` is [deprecated](https://stackoverflow.com/a/35395154), so we must check each of the following:
 * 1. `event.key`
 * 2. `event.keyIdentifier`
 * 3. `event.keyCode` (for posterity)
 *
 * However, [`event.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)
 * and [`event.keyIdentifier`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyIdentifier)
 * both return a string rather than a numerical key code as the old `keyCode` API did.
 *
 * Therefore, we have two arrays of keycodes, one for the string APIs and one for the
 * older number based API.
 *
 * @param event The keyboard event to detect keyboard navigation against.
 */
export function detectKeyboardNavigation( event: KeyboardEvent ): boolean {
	let code: number | string | undefined;

	if ( event.key !== undefined ) {
		code = event.key;
	} else if ( event.keyIdentifier !== undefined ) {
		code = event.keyIdentifier;
	} else if ( event.keyCode !== undefined ) {
		code = event.keyCode;
	}

	// This shouldn't ever happen but we do it to appease TypeScript
	if ( code === undefined ) {
		return false;
	}

	let isKeyboardNavigation: boolean;

	if ( typeof code === 'string' ) {
		isKeyboardNavigation = keyboardNavigationKeyValues.includes( code );
	} else {
		isKeyboardNavigation = keyboardNavigationKeycodes.includes( code );
	}

	return isKeyboardNavigation;
}

let keyboardNavigation = false;

export default function accessibleFocus(): void {
	document.addEventListener( 'keydown', function ( event ) {
		if ( keyboardNavigation ) {
			return;
		}

		if ( detectKeyboardNavigation( event ) ) {
			keyboardNavigation = true;
			document.documentElement.classList.add( 'accessible-focus' );
		}
	} );
	document.addEventListener( 'mouseup', function () {
		if ( ! keyboardNavigation ) {
			return;
		}
		keyboardNavigation = false;
		document.documentElement.classList.remove( 'accessible-focus' );
	} );
}
