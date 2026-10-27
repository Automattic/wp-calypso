import { filterNamePulseSuggestions } from '../apply-filter';
import { NamePulseDomainStatus, type NamePulseDomainResult } from '../types';

const row = ( domainName: string, suffix: string ): NamePulseDomainResult => ( {
	domain_name: domainName,
	suffix,
	status: NamePulseDomainStatus.AVAILABLE,
	source: 'keyword',
} );

const SUGGESTIONS = [
	row( 'icecream.best', 'best' ),
	row( 'creamyice.com', 'com' ),
	row( 'icecreamshop.com', 'com' ),
	row( 'icecream.co.uk', 'co.uk' ),
	row( 'scoops.blog', 'blog' ),
];

describe( 'filterNamePulseSuggestions', () => {
	it( 'returns the same rows when no ending is selected', () => {
		expect( filterNamePulseSuggestions( SUGGESTIONS, [] ) ).toBe( SUGGESTIONS );
	} );

	it( 'keeps the rows with a selected ending, multi-level aware', () => {
		expect(
			filterNamePulseSuggestions( SUGGESTIONS, [ 'com', 'co.uk' ] ).map(
				( result ) => result.domain_name
			)
		).toEqual( [ 'creamyice.com', 'icecreamshop.com', 'icecream.co.uk' ] );
	} );
} );
