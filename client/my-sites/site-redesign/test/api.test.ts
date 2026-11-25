import { vi } from 'vitest';
import wpcom from 'calypso/lib/wp';
import { generateRedesign } from '../api';

vi.mock( '@automattic/calypso-config', () =>
	( ( m ) => ( { ...m, default: m } ) )( { isEnabled: () => false } )
);
vi.mock( 'calypso/lib/wp', () =>
	( ( m ) => ( { ...m, default: m } ) )( { req: { get: vi.fn(), post: vi.fn() } } )
);

describe( 'generateRedesign', () => {
	afterEach( () => vi.clearAllMocks() );

	it( 'asks for a new batch only when told to', async () => {
		await generateRedesign( 1, 'rd_1' );
		await generateRedesign( 1, 'rd_1', true );

		const bodies = vi.mocked( wpcom.req.post ).mock.calls.map( ( args: unknown[] ) => args[ 2 ] );
		expect( bodies ).toEqual( [
			{ brief_confirmed: true },
			{ brief_confirmed: true, new_batch: true },
		] );
	} );
} );
