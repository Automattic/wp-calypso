/**
 * Parse Markdown into Blocks
 *
 * Based on code from Streamdown (https://github.com/vercel/streamdown)
 * Copyright 2023 Vercel, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Modifications:
 * - Changed to use dynamic imports for optional marked dependency
 * - Made function async to handle dynamic import
 * - Added lazy loading pattern for marked module
 * - Adapted for use in agenttic-client
 */

// Dynamic import to handle optional marked dependency
// Lazy load marked when first needed
let markedModule: any = null;
async function getMarked() {
	if ( ! markedModule ) {
		markedModule = await import( 'marked' );
	}
	return markedModule;
}

export const parseMarkdownIntoBlocks = async ( markdown: string ): Promise< string[] > => {
	const marked = await getMarked();
	const tokens = marked.Lexer.lex( markdown, { gfm: true } );
	const blocks = tokens.map( ( token: any ) => token.raw );

	// Post-process to merge consecutive blocks that are part of the same math block
	const mergedBlocks: string[] = [];

	for ( const currentBlock of blocks ) {
		// Check if this is a standalone $$ that might be a closing delimiter
		if ( currentBlock.trim() === '$$' && mergedBlocks.length > 0 ) {
			const previousBlock = mergedBlocks.at( -1 );

			if ( ! previousBlock ) {
				continue;
			}

			// Check if the previous block starts with $$ but doesn't end with $$
			const prevStartsWith$$ = previousBlock.trimStart().startsWith( '$$' );
			const prevDollarCount = ( previousBlock.match( /\$\$/g ) || [] ).length;

			// If previous block has odd number of $$ and starts with $$, merge them
			if ( prevStartsWith$$ && prevDollarCount % 2 === 1 ) {
				mergedBlocks[ mergedBlocks.length - 1 ] = previousBlock + currentBlock;
				continue;
			}
		}

		// Check if current block ends with $$ and previous block started with $$ but didn't close
		if ( mergedBlocks.length > 0 && currentBlock.trimEnd().endsWith( '$$' ) ) {
			const previousBlock = mergedBlocks.at( -1 );

			if ( ! previousBlock ) {
				continue;
			}

			const prevStartsWith$$ = previousBlock.trimStart().startsWith( '$$' );
			const prevDollarCount = ( previousBlock.match( /\$\$/g ) || [] ).length;
			const currDollarCount = ( currentBlock.match( /\$\$/g ) || [] ).length;

			// If previous block has unclosed math (odd $$) and current block ends with $$
			// AND current block doesn't start with $$, it's likely a continuation
			if (
				prevStartsWith$$ &&
				prevDollarCount % 2 === 1 &&
				! currentBlock.trimStart().startsWith( '$$' ) &&
				currDollarCount === 1
			) {
				mergedBlocks[ mergedBlocks.length - 1 ] = previousBlock + currentBlock;
				continue;
			}
		}

		mergedBlocks.push( currentBlock );
	}

	return mergedBlocks;
};
