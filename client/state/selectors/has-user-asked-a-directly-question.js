/** @format */
/**
 * Tells whether the user has asked a question through the Directly RTM widget.
 *
 * @see lib/directly for more about Directly
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean}        Whether a question has been asked
 */

export default function hasUserAskedADirectlyQuestion( state ) {
	return state.help.directly.questionAsked !== null;
}
