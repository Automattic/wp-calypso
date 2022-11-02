import 'calypso/state/writing-prompts/init';

/**
 * Returns the writing prompt for the specified site Id.
 *
 * @typedef { import("./types").WritingPrompt } WritingPrompt
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {WritingPrompt | null} writing prompt
 */
export default function getWritingPrompt( state, siteId ) {
	return state.writingPrompt?.[ siteId ] ?? null;
}
