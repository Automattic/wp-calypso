/**
 * Internal dependencies
 */
import 'calypso/state/help/init';

/**
 * Tells whether the user has asked a question through the Directly RTM widget.
 *
 *
 *
 * @see lib/directly for more about Directly
 * @param {object}  state  Global state tree
 * @returns {boolean}        Whether a question has been asked
 */
export default function hasUserAskedADirectlyQuestion( state ) {
	return state.help.directly.questionAsked !== null;
}
