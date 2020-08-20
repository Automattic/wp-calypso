/**
 * Internal dependencies
 */
import React from 'react';
import {
	FacebookPreview as Facebook,
	TwitterPreview as Twitter,
	SearchPreview as Search,
} from '../src';
import { shallow } from 'enzyme';

const IMAGE_SRC_FIXTURE = 'https://wordpress.com/someimagehere';

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

	it( 'should strip html tags from the description', () => {
		const wrapper = shallow(
			<Facebook description="<p style='color:red'>I know the kings of <span>England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, <span>both</span> the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
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
		const wrapperWithImage = shallow( <Facebook image={ IMAGE_SRC_FIXTURE } /> );

		// No image
		expect( wrapperNoImage.find( 'img[alt="Facebook Preview Thumbnail"]' ).exists() ).toBeFalsy();

		// Has image
		const imageEl = wrapperWithImage.find( 'img[alt="Facebook Preview Thumbnail"]' );
		expect( imageEl.exists() ).toBeTruthy();
		expect( imageEl.html() ).toContain( `src="${ IMAGE_SRC_FIXTURE }"` );
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

	it( 'should strip html tasgs from the description', () => {
		const wrapper = shallow(
			<Twitter description="<p style='color:red'>I know the kings of <span>England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, <span>both</span> the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
		);

		const descEl = wrapper.find( '.twitter-preview__description' );
		expect( descEl.exists() ).toBeTruthy();
		expect( descEl.text() ).toEqual(
			"I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse."
		);
	} );

	it( 'should display image only when provided', () => {
		const wrapperNoImage = shallow( <Twitter /> );
		const wrapperWithImage = shallow( <Twitter image={ IMAGE_SRC_FIXTURE } /> );

		// No image
		expect( wrapperNoImage.find( '.twitter-preview__image' ).exists() ).toBeFalsy();

		// Has image
		const imageEl = wrapperWithImage.find( '.twitter-preview__image' );
		expect( imageEl.exists() ).toBeTruthy();
		expect( imageEl.html() ).toContain( `style="background-image:url(${ IMAGE_SRC_FIXTURE })"` );
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

	describe( 'Description truncation', () => {
		it( 'should display entire description if short enough ', () => {
			const wrapper = shallow(
				<Search description="I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical." />
			);

			const descriptionEl = wrapper.find( '.search-preview__description' );
			expect( descriptionEl.exists() ).toBeTruthy();
			expect( descriptionEl.text() ).toEqual(
				"I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical."
			);
			expect( descriptionEl.text().length ).toBeLessThanOrEqual( 160 );
		} );

		it( 'should truncate description at suitable space character where possible', () => {
			const descriptionUpperBound = 160 + 10;
			const wrapper = shallow(
				<Search description="I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
			);

			const descriptionEl = wrapper.find( '.search-preview__description' );
			expect( descriptionEl.exists() ).toBeTruthy();
			expect( descriptionEl.text() ).toEqual(
				"I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical, From…"
			);
			const rawDescriptionText = descriptionEl.text().replace( '…', '' );
			expect( rawDescriptionText.length ).toBeLessThanOrEqual( descriptionUpperBound );
		} );

		it( 'should hard truncate description as last resort', () => {
			const wrapper = shallow(
				<Search description="IamtheverymodelofamodernMajor-General,I'veinformationvegetable,animal,andmineral.IknowthekingsofEngland,andIquotethefightshistorical,FromMarathontoWaterloo,inordercategorical;I'mverywellacquainted,too,withmattersmathematical,Iunderstandequations,boththesimpleandquadratical;AboutbinomialtheoremI'mteemingwithaloto'news,Withmanycheerfulfactsaboutthesquareofthehypotenuse." />
			);

			const descriptionEl = wrapper.find( '.search-preview__description' );
			expect( descriptionEl.exists() ).toBeTruthy();
			expect( descriptionEl.text() ).toEqual(
				"IamtheverymodelofamodernMajor-General,I'veinformationvegetable,animal,andmineral.IknowthekingsofEngland,andIquotethefightshistorical,FromMarathontoWaterloo,inor…"
			);
			const descriptionElNoEllipsis = descriptionEl.text().replace( '…', '' );
			expect( descriptionElNoEllipsis ).toHaveLength( 160 );
		} );

		it( 'should strip html tags from the description', () => {
			const descriptionUpperBound = 160 + 10;
			const wrapper = shallow(
				<Search description="<p style='color:red'>I am the very model</p> of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical, <span>From</span> Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
			);

			const descriptionEl = wrapper.find( '.search-preview__description' );
			expect( descriptionEl.exists() ).toBeTruthy();
			expect( descriptionEl.text() ).toEqual(
				"I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical, From…"
			);
			const rawDescriptionText = descriptionEl.text().replace( '…', '' );
			expect( rawDescriptionText.length ).toBeLessThanOrEqual( descriptionUpperBound );
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
			'wordpress.com › alongpathnameheretoensuretruncationoccursbutitdoesne' +
				'…' +
				' ' +
				downArrowChar
		);
		const urlTextRaw = urlEl.text().replace( '…', '' ).replace( downArrowChar, '' ).trimEnd();
		expect( urlTextRaw ).toHaveLength( 68 );
	} );
} );
