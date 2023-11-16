import getNetworkSites from 'calypso/state/selectors/get-network-sites';
import isConnectedSecondaryNetworkSite from 'calypso/state/selectors/is-connected-secondary-network-site';
import { getSitesWithSecondarySites } from '../get-sites-with-secondary-sites';

jest.mock( 'calypso/state/selectors/get-network-sites' );
jest.mock( 'calypso/state/selectors/is-connected-secondary-network-site' );

describe( 'getSitesWithSecondarySites', () => {
	beforeEach( () => {
		jest.resetAllMocks();
	} );

	it( 'does not return sites that are themselves secondary sites', () => {
		const fakeSite = {};
		isConnectedSecondaryNetworkSite.mockReturnValue( true );

		const results = getSitesWithSecondarySites( {}, [ fakeSite ] );
		expect( results.length ).toBe( 0 );
	} );

	it( 'returns all secondary sites belonging to a given main site', () => {
		const fakeMainSite = {};
		const fakeSecondarySite1 = { ID: 2 };
		const fakeSecondarySite2 = { ID: 3 };

		isConnectedSecondaryNetworkSite.mockReturnValue( false );
		getNetworkSites.mockReturnValue( [ fakeSecondarySite1, fakeSecondarySite2 ] );

		const [ result ] = getSitesWithSecondarySites( {}, [ fakeMainSite ] );
		expect( result.site ).toBe( fakeMainSite );
		expect( result.secondarySites.length ).toBe( 2 );
		expect( result.secondarySites ).toContain( fakeSecondarySite1 );
		expect( result.secondarySites ).toContain( fakeSecondarySite2 );
	} );
} );
