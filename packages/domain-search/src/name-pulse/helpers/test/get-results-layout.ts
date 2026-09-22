import { getResultsLayout, type NamePulseResultsLayout } from '..';

const TLDS = [ 'blog', 'com', 'net', 'org' ];

const EMPTY: NamePulseResultsLayout = {
	mode: 'empty',
	baseName: '',
	wordCount: 0,
	exactGrid: { show: false },
	suggestions: { show: false },
};

const SINGLE: NamePulseResultsLayout = {
	mode: 'single',
	baseName: 'coffee',
	wordCount: 1,
	exactGrid: { show: true },
	suggestions: { show: false },
};

const KEYWORD: NamePulseResultsLayout = {
	mode: 'keyword',
	baseName: 'coffeeshop',
	wordCount: 2,
	exactGrid: { show: true },
	suggestions: { show: true },
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
			exactGrid: { show: true },
			suggestions: { show: false },
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

	it( 'keeps the exact grid and suggestions for four or more words', () => {
		expect( getResultsLayout( 'a blog about coffee', TLDS ) ).toEqual( {
			mode: 'ai',
			baseName: 'ablogaboutcoffee',
			wordCount: 4,
			exactGrid: { show: true },
			suggestions: { show: true },
		} );
	} );

	it( 'treats a base name shorter than two characters as empty', () => {
		expect( getResultsLayout( 'a', TLDS ) ).toEqual( { ...EMPTY, baseName: 'a', wordCount: 1 } );
		expect( getResultsLayout( '!a!', TLDS ) ).toEqual( { ...EMPTY, baseName: 'a', wordCount: 1 } );
	} );
} );
