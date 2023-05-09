import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';

describe( 'hasLoadedSites()', () => {
	it( 'should return false if site items are null', () => {
		expect( hasLoadedSites( { sites: { items: null } } ) ).toBe( false );
	} );
	it( 'should return true if site items are empty', () => {
		expect( hasLoadedSites( { sites: { items: {} } } ) ).toBe( true );
	} );
	it( 'should return true if sites exist in state', () => {
		expect( hasLoadedSites( { sites: { items: { 1: { ID: 1 } } } } ) ).toBe( true );
	} );
} );
