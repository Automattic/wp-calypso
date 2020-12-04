/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/inline-help/init';

/**
 * Returns a bool indicating if the contact form UI is showing the Q&A suggestions.
 *
 * @param  {object}  state  Global state tree
 * @returns {boolean}       Is the contact form UI showing the questions
 */
export default function isShowingQandAInlineHelpContactForm( state ) {
	return get( state, 'inlineHelp.contactForm.isShowingQandASuggestions', false );
}
