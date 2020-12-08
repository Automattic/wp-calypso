/**
 * Internal dependencies
 */
import 'calypso/state/inline-help/init';

/**
 * Returns a bool indicating if the inline help ui should be visibile
 * or not. Note this is not hiding the popover. This means the UI will be
 * hidden entirely.
 *
 * @param  {object}  state  Global app state
 * @returns {boolean}        Is the inline help UI showing.
 */
export default function isInlineHelpVisible( state ) {
	return state?.inlineHelp?.ui?.isVisible ?? true;
}
