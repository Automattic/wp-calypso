import {
	LEGACY_CSS_END,
	LEGACY_CSS_START,
	findLegacyBlocks,
	findLegacyBlocksInStylesValue,
} from '../legacy-style-variation-css';

const makeBlock = ( body: string ) => `${ LEGACY_CSS_START }\n${ body }\n${ LEGACY_CSS_END }`;

describe( 'findLegacyBlocks', () => {
	it( 'finds a block and absorbs the leading whitespace', () => {
		const blockText = makeBlock( 'h1 {font-family:x !important;}' );
		const css = `body { color: red; }\n\n${ blockText }`;

		const blocks = findLegacyBlocks( css );

		expect( blocks ).toHaveLength( 1 );
		expect( blocks[ 0 ].text ).toBe( blockText );
		expect( css.slice( blocks[ 0 ].start, blocks[ 0 ].end ).trim() ).toBe( blockText );
	} );

	it( 'returns sequential non-overlapping blocks in document order', () => {
		const css = `${ makeBlock( 'a {}' ) }\n.mine {}\n${ makeBlock( 'b {}' ) }`;

		const blocks = findLegacyBlocks( css );

		expect( blocks ).toHaveLength( 2 );
		expect( blocks[ 0 ].end ).toBeLessThanOrEqual( blocks[ 1 ].start );
	} );

	it.each( [
		[ 'there are no markers', 'body { color: red; }' ],
		[ 'the start marker is orphaned', `${ LEGACY_CSS_START }\nh1 {}` ],
		[ 'the css is empty', '' ],
	] )( 'finds nothing when %s', ( _case, css ) => {
		expect( findLegacyBlocks( css ) ).toEqual( [] );
	} );
} );

describe( 'findLegacyBlocksInStylesValue', () => {
	it.each( [
		[ 'a bare string', makeBlock( 'h1 {}' ), 1 ],
		[ 'a `{ css }` object', { css: makeBlock( 'h1 {}' ) }, 1 ],
		[ 'an unrecognised shape', { style: 'nope' }, 0 ],
		[ 'undefined', undefined, 0 ],
	] )( 'reads %s', ( _case, value, expectedCount ) => {
		expect( findLegacyBlocksInStylesValue( value ) ).toHaveLength( expectedCount );
	} );
} );
