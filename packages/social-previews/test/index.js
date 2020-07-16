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

	it( 'should display a (hard) truncated title', () => {
		const wrapper = shallow(
			<Facebook title="I am the very model of a modern Major-General, I've information vegetable, animal, and mineral." />
		);

		const titleEl = wrapper.find( '.facebook-preview__title' );
		expect( titleEl.exists() ).toBeTruthy();
		expect( titleEl.text() ).toEqual(
			"I am the very model of a modern Major-General, I've information vegetable, anima…"
		);
		const titleTextNoEllipsis = titleEl.text().replace( '…', '' );
		expect( titleTextNoEllipsis ).toHaveLength( 80 );
	} );

	it( 'should display a (hard) truncated description', () => {
		const wrapper = shallow(
			<Facebook description="I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
		);

		const descEl = wrapper.find( '.facebook-preview__description' );
		expect( descEl.exists() ).toBeTruthy();
		expect( descEl.text() ).toEqual(
			"I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both …"
		);

		const descTextNoEllipsis = descEl.text().replace( '…', '' );
		expect( descTextNoEllipsis ).toHaveLength( 200 );
	} );

	it( 'should display image only when provided', () => {
		const wrapperNoImage = shallow( <Facebook /> );
		const wrapperWithImage = shallow( <Facebook image={ DUMMY_IMAGE_SRC } /> );

		// No image
		expect( wrapperNoImage.find( 'img[alt="Facebook Preview Thumbnail"]' ).exists() ).toBeFalsy();

		// Has image
		const imageEl = wrapperWithImage.find( 'img[alt="Facebook Preview Thumbnail"]' );
		expect( imageEl.exists() ).toBeTruthy();
		expect( imageEl.html() ).toContain( `src="${ DUMMY_IMAGE_SRC }"` );
	} );

	describe( 'Preview url display', () => {
		it( 'should display a protocol-less url and author if provided', () => {
			const wrapper = shallow( <Facebook url="https://wordpress.com" author="Jane Doe" /> );

			const urlEl = wrapper.find( '.facebook-preview__url' );
			expect( urlEl.exists() ).toBeTruthy();
			expect( urlEl.text() ).toEqual( 'wordpress.com | Jane Doe' );
		} );

		it( 'should display a protocol-less url only (with no separator) when author is not provided', () => {
			const wrapper = shallow( <Facebook url="https://wordpress.com" /> );

			const urlEl = wrapper.find( '.facebook-preview__url' );
			expect( urlEl.exists() ).toBeTruthy();
			expect( urlEl.text() ).toEqual( 'wordpress.com' );
			expect( urlEl.text() ).not.toContain( '|' );
		} );

		it( 'should display the author only (with no separator) when a url is not provided', () => {
			const wrapper = shallow( <Facebook author="Jane Doe" /> );

			const urlEl = wrapper.find( '.facebook-preview__url' );
			expect( urlEl.exists() ).toBeTruthy();
			expect( urlEl.text() ).toEqual( 'Jane Doe' );
			expect( urlEl.text() ).not.toContain( '|' );
		} );
	} );

	describe( 'Styling hooks', () => {
		it( 'should append a classname with the correct "type" to the root element when provided', () => {
			const wrapper = shallow( <Facebook type="article" /> );

			const rootEl = wrapper.find( '.facebook-preview' );

			expect( rootEl.hasClass( 'facebook-preview__article' ) ).toBeTruthy();
		} );
	} );
} );

describe( 'Twitter previews', () => {
	it( 'should expose a Twitter preview component', () => {
		expect( Twitter ).not.toBe( undefined );
	} );

	it( 'should display a untruncated title', () => {
		const wrapper = shallow(
			<Twitter title="I am the very model of a modern Major-General, I've information vegetable, animal, and mineral." />
		);

		const titleEl = wrapper.find( '.twitter-preview__title' );
		expect( titleEl.exists() ).toBeTruthy();
		expect( titleEl.text() ).toEqual(
			"I am the very model of a modern Major-General, I've information vegetable, animal, and mineral."
		);
	} );

	it( 'should display a untruncated description', () => {
		const wrapper = shallow(
			<Twitter description="I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
		);

		const descEl = wrapper.find( '.twitter-preview__description' );
		expect( descEl.exists() ).toBeTruthy();
		expect( descEl.text() ).toEqual(
			"I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse."
		);
	} );

	it( 'should display image only when provided', () => {
		const wrapperNoImage = shallow( <Twitter /> );
		const wrapperWithImage = shallow( <Twitter image={ DUMMY_IMAGE_SRC } /> );

		// No image
		expect( wrapperNoImage.find( '.twitter-preview__image' ).exists() ).toBeFalsy();

		// Has image
		const imageEl = wrapperWithImage.find( '.twitter-preview__image' );
		expect( imageEl.exists() ).toBeTruthy();
		expect( imageEl.html() ).toContain( `style="background-image:url(${ DUMMY_IMAGE_SRC })"` );
	} );

	it( 'should display a protocol-less url only (with no separator) when author is not provided', () => {
		const wrapper = shallow( <Twitter url="https://wordpress.com" /> );

		const urlEl = wrapper.find( '.twitter-preview__url' );
		expect( urlEl.exists() ).toBeTruthy();
		expect( urlEl.text() ).toEqual( 'wordpress.com' );
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
