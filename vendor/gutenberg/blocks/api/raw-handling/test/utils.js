/**
 * External dependencies
 */
import { equal } from 'assert';

/**
 * Internal dependencies
 */
import { isEmpty, isPlain, removeInvalidHTML, getPhrasingContentSchema } from '../utils';

describe( 'isEmpty', () => {
	function isEmptyHTML( HTML ) {
		const doc = document.implementation.createHTMLDocument( '' );

		doc.body.innerHTML = HTML;

		return isEmpty( doc.body );
	}

	it( 'should return true for empty element', () => {
		equal( isEmptyHTML( '' ), true );
	} );

	it( 'should return true for element with only whitespace', () => {
		equal( isEmptyHTML( ' ' ), true );
	} );

	it( 'should return true for element with non breaking space', () => {
		equal( isEmptyHTML( '&nbsp;' ), true );
	} );

	it( 'should return true for element with BR', () => {
		equal( isEmptyHTML( '<br>' ), true );
	} );

	it( 'should return true for element with empty element', () => {
		equal( isEmptyHTML( '<em></em>' ), true );
	} );

	it( 'should return false for element with image', () => {
		equal( isEmptyHTML( '<img src="">' ), false );
	} );

	it( 'should return true for element with mixed empty pieces', () => {
		equal( isEmptyHTML( ' <br><br><em>&nbsp; </em>' ), true );
	} );
} );

describe( 'isPlain', () => {
	it( 'should return true for plain text', () => {
		equal( isPlain( 'test' ), true );
	} );

	it( 'should return true for only line breaks', () => {
		equal( isPlain( 'test<br>test' ), true );
		equal( isPlain( 'test<br/>test' ), true );
		equal( isPlain( 'test<br />test' ), true );
		equal( isPlain( 'test<br data-test>test' ), true );
	} );

	it( 'should return false for formatted text', () => {
		equal( isPlain( '<strong>test</strong>' ), false );
		equal( isPlain( '<strong>test<br></strong>' ), false );
		equal( isPlain( 'test<br-custom>test' ), false );
	} );
} );

describe( 'removeInvalidHTML', () => {
	const phrasingContentSchema = getPhrasingContentSchema();
	const schema = {
		p: {
			children: phrasingContentSchema,
		},
		figure: {
			require: [ 'img' ],
			children: {
				img: {
					attributes: [ 'src', 'alt' ],
					classes: [ 'alignleft' ],
				},
				figcaption: {
					children: phrasingContentSchema,
				},
			},
		},
		...phrasingContentSchema,
	};

	it( 'should leave plain text alone', () => {
		const input = 'test';
		equal( removeInvalidHTML( input, schema ), input );
	} );

	it( 'should leave valid phrasing content alone', () => {
		const input = '<strong>test</strong>';
		equal( removeInvalidHTML( input, schema ), input );
	} );

	it( 'should remove unrecognised tags from phrasing content', () => {
		const input = '<strong><div>test</div></strong>';
		const output = '<strong>test</strong>';
		equal( removeInvalidHTML( input, schema ), output );
	} );

	it( 'should remove unwanted whitespace outside phrasing content', () => {
		const input = '<figure><img src=""> </figure>';
		const output = '<figure><img src=""></figure>';
		equal( removeInvalidHTML( input, schema ), output );
	} );

	it( 'should remove attributes', () => {
		const input = '<p class="test">test</p>';
		const output = '<p>test</p>';
		equal( removeInvalidHTML( input, schema ), output );
	} );

	it( 'should remove multiple attributes', () => {
		const input = '<p class="test" id="test">test</p>';
		const output = '<p>test</p>';
		equal( removeInvalidHTML( input, schema ), output );
	} );

	it( 'should deep remove attributes', () => {
		const input = '<p class="test">test <em id="test">test</em></p>';
		const output = '<p>test <em>test</em></p>';
		equal( removeInvalidHTML( input, schema ), output );
	} );

	it( 'should remove data-* attributes', () => {
		const input = '<p data-reactid="1">test</p>';
		const output = '<p>test</p>';
		equal( removeInvalidHTML( input, schema ), output );
	} );

	it( 'should keep some attributes', () => {
		const input = '<a href="#keep">test</a>';
		const output = '<a href="#keep">test</a>';
		equal( removeInvalidHTML( input, schema ), output );
	} );

	it( 'should keep some classes', () => {
		const input = '<figure><img class="alignleft test" src=""></figure>';
		const output = '<figure><img class="alignleft" src=""></figure>';
		equal( removeInvalidHTML( input, schema ), output );
	} );

	it( 'should remove empty nodes that should have children', () => {
		const input = '<figure> </figure>';
		const output = '';
		equal( removeInvalidHTML( input, schema ), output );
	} );

	it( 'should break up block content with phrasing schema', () => {
		const input = '<p>test</p><p>test</p>';
		const output = 'test<br>test';
		equal( removeInvalidHTML( input, phrasingContentSchema, true ), output );
	} );

	it( 'should unwrap node that does not satisfy require', () => {
		const input = '<figure><p>test</p><figcaption>test</figcaption></figure>';
		const output = '<p>test</p>test';
		equal( removeInvalidHTML( input, schema ), output );
	} );
} );
