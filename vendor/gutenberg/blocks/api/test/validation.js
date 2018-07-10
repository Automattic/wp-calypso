/**
 * Internal dependencies
 */
import {
	getTextPiecesSplitOnWhitespace,
	getTextWithCollapsedWhitespace,
	getMeaningfulAttributePairs,
	isEqualTextTokensWithCollapsedWhitespace,
	getNormalizedStyleValue,
	getStyleProperties,
	isEqualAttributesOfName,
	isEqualTagAttributePairs,
	isEqualTokensOfType,
	getNextNonWhitespaceToken,
	isEquivalentHTML,
	isValidBlock,
} from '../validation';
import {
	registerBlockType,
	unregisterBlockType,
	getBlockTypes,
	getBlockType,
	setUnknownTypeHandlerName,
} from '../registration';

describe( 'validation', () => {
	const defaultBlockSettings = {
		save: ( { attributes } ) => attributes.fruit,
		category: 'common',
		title: 'block title',
	};
	beforeAll( () => {
		// Initialize the block store
		require( '../../store' );
	} );

	afterEach( () => {
		setUnknownTypeHandlerName( undefined );
		getBlockTypes().forEach( ( block ) => {
			unregisterBlockType( block.name );
		} );
	} );

	describe( 'getTextPiecesSplitOnWhitespace()', () => {
		it( 'returns text pieces spilt on whitespace', () => {
			const pieces = getTextPiecesSplitOnWhitespace( '  a \t  b \n c' );

			expect( pieces ).toEqual( [ 'a', 'b', 'c' ] );
		} );
	} );

	describe( 'getTextWithCollapsedWhitespace()', () => {
		it( 'returns text with collapsed whitespace', () => {
			const pieces = getTextWithCollapsedWhitespace( '  a \t  b \n c' );

			expect( pieces ).toBe( 'a b c' );
		} );
	} );

	describe( 'getMeaningfulAttributePairs()', () => {
		it( 'returns with non-empty attributes', () => {
			const pairs = getMeaningfulAttributePairs( {
				attributes: [ [ 'class', 'a' ] ],
			} );

			expect( pairs ).toEqual( [ [ 'class', 'a' ] ] );
		} );

		it( 'returns without empty non-boolean, non-enumerated attributes', () => {
			const pairs = getMeaningfulAttributePairs( {
				attributes: [ [ 'class', '' ] ],
			} );

			expect( pairs ).toEqual( [] );
		} );

		it( 'returns with empty boolean attributes', () => {
			const pairs = getMeaningfulAttributePairs( {
				attributes: [ [ 'disabled', '' ] ],
			} );

			expect( pairs ).toEqual( [ [ 'disabled', '' ] ] );
		} );

		it( 'returns with empty enumerated attributes', () => {
			const pairs = getMeaningfulAttributePairs( {
				attributes: [ [ 'contenteditable', '' ] ],
			} );

			expect( pairs ).toEqual( [ [ 'contenteditable', '' ] ] );
		} );

		it( 'returns with empty data- attributes', () => {
			const pairs = getMeaningfulAttributePairs( {
				attributes: [ [ 'data-foo', '' ] ],
			} );

			expect( pairs ).toEqual( [ [ 'data-foo', '' ] ] );
		} );
	} );

	describe( 'isEqualTextTokensWithCollapsedWhitespace()', () => {
		it( 'should return false if not equal with collapsed whitespace', () => {
			const isEqual = isEqualTextTokensWithCollapsedWhitespace(
				{ chars: '  a \t  b \n c' },
				{ chars: 'a \n c \t b  ' },
			);

			expect( console ).toHaveWarned();
			expect( isEqual ).toBe( false );
		} );

		it( 'should return true if equal with collapsed whitespace', () => {
			const isEqual = isEqualTextTokensWithCollapsedWhitespace(
				{ chars: '  a \t  b \n c' },
				{ chars: 'a \n b \t c  ' },
			);

			expect( isEqual ).toBe( true );
		} );
	} );

	describe( 'getNormalizedStyleValue()', () => {
		it( 'omits whitespace and quotes from url value', () => {
			const normalizedValue = getNormalizedStyleValue(
				'url( "https://wordpress.org/img.png" )'
			);

			expect( normalizedValue ).toBe( 'url(https://wordpress.org/img.png)' );
		} );
	} );

	describe( 'getStyleProperties()', () => {
		it( 'returns style property pairs', () => {
			const pairs = getStyleProperties(
				'background-image: url( "https://wordpress.org/img.png" ); color: red;'
			);

			expect( pairs ).toEqual( {
				'background-image': 'url(https://wordpress.org/img.png)',
				color: 'red',
			} );
		} );
	} );

	describe( 'isEqualAttributesOfName', () => {
		describe( '.class()', () => {
			it( 'ignores ordering', () => {
				const isEqual = isEqualAttributesOfName.class(
					'a b c',
					'b a c',
				);

				expect( isEqual ).toBe( true );
			} );

			it( 'ignores whitespace', () => {
				const isEqual = isEqualAttributesOfName.class(
					'a  b    c',
					'b   a c',
				);

				expect( isEqual ).toBe( true );
			} );

			it( 'returns false if not equal', () => {
				const isEqual = isEqualAttributesOfName.class(
					'a b c',
					'b a c d',
				);

				expect( isEqual ).toBe( false );
			} );
		} );

		describe( '.style()', () => {
			it( 'returns true if the same style', () => {
				const isEqual = isEqualAttributesOfName.style(
					'background-image: url( "https://wordpress.org/img.png" ); color: red;',
					'color: red;   background-image: url(\'https://wordpress.org/img.png\n);'
				);

				expect( isEqual ).toBe( true );
			} );

			it( 'returns false if not same style', () => {
				const isEqual = isEqualAttributesOfName.style(
					'background-image: url( "https://wordpress.org/img.png" ); color: red;',
					'color: red;  font-size: 13px; background-image: url(\'https://wordpress.org/img.png\');'
				);

				expect( isEqual ).toBe( false );
			} );
		} );

		describe( 'boolean attributes', () => {
			it( 'returns true if both present', () => {
				const isEqual = isEqualAttributesOfName.controls(
					'true',
					''
				);

				expect( isEqual ).toBe( true );
			} );
		} );
	} );

	describe( 'isEqualTagAttributePairs()', () => {
		it( 'returns false if not equal pairs', () => {
			const isEqual = isEqualTagAttributePairs(
				[
					[ 'class', 'b   a c' ],
				],
				[
					[ 'class', 'c  a b' ],
					[ 'style', 'background-image: url( "https://wordpress.org/img.png" ); color: red;' ],
				]
			);

			expect( console ).toHaveWarned();
			expect( isEqual ).toBe( false );
		} );

		it( 'returns true if equal pairs', () => {
			const isEqual = isEqualTagAttributePairs(
				[
					[ 'class', 'b   a c' ],
					[ 'style', 'color: red;  background-image: url( "https://wordpress.org/img.png" );' ],
					[ 'controls', '' ],
				],
				[
					[ 'class', 'c  a b' ],
					[ 'style', 'background-image: url( "https://wordpress.org/img.png" ); color: red;' ],
					[ 'controls', 'true' ],
				]
			);

			expect( isEqual ).toBe( true );
		} );
	} );

	describe( 'isEqualTokensOfType', () => {
		describe( '.StartTag()', () => {
			it( 'returns false if tag name not the same', () => {
				const isEqual = isEqualTokensOfType.StartTag(
					{ tagName: 'p' },
					{ tagName: 'section' }
				);

				expect( console ).toHaveWarned();
				expect( isEqual ).toBe( false );
			} );

			it( 'returns false if tag name the same but attributes not', () => {
				const isEqual = isEqualTokensOfType.StartTag(
					{
						tagName: 'p',
						attributes: [
							[ 'class', 'b   a c' ],
						],
					},
					{
						tagName: 'p',
						attributes: [
							[ 'class', 'c  a b' ],
							[ 'style', 'background-image: url( "https://wordpress.org/img.png" ); color: red;' ],
						],
					}
				);

				expect( console ).toHaveWarned();
				expect( isEqual ).toBe( false );
			} );

			it( 'returns true if tag name the same and attributes the same', () => {
				const isEqual = isEqualTokensOfType.StartTag(
					{
						tagName: 'p',
						attributes: [
							[ 'class', 'b   a c' ],
							[ 'style', 'color: red;  background-image: url( "https://wordpress.org/img.png" );' ],
						],
					},
					{
						tagName: 'p',
						attributes: [
							[ 'class', 'c  a b' ],
							[ 'style', 'background-image: url( "https://wordpress.org/img.png" ); color: red;' ],
						],
					}
				);

				expect( isEqual ).toBe( true );
			} );
		} );
	} );

	describe( 'getNextNonWhitespaceToken()', () => {
		it( 'returns the next non-whitespace token, mutating array', () => {
			const tokens = [
				{ type: 'Chars', chars: '   \n\t' },
				{ type: 'StartTag', tagName: 'p' },
			];

			const token = getNextNonWhitespaceToken( tokens );

			expect( token ).toEqual( { type: 'StartTag', tagName: 'p' } );
			expect( tokens ).toHaveLength( 0 );
		} );

		it( 'returns undefined if token options exhausted', () => {
			const tokens = [
				{ type: 'Chars', chars: '   \n\t' },
			];

			const token = getNextNonWhitespaceToken( tokens );

			expect( token ).toBeUndefined();
			expect( tokens ).toHaveLength( 0 );
		} );
	} );

	describe( 'isEquivalentHTML()', () => {
		it( 'should return false for effectively inequivalent html', () => {
			const isEquivalent = isEquivalentHTML(
				'<div>Hello <span class="b">World!</span></div>',
				'<div>Hello <span class="a">World!</span></div>'
			);

			expect( console ).toHaveWarned();
			expect( isEquivalent ).toBe( false );
		} );

		it( 'should return true for effectively equivalent html', () => {
			const isEquivalent = isEquivalentHTML(
				'<div>&quot; Hello<span   class="b a" id="foo"> World!</  span>  "</div>',
				'<div  >" Hello\n<span id="foo" class="a  b">World!</span>"</div>'
			);

			expect( isEquivalent ).toBe( true );
		} );

		it( 'should return false when more tokens in first', () => {
			const isEquivalent = isEquivalentHTML(
				'<div>Hello</div>',
				'<div>Hello'
			);

			expect( console ).toHaveWarned();
			expect( isEquivalent ).toBe( false );
		} );

		it( 'should return false when more tokens in second', () => {
			const isEquivalent = isEquivalentHTML(
				'<div>Hello',
				'<div>Hello</div>'
			);

			expect( console ).toHaveWarned();
			expect( isEquivalent ).toBe( false );
		} );

		it( 'should return true when first has trailing whitespace', () => {
			const isEquivalent = isEquivalentHTML(
				'<div>Hello</div>  ',
				'<div>Hello</div>'
			);

			expect( isEquivalent ).toBe( true );
		} );

		it( 'should return true when second has trailing whitespace', () => {
			const isEquivalent = isEquivalentHTML(
				'<div>Hello</div>',
				'<div>Hello</div>  '
			);

			expect( isEquivalent ).toBe( true );
		} );

		it( 'should return true when difference of empty non-boolean, non-enumerated attribute', () => {
			const isEquivalent = isEquivalentHTML(
				'<div class="">Hello</div>',
				'<div>Hello</div>'
			);

			expect( isEquivalent ).toBe( true );
		} );

		it( 'should return false when difference of empty boolean attribute', () => {
			const isEquivalent = isEquivalentHTML(
				'<input disabled>',
				'<input>'
			);

			expect( console ).toHaveWarned();
			expect( isEquivalent ).toBe( false );
		} );

		it( 'should return false when difference of empty enumerated attribute', () => {
			const isEquivalent = isEquivalentHTML(
				'<div contenteditable>',
				'<div>'
			);

			expect( console ).toHaveWarned();
			expect( isEquivalent ).toBe( false );
		} );

		it( 'should return false when difference of data- attribute', () => {
			const isEquivalent = isEquivalentHTML(
				'<div data-foo>',
				'<div>'
			);

			expect( console ).toHaveWarned();
			expect( isEquivalent ).toBe( false );
		} );

		it( 'should return false when difference of boolean attribute', () => {
			const isEquivalent = isEquivalentHTML(
				'<video controls></video>',
				'<video></video>'
			);

			expect( console ).toHaveWarned();
			expect( isEquivalent ).toBe( false );
		} );

		it( 'should return true when same boolean attribute', () => {
			const isEquivalent = isEquivalentHTML(
				'<video controls></video>',
				'<video controls></video>'
			);

			expect( isEquivalent ).toBe( true );
		} );

		it( 'should return true when effectively same boolean attribute', () => {
			const isEquivalent = isEquivalentHTML(
				'<video controls></video>',
				'<video controls=""></video>'
			);

			expect( isEquivalent ).toBe( true );
		} );
	} );

	describe( 'isValidBlock()', () => {
		it( 'returns false if block is not valid', () => {
			registerBlockType( 'core/test-block', defaultBlockSettings );

			const isValid = isValidBlock(
				'Apples',
				getBlockType( 'core/test-block' ),
				{ fruit: 'Bananas' }
			);

			expect( console ).toHaveWarned();
			expect( console ).toHaveErrored();
			expect( isValid ).toBe( false );
		} );

		it( 'returns false if error occurs while generating block save', () => {
			registerBlockType( 'core/test-block', {
				...defaultBlockSettings,
				save() {
					throw new Error();
				},
			} );

			const isValid = isValidBlock(
				'Bananas',
				getBlockType( 'core/test-block' ),
				{ fruit: 'Bananas' }
			);

			expect( console ).toHaveErrored();
			expect( isValid ).toBe( false );
		} );

		it( 'returns true is block is valid', () => {
			registerBlockType( 'core/test-block', defaultBlockSettings );

			const isValid = isValidBlock(
				'Bananas',
				getBlockType( 'core/test-block' ),
				{ fruit: 'Bananas' }
			);

			expect( isValid ).toBe( true );
		} );
	} );
} );
