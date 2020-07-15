/**
 * Internal dependencies
 */
import React from 'react';
import { Facebook, Twitter, Reader, Search } from '../src';
import { shallow } from 'enzyme';

const DUMMY_IMAGE_SRC = 'https://wordpress.com/someimagehere';

describe( 'Facebook previews', () => {
	it( 'should expose a Facebook preview component', () => {
		expect( Facebook ).not.toBe( undefined );
	} );

	it( 'should render image only when provided', () => {
		const wrapperNoImage = shallow( <Facebook /> );
		const wrapperWithImage = shallow( <Facebook image={ DUMMY_IMAGE_SRC } /> );

		// No image
		expect( wrapperNoImage.find( 'img[alt="Facebook Preview Thumbnail"]' ).exists() ).toBeFalsy();

		// Has image
		const imageEl = wrapperWithImage.find( 'img[alt="Facebook Preview Thumbnail"]' );
		expect( imageEl.exists() ).toBeTruthy();
		expect( imageEl.html() ).toContain( `src="${ DUMMY_IMAGE_SRC }"` );
	} );
} );

describe( 'Twitter previews', () => {
	it( 'should expose a Twitter preview component', () => {
		expect( Twitter ).not.toBe( undefined );
	} );
} );

describe( 'Search previews', () => {
	it( 'should expose a Search preview component', () => {
		expect( Search ).not.toBe( undefined );
	} );
} );

/* eslint-disable jest/no-disabled-tests */
describe.skip( 'Reader previews', () => {
	it( 'should expose a Reader preview component', () => {
		expect( Reader ).not.toBe( undefined );
	} );
} );
/* eslint-enable jest/no-disabled-tests */
