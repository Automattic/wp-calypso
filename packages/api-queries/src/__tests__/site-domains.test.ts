import { setPrimaryDomain } from '@automattic/api-core';
import { MutationObserver } from '@tanstack/react-query';
import { type MockedFunction, type MockInstance, vi } from 'vitest';
import { queryClient } from '../query-client';
import { siteSetPrimaryDomainMutation } from '../site-domains';

vi.mock( '../query-client', async () => {
	const { QueryClient: QC } = ( await vi.importActual< typeof import( '@tanstack/react-query' ) >( '@tanstack/react-query' ) );
	return { queryClient: new QC() };
} );

vi.mock( '@automattic/api-core', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/api-core' ) >( '@automattic/api-core' ) ),
	setPrimaryDomain: vi.fn(),
} ) );

const mockSetPrimaryDomain = setPrimaryDomain as MockedFunction< typeof setPrimaryDomain >;
const SITE_ID = 123;

function mutate() {
	const observer = new MutationObserver( queryClient, siteSetPrimaryDomainMutation() );
	return observer.mutate( { siteId: SITE_ID, domain: 'example.com' } );
}

describe( 'siteSetPrimaryDomainMutation', () => {
	let invalidateQueries: MockInstance;

	beforeEach( () => {
		invalidateQueries = vi.spyOn( queryClient, 'invalidateQueries' );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		mockSetPrimaryDomain.mockReset();
	} );

	it( 're-fetches the site and its domains when WP Cloud rejects the change', async () => {
		mockSetPrimaryDomain.mockRejectedValue(
			Object.assign( new Error( 'Try again later.' ), {
				error: 'atomic_primary_domain_change_failed',
			} )
		);

		await expect( mutate() ).rejects.toThrow( 'Try again later.' );
		expect( invalidateQueries ).toHaveBeenCalledWith( {
			queryKey: [ 'site', SITE_ID, 'domains' ],
		} );
		expect( invalidateQueries ).toHaveBeenCalledWith( { queryKey: [ 'domains' ] } );
	} );

	it( 'leaves cached domains alone for other errors', async () => {
		mockSetPrimaryDomain.mockRejectedValue(
			Object.assign( new Error( 'Not active.' ), { error: 'domain_not_active' } )
		);

		await expect( mutate() ).rejects.toThrow( 'Not active.' );
		expect( invalidateQueries ).not.toHaveBeenCalled();
	} );

	it( 're-fetches after a successful change', async () => {
		mockSetPrimaryDomain.mockResolvedValue( undefined );

		await mutate();
		expect( invalidateQueries ).toHaveBeenCalledWith( { queryKey: [ 'domains' ] } );
	} );
} );
