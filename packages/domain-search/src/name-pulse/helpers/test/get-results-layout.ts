import { getResultsLayout, type NamePulseResultsLayout } from '..';

const TLDS = [ 'blog', 'com', 'net', 'org' ];

const EMPTY: NamePulseResultsLayout = {
	mode: 'empty',
	baseName: '',
	wordCount: 0,
	top: { show: false },
	exactGrid: { show: false },
	suggestions: { show: false },
	creative: { show: false },
};

const SINGLE: NamePulseResultsLayout = {
	mode: 'single',
	baseName: 'coffee',
	wordCount: 1,
	top: { show: true },
	exactGrid: { show: true },
	suggestions: { show: true },
	creative: { show: false },
};

const KEYWORD: NamePulseResultsLayout = {
	mode: 'keyword',
	baseName: 'coffeeshop',
	wordCount: 2,
	top: { show: true },
	exactGrid: { show: true },
	suggestions: { show: true },
	creative: { show: false },
};

describe( 'getResultsLayout', () => {
	it( 'shows nothing for an empty or punctuation-only query', () => {
		expect( getResultsLayout( '', TLDS ) ).toEqual( EMPTY );
		expect( getResultsLayout( '   ', TLDS ) ).toEqual( EMPTY );
		expect( getResultsLayout( '!!!', TLDS ) ).toEqual( EMPTY );
		expect( getResultsLayout( '!!! ???', TLDS ) ).toEqual( EMPTY );
	} );

	it( 'shows the exact grid for an FQDN', () => {
		expect( getResultsLayout( 'Coffee.COM', TLDS ) ).toEqual( {
			mode: 'fqdn',
			baseName: 'coffee',
			wordCount: 1,
			fqdn: { baseName: 'coffee', tld: 'com', fullDomain: 'coffee.com' },
			top: { show: true },
			exactGrid: { show: true },
			suggestions: { show: true },
			creative: { show: false },
		} );
	} );

	it( 'shows the exact grid for one word, even when followed by punctuation', () => {
		expect( getResultsLayout( ' Coffee! ', TLDS ) ).toEqual( SINGLE );
		expect( getResultsLayout( 'coffee !!!', TLDS ) ).toEqual( SINGLE );
	} );

	it( 'shows the exact grid and suggestions for two or three words', () => {
		expect( getResultsLayout( 'Coffee Shop', TLDS ) ).toEqual( KEYWORD );
		expect( getResultsLayout( 'Coffee  Shop  NYC!', TLDS ) ).toEqual( {
			...KEYWORD,
			baseName: 'coffeeshopnyc',
			wordCount: 3,
		} );
	} );

	it( 'drops the exact grid and adds creative matches for four or more words', () => {
		expect( getResultsLayout( 'a blog about coffee', TLDS ) ).toEqual( {
			mode: 'ai',
			baseName: 'ablogaboutcoffee',
			wordCount: 4,
			top: { show: true },
			exactGrid: { show: false },
			suggestions: { show: true },
			creative: { show: true },
		} );
	} );

	it( 'joins input with an unrecognised ending into one name and reports it', () => {
		expect( getResultsLayout( 'icecream.d', TLDS ) ).toEqual( {
			mode: 'single',
			baseName: 'icecreamd',
			wordCount: 1,
			unknownEnding: 'd',
			top: { show: true },
			exactGrid: { show: true },
			suggestions: { show: true },
			creative: { show: false },
		} );
	} );

	it( 'searches the root domain of a subdomain and reports it', () => {
		expect( getResultsLayout( 'shop.icecream.com', TLDS ) ).toEqual( {
			mode: 'fqdn',
			baseName: 'icecream',
			wordCount: 1,
			fqdn: { baseName: 'icecream', tld: 'com', fullDomain: 'icecream.com' },
			subdomain: 'shop',
			top: { show: true },
			exactGrid: { show: true },
			suggestions: { show: true },
			creative: { show: false },
		} );
	} );

	it( 'searches the label of a free subdomain and reports it', () => {
		expect( getResultsLayout( 'mysite.wordpress.com', TLDS ) ).toEqual( {
			mode: 'single',
			baseName: 'mysite',
			wordCount: 1,
			isFreeSubdomain: true,
			top: { show: true },
			exactGrid: { show: true },
			suggestions: { show: true },
			creative: { show: false },
		} );
	} );

	it( 'treats a base name shorter than two characters as empty', () => {
		expect( getResultsLayout( 'a', TLDS ) ).toEqual( { ...EMPTY, baseName: 'a', wordCount: 1 } );
		expect( getResultsLayout( '!a!', TLDS ) ).toEqual( { ...EMPTY, baseName: 'a', wordCount: 1 } );
	} );
} );
