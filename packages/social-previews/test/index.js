/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import moment from 'moment';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import {
	FacebookPreview as Facebook,
	TwitterPreview as Twitter,
	SearchPreview as Search,
} from '../src';
import Tweet from '../src/twitter-preview/tweet';

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
	const emptyTweet = {
		profileImage: '',
		name: '',
		screenName: '',
		date: Date.now(),
		text: '',
		media: [],
		tweet: '',
		urls: [],
	};

	it( 'should expose a Twitter preview component', () => {
		expect( Twitter ).not.toBe( undefined );
	} );

	it( 'should display an untruncated title', () => {
		const wrapper = shallow(
			<Twitter title="I am the very model of a modern Major-General, I've information vegetable, animal, and mineral." />
		);

		const tweetWrapper = wrapper.find( Tweet ).dive();

		const titleEl = tweetWrapper.find( '.twitter-preview__card-title' );
		expect( titleEl.exists() ).toBeTruthy();
		expect( titleEl.text() ).toEqual(
			"I am the very model of a modern Major-General, I've information vegetable, animal, and mineral."
		);
	} );

	it( 'should display a truncated description', () => {
		const wrapper = shallow(
			<Twitter description="I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
		);

		const tweetWrapper = wrapper.find( Tweet ).dive();

		const descEl = tweetWrapper.find( '.twitter-preview__card-description' );
		expect( descEl.exists() ).toBeTruthy();
		expect( descEl.text() ).toEqual(
			"I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both …"
		);

		const descTextNoEllipsis = descEl.text().replace( '…', '' );
		expect( descTextNoEllipsis ).toHaveLength( 200 );
	} );

	it( 'should strip html tags from the description', () => {
		const wrapper = shallow(
			<Twitter description="<p style='color:red'>I know the kings of <span>England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, <span>both</span> the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
		);

		const tweetWrapper = wrapper.find( Tweet ).dive();

		const descEl = tweetWrapper.find( '.twitter-preview__card-description' );
		expect( descEl.exists() ).toBeTruthy();
		expect( descEl.text() ).toEqual(
			"I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both …"
		);
	} );

	it( 'should display image only when provided', () => {
		const wrapperNoImage = shallow( <Twitter /> );
		const wrapperWithImage = shallow( <Twitter image={ IMAGE_SRC_FIXTURE } /> );

		const tweetWrapperNoImage = wrapperNoImage.find( Tweet ).dive();
		const tweetWrapperWithImage = wrapperWithImage.find( Tweet ).dive();

		// No image
		expect( tweetWrapperNoImage.find( '.twitter-preview__card-image' ).exists() ).toBeFalsy();

		// Has image
		const imageEl = tweetWrapperWithImage.find( '.twitter-preview__card-image' );
		expect( imageEl.exists() ).toBeTruthy();
		expect( imageEl.html() ).toContain( `src="${ IMAGE_SRC_FIXTURE }"` );
	} );

	it( 'should display a protocol-less url only (with no separator) when author is not provided', () => {
		const wrapper = shallow( <Twitter url="https://wordpress.com" /> );

		const tweetWrapper = wrapper.find( Tweet ).dive();

		const urlEl = tweetWrapper.find( '.twitter-preview__card-url' );
		expect( urlEl.exists() ).toBeTruthy();
		expect( urlEl.text() ).toEqual( 'wordpress.com' );
	} );

	describe( 'Styling hooks', () => {
		it( 'should append a classname with the correct "type" to the root element when provided', () => {
			const wrapper = shallow( <Twitter type="article" /> );

			const tweetWrapper = wrapper.find( Tweet ).dive();

			const innerEl = tweetWrapper.find( '.twitter-preview__card > div' );

			expect( innerEl.hasClass( 'twitter-preview__card-article' ) ).toBeTruthy();
		} );
	} );

	it( 'should render the passed profile details', () => {
		const profileImage = 'https://www.gravatar.com/avatar/61ee2579b8905e62b4b4045bdc92c11a';
		const name = 'WordPress';
		const screenName = '@WordPress';
		const date = Date.now();

		const tweets = [
			{
				...emptyTweet,
				profileImage,
				name,
				screenName,
				date,
			},
		];

		const wrapper = shallow( <Twitter tweets={ tweets } /> );
		const tweetWrapper = wrapper.find( Tweet );

		expect( tweetWrapper ).toHaveLength( 1 );

		const renderedWrapper = tweetWrapper.dive();

		expect( renderedWrapper.find( '.twitter-preview__profile-image > img' ).html() ).toContain(
			`src="${ profileImage }"`
		);
		expect( renderedWrapper.find( '.twitter-preview__name' ).text() ).toEqual( name );
		expect( renderedWrapper.find( '.twitter-preview__screen-name' ).text() ).toEqual( screenName );
		expect( renderedWrapper.find( '.twitter-preview__date' ).text() ).toEqual(
			moment( date ).format( 'MMM D' )
		);
	} );

	it( 'should only replace URLs in parentheses', () => {
		const tweets = [
			{
				...emptyTweet,
				text:
					'This text (https://jetpack.com/) has (https://wordpress.com/) some (https://jetpack.com/) URLs (https://wordpress.org/).',
				urls: [
					'https://jetpack.com/',
					'https://wordpress.com/',
					'https://jetpack.com/',
					'https://wordpress.org/',
				],
			},
		];

		const wrapper = shallow( <Twitter tweets={ tweets } /> );
		const tweetWrapper = wrapper.find( Tweet );

		expect( tweetWrapper ).toHaveLength( 1 );

		const textEl = tweetWrapper.dive().find( '.twitter-preview__text' );
		expect( textEl ).toHaveLength( 1 );

		expect( textEl.render().html() ).toEqual(
			'This text (<a href="https://jetpack.com/">https://jetpack.com/</a>) has (<a href="https://wordpress.com/">https://wordpress.com/</a>) some (<a href="https://jetpack.com/">https://jetpack.com/</a>) URLs (<a href="https://wordpress.org/">https://wordpress.org/</a>).'
		);
	} );

	it( 'should render a quoted tweet', () => {
		const tweet = 'https://twitter.com/GaryPendergast/status/934003415507546112';

		const tweets = [
			{
				...emptyTweet,
				tweet,
			},
		];

		const wrapper = shallow( <Twitter tweets={ tweets } /> );
		const tweetWrapper = wrapper.find( Tweet );

		expect( tweetWrapper ).toHaveLength( 1 );

		const quoteEl = tweetWrapper.dive().find( '.twitter-preview__quote-tweet' );

		expect( quoteEl ).toHaveLength( 1 );

		expect( quoteEl.childAt( 0 ).prop( 'html' ) ).toEqual(
			`<blockquote class="twitter-tweet" data-conversation="none" data-dnt="true"><a href="${ tweet }"></a></blockquote>`
		);
	} );

	it( 'should render two tweets when passed two tweets', () => {
		const tweets = [
			{
				...emptyTweet,
				text: 'tweet-1',
			},
			{
				...emptyTweet,
				text: 'tweet-2',
			},
		];
		const wrapper = shallow( <Twitter tweets={ tweets } /> );
		const tweetWrappers = wrapper.find( Tweet );

		expect( tweetWrappers ).toHaveLength( 2 );

		expect( tweetWrappers.at( 0 ).render().find( '.twitter-preview__text' ).text() ).toEqual(
			'tweet-1'
		);
		expect( tweetWrappers.at( 1 ).render().find( '.twitter-preview__text' ).text() ).toEqual(
			'tweet-2'
		);

		expect( tweetWrappers.at( 0 ).prop( 'isLast' ) ).toBeFalsy();
		expect( tweetWrappers.at( 1 ).prop( 'isLast' ) ).toBeTruthy();
	} );

	it( 'should render media correctly', () => {
		const tweets = [
			// Passing no media renders no media.
			emptyTweet,
			// Passing 5 images renders 4 images.
			{
				...emptyTweet,
				media: Array.from( Array( 5 ).keys() ).map( ( val ) => ( {
					alt: `alt-${ val }`,
					url: `src-${ val }.png`,
					type: 'image/png',
				} ) ),
			},
			// A GIF or video that aren't first won't be rendered.
			{
				...emptyTweet,
				media: [
					{
						alt: `not-gif-0`,
						url: `alt-not-gif-0.png`,
						type: 'image/png',
					},
					{
						alt: `a gif 1`,
						url: `a-1.gif`,
						type: 'image/gif',
					},
					{
						alt: `not-gif-1`,
						url: `alt-not-gif-1.png`,
						type: 'image/png',
					},
					{
						url: `video-1.mp4`,
						type: 'video/mp4',
					},
				],
			},
			// Passing a GIF first only renders the GIF.
			{
				...emptyTweet,
				media: [
					{
						alt: `a gif 2`,
						url: `a-2.gif`,
						type: 'image/gif',
					},
					{
						alt: `not-gif-2`,
						url: `alt-not-gif-2.png`,
						type: 'image/png',
					},
					{
						alt: `not-gif-3`,
						url: `alt-not-gif-3.png`,
						type: 'image/png',
					},
				],
			},
			// Passing a video first only renders the.
			{
				...emptyTweet,
				media: [
					{
						url: `video-2.mp4`,
						type: 'video/mp4',
					},
					{
						alt: `not-gif-2`,
						url: `alt-not-gif-2.png`,
						type: 'image/png',
					},
					{
						alt: `not-gif-3`,
						url: `alt-not-gif-3.png`,
						type: 'image/png',
					},
				],
			},
		];

		const expected = [
			// Passing no media renders no media.
			[],
			// Passing 5 images renders 4 images.
			Array.from( Array( 4 ).keys() ).map( ( val ) => ( {
				alt: `alt-${ val }`,
				src: `src-${ val }.png`,
				tag: 'img',
			} ) ),
			// A GIF or video that aren't first won't be rendered.
			[
				{
					alt: `not-gif-0`,
					src: `alt-not-gif-0.png`,
					tag: 'img',
				},
				{
					alt: `not-gif-1`,
					src: `alt-not-gif-1.png`,
					tag: 'img',
				},
			],
			// Passing a GIF first only renders the GIF.
			[
				{
					alt: `a gif 2`,
					src: `a-2.gif`,
					tag: 'img',
				},
			],
			// Passing a video first only renders the.
			[
				{
					src: `video-2.mp4`,
					type: 'video/mp4',
					tag: 'video',
				},
			],
		];

		const wrapper = shallow( <Twitter tweets={ tweets } /> );
		const tweetWrappers = wrapper.find( Tweet );

		expect( tweetWrappers ).toHaveLength( tweets.length );

		tweetWrappers.forEach( ( tweet, index ) => {
			const mediaEl = tweet.dive().find( '.twitter-preview__media' );

			if ( expected[ index ].length === 0 ) {
				expect( mediaEl.exists() ).toBeFalsy();
				return;
			}

			expect( mediaEl.exists() ).toBeTruthy();
			expect( mediaEl.children() ).toHaveLength( expected[ index ].length );

			expected[ index ].forEach( ( mediaItem, mediaIndex ) => {
				const mediaItemEl = mediaEl.childAt( mediaIndex );
				expect( mediaItemEl.type() ).toEqual( mediaItem.tag );

				switch ( mediaItem.tag ) {
					case 'img':
						expect( mediaItemEl.prop( 'alt' ) ).toEqual( mediaItem.alt );
						expect( mediaItemEl.prop( 'src' ) ).toEqual( mediaItem.src );
						break;
					case 'video':
						expect( mediaItemEl.find( 'source' ).prop( 'src' ) ).toEqual( mediaItem.src );
						expect( mediaItemEl.find( 'source' ).prop( 'type' ) ).toEqual( mediaItem.type );
						break;
				}
			} );
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
