/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import { importLabRoute } from '../import-lab';

jest.mock( '@automattic/api-queries', () => ( {
	isAutomatticianQuery: jest.fn( () => ( { queryKey: [ 'is-automattician' ] } ) ),
	queryClient: { ensureQueryData: jest.fn() },
} ) );
jest.mock( '../root', () => {
	const { createRootRoute } = jest.requireActual( '@tanstack/react-router' );
	return { rootRoute: createRootRoute() };
} );

const beforeLoad = importLabRoute.options.beforeLoad;

if ( ! beforeLoad ) {
	throw new Error( 'Import Lab route must define an access guard.' );
}

describe( 'Import Lab route access', () => {
	const ensureQueryData = jest.mocked( queryClient.ensureQueryData );

	afterEach( () => {
		ensureQueryData.mockReset();
	} );

	it( 'skips the employee query during route preloading', async () => {
		await beforeLoad( { cause: 'preload' } as never );

		expect( ensureQueryData ).not.toHaveBeenCalled();
	} );

	it( 'allows Automatticians to enter', async () => {
		ensureQueryData.mockResolvedValue( true as never );

		await expect( beforeLoad( { cause: 'enter' } as never ) ).resolves.toBeUndefined();
	} );

	it( 'redirects other users to the sites dashboard', async () => {
		ensureQueryData.mockResolvedValue( false as never );

		await expect( beforeLoad( { cause: 'enter' } as never ) ).rejects.toMatchObject( {
			to: '/sites',
			search: { flash: 'route-not-allowed' },
		} );
	} );
} );
