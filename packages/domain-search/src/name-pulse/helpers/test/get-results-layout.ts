import { getResultsLayout, type NamePulseResultsLayout } from '..';

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
	it( 'shows nothing for an empty query', () => {
		expect( getResultsLayout( '' ) ).toEqual( EMPTY );
		expect( getResultsLayout( '   ' ) ).toEqual( EMPTY );
	} );

	it( 'shows the exact grid for an FQDN', () => {
		expect( getResultsLayout( 'Coffee.COM' ) ).toEqual( {
			mode: 'fqdn',
			baseName: 'coffee',
			wordCount: 1,
			fqdn: { baseName: 'coffee', tld: 'com', fullDomain: 'coffee.com' },
			exactGrid: { show: true },
			suggestions: { show: false },
		} );
	} );

	it( 'shows the exact grid for one word', () => {
		expect( getResultsLayout( ' Coffee! ' ) ).toEqual( SINGLE );
	} );

	it( 'shows the exact grid and suggestions for two or three words', () => {
		expect( getResultsLayout( 'Coffee Shop' ) ).toEqual( KEYWORD );
		expect( getResultsLayout( 'Coffee  Shop  NYC!' ) ).toEqual( {
			...KEYWORD,
			baseName: 'coffeeshopnyc',
			wordCount: 3,
		} );
	} );

	it( 'keeps the exact grid and suggestions for four or more words', () => {
		expect( getResultsLayout( 'a blog about coffee' ) ).toEqual( {
			mode: 'ai',
			baseName: 'ablogaboutcoffee',
			wordCount: 4,
			exactGrid: { show: true },
			suggestions: { show: true },
		} );
	} );

	it( 'treats punctuation-only input as empty', () => {
		expect( getResultsLayout( '!!!' ) ).toEqual( EMPTY );
		expect( getResultsLayout( '!!! ???' ) ).toEqual( EMPTY );
	} );

	it( 'treats a base name shorter than two characters as empty', () => {
		expect( getResultsLayout( 'a' ) ).toEqual( { ...EMPTY, baseName: 'a', wordCount: 1 } );
		expect( getResultsLayout( '!a!' ) ).toEqual( { ...EMPTY, baseName: 'a', wordCount: 1 } );
	} );

	it( 'differs between coffee.com and coffee only in mode and fqdn', () => {
		const { fqdn, ...fqdnLayout } = getResultsLayout( 'coffee.com' );

		expect( fqdn ).toEqual( { baseName: 'coffee', tld: 'com', fullDomain: 'coffee.com' } );
		expect( fqdnLayout ).toEqual( { ...getResultsLayout( 'coffee' ), mode: 'fqdn' } );
	} );

	it( 'keeps a single word followed by punctuation in single mode', () => {
		expect( getResultsLayout( 'coffee !!!' ) ).toEqual( SINGLE );
	} );
} );
