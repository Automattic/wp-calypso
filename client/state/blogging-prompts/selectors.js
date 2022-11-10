import 'calypso/state/blogging-prompts/init';

/**
 * Returns the blogging prompt for the specified site Id.
 *
 * @typedef { import("./types").BloggingPrompt } BloggingPrompt
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {BloggingPrompt | null} blogging prompt
 */
export default function getBloggingPrompt( state, siteId ) {
	return state.bloggingPrompt?.[ siteId ] ?? null;
}
