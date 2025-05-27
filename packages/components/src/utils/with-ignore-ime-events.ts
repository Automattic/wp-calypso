// Copied from @wordpress/components

/**
 * A higher-order function that wraps a keydown event handler to ensure it is not an IME event.
 *
 * In CJK languages, an IME (Input Method Editor) is used to input complex characters.
 * During an IME composition, keydown events (e.g. Enter or Escape) can be fired
 * which are intended to control the IME and not the application.
 * These events should be ignored by any application logic.
 * @param keydownHandler The keydown event handler to execute after ensuring it was not an IME event.
 * @returns A wrapped version of the given event handler that ignores IME events.
 */
export function withIgnoreIMEEvents< E extends React.KeyboardEvent | KeyboardEvent >(
	keydownHandler: ( event: E ) => void
) {
	return ( event: E ) => {
		const { isComposing } = 'nativeEvent' in event ? event.nativeEvent : event;

		if (
			isComposing ||
			// Workaround for Mac Safari where the final Enter/Backspace of an IME composition
			// is `isComposing=false`, even though it's technically still part of the composition.
			// These can only be detected by keyCode.
			event.keyCode === 229
		) {
			return;
		}

		keydownHandler( event );
	};
}
