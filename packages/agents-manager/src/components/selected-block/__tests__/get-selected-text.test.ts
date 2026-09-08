/**
 * @jest-environment jsdom
 */
import { getAttributePlainText, getSelectedTextContext } from '../get-selected-text';

jest.mock( '@wordpress/block-editor', () => ( {
	store: 'core/block-editor',
} ) );

const mockGetSelectionStart = jest.fn();
const mockGetSelectionEnd = jest.fn();
const mockGetBlockAttributes = jest.fn();

const select = () => ( {
	getSelectionStart: () => mockGetSelectionStart(),
	getSelectionEnd: () => mockGetSelectionEnd(),
	getBlockAttributes: ( clientId: string ) => mockGetBlockAttributes( clientId ),
} );

describe( 'getAttributePlainText', () => {
	it( 'returns the text of a rich-text object', () => {
		expect( getAttributePlainText( { text: 'Hello world' } ) ).toBe( 'Hello world' );
	} );

	it( 'strips markup from an HTML string and keeps <br> as newline', () => {
		expect( getAttributePlainText( 'Hello <strong>bold</strong><br>world' ) ).toBe(
			'Hello bold\nworld'
		);
	} );

	it( 'returns null for non-text values', () => {
		expect( getAttributePlainText( 42 ) ).toBeNull();
		expect( getAttributePlainText( { url: 'x' } ) ).toBeNull();
		expect( getAttributePlainText( undefined ) ).toBeNull();
	} );
} );

describe( 'getSelectedTextContext', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetBlockAttributes.mockReturnValue( {
			content: { text: 'Welcome to our new product page' },
		} );
	} );

	const point = ( offset: number ) => ( {
		clientId: 'block-1',
		attributeKey: 'content',
		offset,
	} );

	it( 'returns the selected range', () => {
		mockGetSelectionStart.mockReturnValue( point( 15 ) );
		mockGetSelectionEnd.mockReturnValue( point( 26 ) );

		expect( getSelectedTextContext( select ) ).toEqual( {
			text: 'new product',
			attributeKey: 'content',
			start: 15,
			end: 26,
		} );
	} );

	it( 'normalizes a backwards selection', () => {
		mockGetSelectionStart.mockReturnValue( point( 26 ) );
		mockGetSelectionEnd.mockReturnValue( point( 15 ) );

		expect( getSelectedTextContext( select ) ).toMatchObject( {
			text: 'new product',
			start: 15,
			end: 26,
		} );
	} );

	it( 'returns null for a caret (equal offsets)', () => {
		mockGetSelectionStart.mockReturnValue( point( 5 ) );
		mockGetSelectionEnd.mockReturnValue( point( 5 ) );

		expect( getSelectedTextContext( select ) ).toBeNull();
	} );

	it( 'returns null when the selection spans two blocks', () => {
		mockGetSelectionStart.mockReturnValue( point( 2 ) );
		mockGetSelectionEnd.mockReturnValue( {
			...point( 8 ),
			clientId: 'block-2',
		} );

		expect( getSelectedTextContext( select ) ).toBeNull();
	} );

	it( 'returns null when the selection spans two attributes of one block', () => {
		mockGetSelectionStart.mockReturnValue( point( 2 ) );
		mockGetSelectionEnd.mockReturnValue( {
			...point( 8 ),
			attributeKey: 'citation',
		} );

		expect( getSelectedTextContext( select ) ).toBeNull();
	} );

	it( 'returns null for a block-level selection (no attributeKey)', () => {
		mockGetSelectionStart.mockReturnValue( { clientId: 'block-1' } );
		mockGetSelectionEnd.mockReturnValue( { clientId: 'block-1' } );

		expect( getSelectedTextContext( select ) ).toBeNull();
	} );

	it( 'reads HTML string attributes', () => {
		mockGetBlockAttributes.mockReturnValue( {
			content: 'Welcome to <em>our new product</em> page',
		} );
		mockGetSelectionStart.mockReturnValue( point( 11 ) );
		mockGetSelectionEnd.mockReturnValue( point( 26 ) );

		expect( getSelectedTextContext( select ) ).toMatchObject( {
			text: 'our new product',
		} );
	} );

	it( 'drops inline-object placeholders from the text but keeps their offsets', () => {
		// "\ufffc" is what rich-text stores for an inline image / footnote.
		mockGetBlockAttributes.mockReturnValue( {
			content: { text: 'Welcome \ufffcto our new product page' },
		} );
		mockGetSelectionStart.mockReturnValue( point( 0 ) );
		mockGetSelectionEnd.mockReturnValue( point( 16 ) );

		expect( getSelectedTextContext( select ) ).toEqual( {
			text: 'Welcome to our ',
			attributeKey: 'content',
			start: 0,
			end: 16,
		} );
	} );

	it( 'returns null when only an inline object is selected', () => {
		mockGetBlockAttributes.mockReturnValue( {
			content: { text: 'Welcome \ufffcto our new product page' },
		} );
		mockGetSelectionStart.mockReturnValue( point( 8 ) );
		mockGetSelectionEnd.mockReturnValue( point( 9 ) );

		expect( getSelectedTextContext( select ) ).toBeNull();
	} );

	it( 'returns null when the attribute is not text-like', () => {
		mockGetBlockAttributes.mockReturnValue( { content: undefined } );
		mockGetSelectionStart.mockReturnValue( point( 0 ) );
		mockGetSelectionEnd.mockReturnValue( point( 4 ) );

		expect( getSelectedTextContext( select ) ).toBeNull();
	} );
} );
