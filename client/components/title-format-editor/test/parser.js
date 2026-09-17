import { Modifier, SelectionState } from 'draft-js';
import { fromEditor, toEditor } from '../parser';

describe( 'title format editor parser', () => {
	test( 'round-trips text and token entities through Draft.js', () => {
		const format = [
			{ type: 'postTitle' },
			{ type: 'string', value: ' | ' },
			{ type: 'siteName' },
		];
		const tokens = {
			postTitle: 'Post Title',
			siteName: 'Site Name',
		};

		expect( fromEditor( toEditor( format, tokens ) ) ).toEqual( format );
	} );

	test( 'supports text, paste, and token removal operations', () => {
		const tokens = { siteName: 'Site Name' };
		const content = toEditor(
			[ { type: 'string', value: 'Hello' }, { type: 'siteName' } ],
			tokens
		);
		const block = content.getFirstBlock();
		const textEnd = SelectionState.createEmpty( block.getKey() ).merge( {
			anchorOffset: 5,
			focusOffset: 5,
		} );
		const fragment = toEditor( [ { type: 'string', value: ' world' } ], {} ).getBlockMap();
		const withPaste = Modifier.replaceWithFragment( content, textEnd, fragment );
		const tokenStart = 11;
		const tokenEnd = withPaste.getFirstBlock().getLength();
		const tokenRange = SelectionState.createEmpty( block.getKey() ).merge( {
			anchorOffset: tokenStart,
			focusOffset: tokenEnd,
		} );

		expect( fromEditor( Modifier.removeRange( withPaste, tokenRange, 'forward' ) ) ).toEqual( [
			{ type: 'string', value: 'Hello world' },
		] );
	} );
} );
