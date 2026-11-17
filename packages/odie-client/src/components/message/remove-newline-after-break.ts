type HastNode = {
	type: string;
	tagName?: string;
	value?: string;
	children?: HastNode[];
};

/**
 * Rehype plugin: react-markdown renders a hard break (a line ending in two spaces or a
 * backslash) as `<br>` followed by a newline. User messages show newlines
 * (`white-space: pre-line`), so that newline would add a blank line after the break.
 */
export const removeNewlineAfterBreak = () => ( tree: HastNode ) => {
	const visit = ( node: HastNode ) => {
		node.children?.forEach( ( child, index, siblings ) => {
			const next = siblings[ index + 1 ];
			if (
				child.type === 'element' &&
				child.tagName === 'br' &&
				next?.type === 'text' &&
				next.value?.startsWith( '\n' )
			) {
				next.value = next.value.slice( 1 );
			}
			visit( child );
		} );
	};
	visit( tree );
};
