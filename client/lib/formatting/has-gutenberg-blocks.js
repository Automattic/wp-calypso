/**
 * Returns true if we detect a core Gutenberg comment block
 *
 * @param   {string }   content - html string
 * @returns { boolean } true if we think we found a block
 */
export function hasGutenbergBlocks( content ) {
	return !! content && content.indexOf( '<!-- wp:' ) !== -1;
}
