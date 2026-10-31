import wpcom from 'calypso/lib/wp';
import { fetchEligibility, generateRedesign } from '../api';

jest.mock( '@automattic/calypso-config', () => ( { isEnabled: () => false } ) );
jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn(), post: jest.fn() } } ) );

describe( 'generateRedesign', () => {
	afterEach( () => jest.clearAllMocks() );

	it( 'asks for a new batch only when told to', async () => {
		await generateRedesign( 1, 'rd_1' );
		await generateRedesign( 1, 'rd_1', true );

		const bodies = jest.mocked( wpcom.req.post ).mock.calls.map( ( args: unknown[] ) => args[ 2 ] );
		expect( bodies ).toEqual( [
			{ brief_confirmed: true },
			{ brief_confirmed: true, new_batch: true },
		] );
	} );
} );

describe( 'fetchEligibility', () => {
	it( 'reads the eligibility route of the site', async () => {
		await fetchEligibility( 7 );
		expect( wpcom.req.get ).toHaveBeenCalledWith(
			{ apiNamespace: 'wpcom/v2', path: '/sites/7/site-redesign/eligibility' },
			{}
		);
	} );
} );
