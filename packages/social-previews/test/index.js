/**
 * @jest-environment jsdom
 */

/* eslint-disable jest/no-conditional-expect */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import moment from 'moment';
import {
	FacebookPreview as Facebook,
	TwitterPreview as Twitter,
	SearchPreview as Search,
} from '../src';

const IMAGE_SRC_FIXTURE = 'https://wordpress.com/someimagehere';

describe( 'Facebook previews', () => {
	it( 'should display a (hard) truncated title', () => {
		const { container } = render(
			<Facebook title="I am the very model of a modern Major-General, I've information vegetable, animal, and mineral." />
		);

		const titleEl = container.querySelector( '.facebook-preview__title' );

		expect( titleEl ).toBeVisible();
		expect( titleEl ).toHaveTextContent(
			"I am the very model of a modern Major-General, I've information vegetable, anima…"
		);
		expect( titleEl.textContent.replace( '…', '' ) ).toHaveLength( 80 );
	} );

	it( 'should display a (hard) truncated description', () => {
		const { container } = render(
			<Facebook description="I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
		);

		const descEl = container.querySelector( '.facebook-preview__description' );

		expect( descEl ).toBeVisible();
		expect( descEl ).toHaveTextContent(
			"I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both …"
		);
		expect( descEl.textContent.replace( '…', '' ) ).toHaveLength( 200 );
	} );

	it( 'should strip html tags from the description', () => {
		const { container } = render(
			<Facebook description="<p style='color:red'>I know the kings of <span>England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, <span>both</span> the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
		);

		const descEl = container.querySelector( '.facebook-preview__description' );

		expect( descEl ).toBeVisible();
		expect( descEl ).toHaveTextContent(
			"I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both …"
		);
		expect( descEl.textContent.replace( '…', '' ) ).toHaveLength( 200 );
	} );

	it( 'should display image only when provided', () => {
		const { container } = render(
			<>
				<Facebook type="article" />
				<Facebook image={ IMAGE_SRC_FIXTURE } type="website" />
			</>
		);

		// No image
		expect(
			container
				.querySelector( '.facebook-preview__article' )
				.querySelector( 'img[alt="Facebook Preview Thumbnail"]' )
		).not.toBeInTheDocument();

		// Has image
		const imageEl = container
			.querySelector( '.facebook-preview__website' )
			.querySelector( 'img[alt="Facebook Preview Thumbnail"]' );

		expect( imageEl ).toBeVisible();
		expect( imageEl ).toHaveAttribute( 'src', IMAGE_SRC_FIXTURE );
	} );

	describe( 'Preview url display', () => {
		it( 'should display a protocol-less url and author if provided', () => {
			const { container } = render( <Facebook url="https://wordpress.com" author="Jane Doe" /> );

			const urlEl = container.querySelector( '.facebook-preview__url' );

			expect( urlEl ).toBeVisible();
			expect( urlEl ).toHaveTextContent( 'wordpress.com | Jane Doe' );
		} );

		it( 'should display a protocol-less url only (with no separator) when author is not provided', () => {
			const { container } = render( <Facebook url="https://wordpress.com" /> );

			const urlEl = container.querySelector( '.facebook-preview__url' );

			expect( urlEl ).toBeVisible();
			expect( urlEl ).toHaveTextContent( 'wordpress.com' );
			expect( urlEl.textContent ).not.toContain( '|' );
		} );

		it( 'should display the author only (with no separator) when a url is not provided', () => {
			const { container } = render( <Facebook author="Jane Doe" /> );

			const urlEl = container.querySelector( '.facebook-preview__url' );

			expect( urlEl ).toBeVisible();
			expect( urlEl ).toHaveTextContent( 'Jane Doe' );
			expect( urlEl.textContent ).not.toContain( '|' );
		} );
	} );

	describe( 'Styling hooks', () => {
		it( 'should append a classname with the correct "type" to the root element when provided', () => {
			const { container } = render( <Facebook type="article" /> );

			const rootEl = container.querySelector( '.facebook-preview' );

			expect( rootEl ).toHaveClass( 'facebook-preview__article' );
		} );
	} );
} );

describe( 'Twitter previews', () => {
	let originalConsoleError;

	beforeAll( () => {
		originalConsoleError = global.console.error;
		global.console.error = jest.fn();
	} );

	afterAll( () => {
		global.console.error = originalConsoleError;
	} );

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

	it( 'should display an untruncated title', () => {
		const { container } = render(
			<Twitter title="I am the very model of a modern Major-General, I've information vegetable, animal, and mineral." />
		);

		const tweetWrapper = container.querySelector( '.twitter-preview__container' );
		const titleEl = tweetWrapper.querySelector( '.twitter-preview__card-title' );

		expect( titleEl ).toBeVisible();
		expect( titleEl ).toHaveTextContent(
			"I am the very model of a modern Major-General, I've information vegetable, animal, and mineral."
		);
	} );

	it( 'should display a truncated description', () => {
		const { container } = render(
			<Twitter description="I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
		);

		const tweetWrapper = container.querySelector( '.twitter-preview__container' );
		const descEl = tweetWrapper.querySelector( '.twitter-preview__card-description' );

		expect( descEl ).toBeVisible();
		expect( descEl ).toHaveTextContent(
			"I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both …"
		);
		expect( descEl.textContent.replace( '…', '' ) ).toHaveLength( 200 );
	} );

	it( 'should strip html tags from the description', () => {
		const { container } = render(
			<Twitter description="<p style='color:red'>I know the kings of <span>England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, <span>both</span> the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
		);

		const tweetWrapper = container.querySelector( '.twitter-preview__container' );
		const descEl = tweetWrapper.querySelector( '.twitter-preview__card-description' );

		expect( descEl ).toBeVisible();
		expect( descEl ).toHaveTextContent(
			"I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both …"
		);
	} );

	it( 'should display image only when provided', () => {
		const { container } = render(
			<>
				<Twitter />
				<Twitter image={ IMAGE_SRC_FIXTURE } />
			</>
		);

		const twitterPreviews = container.querySelectorAll( '.twitter-preview' );
		const tweetWrapperNoImage = twitterPreviews[ 0 ];
		const tweetWrapperWithImage = twitterPreviews[ 1 ];

		// No image
		expect(
			tweetWrapperNoImage.querySelector( '.twitter-preview__card-image' )
		).not.toBeInTheDocument();

		// Has image
		const imageEl = tweetWrapperWithImage.querySelector( '.twitter-preview__card-image' );

		expect( imageEl ).toBeVisible();
		expect( imageEl ).toHaveAttribute( 'src', IMAGE_SRC_FIXTURE );
	} );

	it( 'should display a protocol-less url only (with no separator) when author is not provided', () => {
		const { container } = render( <Twitter url="https://wordpress.com" /> );

		const tweetWrapper = container.querySelector( '.twitter-preview__container' );
		const urlEl = tweetWrapper.querySelector( '.twitter-preview__card-url' );

		expect( urlEl ).toBeVisible();
		expect( urlEl ).toHaveTextContent( 'wordpress.com' );
	} );

	describe( 'Styling hooks', () => {
		it( 'should append a classname with the correct "type" to the root element when provided', () => {
			const { container } = render( <Twitter type="article" /> );

			const tweetWrapper = container.querySelector( '.twitter-preview__container' );
			const innerEl = tweetWrapper.querySelector( '.twitter-preview__card > div' );

			expect( innerEl ).toHaveClass( 'twitter-preview__card-article' );
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

		const { container } = render( <Twitter tweets={ tweets } /> );

		const tweetWrapper = container.querySelector( '.twitter-preview__container' );

		expect( tweetWrapper ).toBeVisible();
		expect( tweetWrapper.querySelector( '.twitter-preview__profile-image > img' ) ).toHaveAttribute(
			'src',
			profileImage
		);
		expect( tweetWrapper.querySelector( '.twitter-preview__name' ) ).toHaveTextContent( name );
		expect( tweetWrapper.querySelector( '.twitter-preview__screen-name' ) ).toHaveTextContent(
			screenName
		);
		expect( tweetWrapper.querySelector( '.twitter-preview__date' ) ).toHaveTextContent(
			moment( date ).format( 'MMM D' )
		);
	} );

	it( 'should only replace URLs in parentheses', () => {
		const tweets = [
			{
				...emptyTweet,
				text: 'This text (https://jetpack.com/) has (https://wordpress.com/) some (https://jetpack.com/) URLs (https://wordpress.org/).',
				urls: [
					'https://jetpack.com/',
					'https://wordpress.com/',
					'https://jetpack.com/',
					'https://wordpress.org/',
				],
			},
		];

		const { container } = render( <Twitter tweets={ tweets } /> );

		const tweetWrapper = container.querySelector( '.twitter-preview__container' );

		expect( tweetWrapper ).toBeVisible();

		const textEl = tweetWrapper.querySelector( '.twitter-preview__text' );

		expect( textEl ).toBeVisible();
		expect( textEl ).toContainHTML(
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

		const { container } = render( <Twitter tweets={ tweets } /> );

		const tweetWrapper = container.querySelector( '.twitter-preview__container' );

		expect( tweetWrapper ).toBeVisible();

		const quoteEl = tweetWrapper.querySelector( '.twitter-preview__quote-tweet' );

		expect( quoteEl ).toBeVisible();
		expect( quoteEl.children.item( 0 ).contentWindow.document.body ).toContainHTML(
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
		const { container } = render( <Twitter tweets={ tweets } /> );

		const tweetWrappers = container.querySelectorAll( '.twitter-preview__container' );

		expect( tweetWrappers ).toHaveLength( 2 );

		expect( tweetWrappers.item( 0 ).querySelector( '.twitter-preview__text' ) ).toHaveTextContent(
			'tweet-1'
		);
		expect( tweetWrappers.item( 1 ).querySelector( '.twitter-preview__text' ) ).toHaveTextContent(
			'tweet-2'
		);
		expect( tweetWrappers.item( 0 ).querySelector( '.twitter-preview__connector' ) ).toBeVisible();
		expect(
			tweetWrappers.item( 1 ).querySelector( '.twitter-preview__connector' )
		).not.toBeInTheDocument();
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

		const { container } = render( <Twitter tweets={ tweets } /> );

		const tweetWrappers = container.querySelectorAll( '.twitter-preview__container' );

		expect( tweetWrappers ).toHaveLength( tweets.length );

		tweetWrappers.forEach( ( tweet, index ) => {
			const mediaEl = tweet.querySelector( '.twitter-preview__media' );

			if ( expected[ index ].length === 0 ) {
				expect( mediaEl ).not.toBeInTheDocument();
				return;
			}

			expect( mediaEl ).toBeVisible();
			expect( mediaEl.children ).toHaveLength( expected[ index ].length );

			expected[ index ].forEach( ( mediaItem, mediaIndex ) => {
				const mediaItemEl = mediaEl.children.item( mediaIndex );
				expect( mediaItemEl.tagName.toLowerCase() ).toEqual( mediaItem.tag );

				switch ( mediaItem.tag ) {
					case 'img':
						expect( mediaItemEl ).toHaveAttribute( 'alt', mediaItem.alt );
						expect( mediaItemEl ).toHaveAttribute( 'src', mediaItem.src );
						break;
					case 'video':
						expect( mediaItemEl.querySelector( 'source' ) ).toHaveAttribute( 'src', mediaItem.src );
						expect( mediaItemEl.querySelector( 'source' ) ).toHaveAttribute(
							'type',
							mediaItem.type
						);
						break;
				}
			} );
		} );
	} );
} );

describe( 'Search previews', () => {
	describe( 'Title truncation', () => {
		it( 'should display entire title if short enough', () => {
			const { container } = render(
				<Search title="I am the very model of a modern Major-General" />
			);

			const titleEl = container.querySelector( '.search-preview__title' );

			expect( titleEl ).toBeVisible();
			expect( titleEl ).toHaveTextContent( 'I am the very model of a modern Major-General' );
			expect( titleEl.textContent.replace( '…', '' ).length ).toBeLessThanOrEqual( 63 );
		} );

		it( 'should truncate title at suitable space character where possible', () => {
			const { container } = render(
				<Search title="I am the very model of a modern Major-General, I've information vegetable, animal, and mineral." />
			);

			const titleEl = container.querySelector( '.search-preview__title' );

			expect( titleEl ).toBeVisible();
			expect( titleEl ).toHaveTextContent(
				"I am the very model of a modern Major-General, I've information…"
			);
			expect( titleEl.textContent.replace( '…', '' ).length ).toBeLessThanOrEqual( 63 );
		} );

		it( 'should hard truncate title as last resort', () => {
			const { container } = render(
				<Search title="IamtheverymodelofamodernMajorGeneralIveinformationvegetableanimalandmineral." />
			);

			const titleEl = container.querySelector( '.search-preview__title' );

			expect( titleEl ).toBeVisible();
			expect( titleEl ).toHaveTextContent(
				'IamtheverymodelofamodernMajorGeneralIveinformationvegetableanim…'
			);
			expect( titleEl.textContent.replace( '…', '' ) ).toHaveLength( 63 );
		} );
	} );

	describe( 'Description truncation', () => {
		it( 'should display entire description if short enough', () => {
			const { container } = render(
				<Search description="I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical." />
			);

			const descriptionEl = container.querySelector( '.search-preview__description' );

			expect( descriptionEl ).toBeVisible();
			expect( descriptionEl ).toHaveTextContent(
				"I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical."
			);
			expect( descriptionEl.textContent.length ).toBeLessThanOrEqual( 160 );
		} );

		it( 'should truncate description at suitable space character where possible', () => {
			const descriptionUpperBound = 160 + 10;

			const { container } = render(
				<Search description="I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
			);

			const descriptionEl = container.querySelector( '.search-preview__description' );

			expect( descriptionEl ).toBeVisible();
			expect( descriptionEl ).toHaveTextContent(
				"I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical, From…"
			);
			expect( descriptionEl.textContent.replace( '…', '' ).length ).toBeLessThanOrEqual(
				descriptionUpperBound
			);
		} );

		it( 'should hard truncate description as last resort', () => {
			const { container } = render(
				<Search description="IamtheverymodelofamodernMajor-General,I'veinformationvegetable,animal,andmineral.IknowthekingsofEngland,andIquotethefightshistorical,FromMarathontoWaterloo,inordercategorical;I'mverywellacquainted,too,withmattersmathematical,Iunderstandequations,boththesimpleandquadratical;AboutbinomialtheoremI'mteemingwithaloto'news,Withmanycheerfulfactsaboutthesquareofthehypotenuse." />
			);

			const descriptionEl = container.querySelector( '.search-preview__description' );

			expect( descriptionEl ).toBeVisible();
			expect( descriptionEl ).toHaveTextContent(
				"IamtheverymodelofamodernMajor-General,I'veinformationvegetable,animal,andmineral.IknowthekingsofEngland,andIquotethefightshistorical,FromMarathontoWaterloo,inor…"
			);
			expect( descriptionEl.textContent.replace( '…', '' ) ).toHaveLength( 160 );
		} );

		it( 'should strip html tags from the description', () => {
			const descriptionUpperBound = 160 + 10;

			const { container } = render(
				<Search description="<p style='color:red'>I am the very model</p> of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical, <span>From</span> Marathon to Waterloo, in order categorical; I'm very well acquainted, too, with matters mathematical, I understand equations, both the simple and quadratical; About binomial theorem I'm teeming with a lot o' news, With many cheerful facts about the square of the hypotenuse." />
			);

			const descriptionEl = container.querySelector( '.search-preview__description' );

			expect( descriptionEl ).toBeVisible();
			expect( descriptionEl ).toHaveTextContent(
				"I am the very model of a modern Major-General, I've information vegetable, animal, and mineral. I know the kings of England, and I quote the fights historical, From…"
			);
			expect( descriptionEl.textContent.replace( '…', '' ).length ).toBeLessThanOrEqual(
				descriptionUpperBound
			);
		} );
	} );

	it( 'should display truncated url', () => {
		const downArrowChar = '▾';

		const { container } = render(
			<Search url="https://wordpress.com/alongpathnameheretoensuretruncationoccursbutitdoesneedtobequitelongtomakethathappen" />
		);

		const urlEl = container.querySelector( '.search-preview__url' );

		expect( urlEl ).toBeVisible();
		expect( urlEl ).toHaveTextContent(
			'wordpress.com › alongpathnameheretoensuretruncationoccursbutitdoesne' +
				'…' +
				' ' +
				downArrowChar
		);
		expect(
			urlEl.textContent.replace( '…', '' ).replace( downArrowChar, '' ).trimEnd()
		).toHaveLength( 68 );
	} );
} );
