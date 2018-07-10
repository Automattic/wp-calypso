/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * WordPress dependencies
 */
import { createElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	createTinyMCEElement,
	elementToString,
	domToElement,
	domToString,
} from '../format';

describe( 'createTinyMCEElement', () => {
	const type = 'div';
	const children = <p>Child</p>;

	test( 'should return null', () => {
		const props = {
			'data-mce-bogus': 'all',
		};

		expect( createTinyMCEElement( type, props, children ) ).toBeNull();
	} );

	test( 'should return children', () => {
		const props = {
			'data-mce-bogus': '',
		};

		const wrapper = createTinyMCEElement( type, props, children );
		expect( wrapper ).toEqual( [ children ] );
	} );

	test( 'should render a TinyMCE element', () => {
		const props = {
			'data-prop': 'hi',
		};

		const wrapper = shallow( createTinyMCEElement( type, props, children ) );
		expect( wrapper ).toMatchSnapshot();
	} );
} );

describe( 'elementToString', () => {
	test( 'should return an empty string for null element', () => {
		expect( elementToString( null ) ).toBe( '' );
	} );

	test( 'should return an empty string for an empty array', () => {
		expect( elementToString( [] ) ).toBe( '' );
	} );

	test( 'should return the HTML content ', () => {
		const element = createElement( 'div', { className: 'container' },
			createElement( 'strong', {}, 'content' )
		);
		expect( elementToString( element ) ).toBe( '<div class="container"><strong>content</strong></div>' );
	} );
} );

describe( 'domToElement', () => {
	test( 'should return an empty array', () => {
		expect( domToElement( [] ) ).toEqual( [] );
	} );

	test( 'should return the corresponding element ', () => {
		const domElement = document.createElement( 'div' );
		domElement.innerHTML = '<div class="container"><strong>content</strong></div>';
		expect( domToElement( domElement.childNodes ) ).toMatchSnapshot();
	} );
} );

describe( 'domToString', () => {
	test( 'should return an empty string', () => {
		expect( domToString( [] ) ).toEqual( '' );
	} );

	test( 'should return the HTML ', () => {
		const domElement = document.createElement( 'div' );
		const content = '<div class="container"><strong>content</strong></div>';
		domElement.innerHTML = content;
		expect( domToString( domElement.childNodes ) ).toBe( content );
	} );
} );

