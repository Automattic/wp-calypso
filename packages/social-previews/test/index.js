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

	describe( 'Styling hooks', () => {
		it( 'should append a classname with the correct "type" to the root element when provided', () => {
			const wrapper = shallow( <Twitter type="article" /> );

			const innerEl = wrapper.find( '.twitter-preview > div' );

			expect( innerEl.hasClass( 'twitter-preview__article' ) ).toBeTruthy();
		} );
	} );
} );

describe( 'Search previews', () => {
	it( 'should expose a Search preview component', () => {
		expect( Search ).not.toBe( undefined );
	} );

	it( 'should display a header', () => {
		const wrapper = shallow( <Search /> );

		const headingEl = wrapper.find( '.search-preview__header' );
		expect( headingEl.exists() ).toBeTruthy();
		expect( headingEl.text() ).toEqual( 'Search Preview' );
	} );

	describe( 'Title truncation', () => {
		it( 'should display entire title if short enough ', () => {
			const wrapper = shallow( <Search title="I am the very model of a modern Major-General" /> );

			const titleEl = wrapper.find( '.search-preview__title' );
			expect( titleEl.exists() ).toBeTruthy();
			expect( titleEl.text() ).toEqual( 'I am the very model of a modern Major-General' );
			const titleElNoEllipsis = titleEl.text().replace( '…', '' );
			expect( titleElNoEllipsis.length ).toBeLessThanOrEqual( 63 );
		} );

		it( 'should truncate title at suitable space character where possible', () => {
			const wrapper = shallow(
				<Search title="I am the very model of a modern Major-General, I've information vegetable, animal, and mineral." />
			);

			const titleEl = wrapper.find( '.search-preview__title' );
			expect( titleEl.exists() ).toBeTruthy();
			expect( titleEl.text() ).toEqual(
				"I am the very model of a modern Major-General, I've information…"
			);
			const titleElNoEllipsis = titleEl.text().replace( '…', '' );
			expect( titleElNoEllipsis.length ).toBeLessThanOrEqual( 63 );
		} );

		it( 'should hard truncate title as last resort', () => {
			const wrapper = shallow(
				<Search title="IamtheverymodelofamodernMajorGeneralIveinformationvegetableanimalandmineral." />
			);

			const titleEl = wrapper.find( '.search-preview__title' );
			expect( titleEl.exists() ).toBeTruthy();
			expect( titleEl.text() ).toEqual(
				'IamtheverymodelofamodernMajorGeneralIveinformationvegetableanim…'
			);
			const titleElNoEllipsis = titleEl.text().replace( '…', '' );
			expect( titleElNoEllipsis ).toHaveLength( 63 );
		} );
	} );

	describe( 'Snippet truncation', () => {
		it( 'should display entire snippet if short enough ', () => {
			const wrapper = shallow(
				<Search snippet="I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical." />
			);

			const snippetEl = wrapper.find( '.search-preview__snippet' );
			expect( snippetEl.exists() ).toBeTruthy();
			expect( snippetEl.text() ).toEqual(
				"I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical."
			);
			expect( snippetEl.text().length ).toBeLessThanOrEqual( 160 );
		} );

		it( 'should truncate snippet at suitable space character where possible', () => {
			const snippetUpperBound = 160 + 10;
			const wrapper = shallow(
				<Search snippet="I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
			);

			const snippetEl = wrapper.find( '.search-preview__snippet' );
			expect( snippetEl.exists() ).toBeTruthy();
			expect( snippetEl.text() ).toEqual(
				"I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical, From…"
			);
			const rawSnippetText = snippetEl.text().replace( '…', '' );
			expect( rawSnippetText.length ).toBeLessThanOrEqual( snippetUpperBound );
		} );

		it( 'should hard truncate snippet as last resort', () => {
			const wrapper = shallow(
				<Search snippet="IamtheverymodelofamodernMajor-General,I'veinformationvegetable,animal,andmineral.IknowthekingsofEngland,andIquotethefightshistorical,FromMarathontoWaterloo,inordercategorical;I'mverywellacquainted,too,withmattersmathematical,Iunderstandequations,boththesimpleandquadratical;AboutbinomialtheoremI'mteemingwithaloto'news,Withmanycheerfulfactsaboutthesquareofthehypotenuse." />
			);

			const snippetEl = wrapper.find( '.search-preview__snippet' );
			expect( snippetEl.exists() ).toBeTruthy();
			expect( snippetEl.text() ).toEqual(
				"IamtheverymodelofamodernMajor-General,I'veinformationvegetable,animal,andmineral.IknowthekingsofEngland,andIquotethefightshistorical,FromMarathontoWaterloo,inor…"
			);
			const snippetElNoEllipsis = snippetEl.text().replace( '…', '' );
			expect( snippetElNoEllipsis ).toHaveLength( 160 );
		} );
	} );

	it( 'should display truncated url ', () => {
		const downArrowChar = '▾';
		const wrapper = shallow(
			<Search url="https://wordpress.com/alongpathnameheretoensuretruncationoccursbutitdoesneedtobequitelongtomakethathappen" />
		);

		const urlEl = wrapper.find( '.search-preview__url' );
		expect( urlEl.exists() ).toBeTruthy();
		expect( urlEl.text() ).toEqual(
			'https://wordpress.com/alongpathnameheretoensuretruncationoccursbutitdoesneedtob' +
				'…' +
				' ' +
				downArrowChar
		);
		const urlTextRaw = urlEl.text().replace( '…', '' ).replace( downArrowChar, '' ).trimEnd();
		expect( urlTextRaw ).toHaveLength( 79 );
	} );
} );

/* eslint-disable jest/no-disabled-tests */
describe.skip( 'Reader previews', () => {
	it( 'should expose a Reader preview component', () => {
		expect( Reader ).not.toBe( undefined );
	} );
} );
/* eslint-enable jest/no-disabled-tests */
