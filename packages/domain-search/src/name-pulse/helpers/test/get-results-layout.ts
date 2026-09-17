import { getResultsLayout, type NamePulseResultsLayout } from '..';

const EMPTY: NamePulseResultsLayout = {
	mode: 'empty',
	baseName: '',
	wordCount: 0,
	showFilter: false,
	showBanner: false,
	showFqdnCard: false,
	topResults: { show: false, style: 'card', instant: false },
	exactGrid: { show: false, instant: false },
	suggestions: { show: false, title: 'more', source: 'lds', instant: false },
	creative: { show: false },
};

const SINGLE: NamePulseResultsLayout = {
	mode: 'single',
	baseName: 'coffee',
	wordCount: 1,
	showFilter: true,
	showBanner: true,
	showFqdnCard: false,
	topResults: { show: true, style: 'card', instant: true },
	exactGrid: { show: true, instant: true },
	suggestions: { show: true, title: 'more', source: 'lds', instant: false },
	creative: { show: false },
};

const KEYWORD: NamePulseResultsLayout = {
	mode: 'keyword',
	baseName: 'coffeeshop',
	wordCount: 2,
	showFilter: true,
	showBanner: true,
	showFqdnCard: false,
	topResults: { show: true, style: 'card', instant: true },
	exactGrid: { show: true, instant: true },
	suggestions: { show: true, title: 'related', source: 'keyword', instant: false },
	creative: { show: false },
};

describe( 'getResultsLayout', () => {
	it( 'renders nothing for an empty query', () => {
		expect( getResultsLayout( '' ) ).toEqual( EMPTY );
		expect( getResultsLayout( '   ' ) ).toEqual( EMPTY );
	} );

	it( 'renders the FQDN card, compact top results, the grid and "More suggestions" for coffee.com', () => {
		expect( getResultsLayout( 'Coffee.COM' ) ).toEqual( {
			mode: 'fqdn',
			baseName: 'coffee',
			wordCount: 1,
			fqdn: { baseName: 'coffee', tld: 'com', fullDomain: 'coffee.com' },
			showFilter: true,
			showBanner: true,
			showFqdnCard: true,
			topResults: { show: true, style: 'compact', instant: true },
			exactGrid: { show: true, instant: true },
			suggestions: { show: true, title: 'more', source: 'lds', instant: false },
			creative: { show: false },
		} );
	} );

	it( 'renders top cards, the grid and "More suggestions" for one word', () => {
		expect( getResultsLayout( ' Coffee! ' ) ).toEqual( SINGLE );
	} );

	it( 'renders top cards, the grid and keyword "Related matches" for two words', () => {
		expect( getResultsLayout( 'Coffee Shop' ) ).toEqual( KEYWORD );
	} );

	it( 'renders top cards, the grid and keyword "Related matches" for three words', () => {
		expect( getResultsLayout( 'Coffee  Shop  NYC!' ) ).toEqual( {
			...KEYWORD,
			baseName: 'coffeeshopnyc',
			wordCount: 3,
		} );
	} );

	it( 'hides the grid and adds delayed AI top results and creative matches for four words', () => {
		expect( getResultsLayout( 'a blog about coffee' ) ).toEqual( {
			mode: 'ai',
			baseName: 'ablogaboutcoffee',
			wordCount: 4,
			showFilter: true,
			showBanner: true,
			showFqdnCard: false,
			topResults: { show: true, style: 'card', instant: false },
			exactGrid: { show: false, instant: false },
			suggestions: { show: true, title: 'related', source: 'keyword', instant: false },
			creative: { show: true },
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

	it( 'differs between coffee.com and coffee only in mode, fqdn and top results style', () => {
		const { fqdn, ...fqdnLayout } = getResultsLayout( 'coffee.com' );

		expect( fqdn ).toEqual( { baseName: 'coffee', tld: 'com', fullDomain: 'coffee.com' } );
		expect( fqdnLayout ).toEqual( {
			...getResultsLayout( 'coffee' ),
			mode: 'fqdn',
			showFqdnCard: true,
			topResults: { show: true, style: 'compact', instant: true },
		} );
	} );

	it( 'keeps a single word whose sanitized keyword count is one in single mode', () => {
		expect( getResultsLayout( 'coffee !!!' ) ).toEqual( SINGLE );
	} );

	it( 'only detects FQDNs against the given TLD list', () => {
		expect( getResultsLayout( 'coffee.zzz', [ 'zzz' ] ).mode ).toBe( 'fqdn' );
		expect( getResultsLayout( 'coffee.zzz', [ 'com' ] ) ).toEqual( {
			...SINGLE,
			baseName: 'coffeezzz',
		} );
	} );
} );
