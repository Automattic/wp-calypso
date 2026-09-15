/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import { switchRoute } from '../switch';

jest.mock( '@automattic/api-queries', () => ( {
	isAutomatticianQuery: jest.fn( () => ( { queryKey: [ 'is-automattician' ] } ) ),
	queryClient: { ensureQueryData: jest.fn() },
} ) );
jest.mock( '../root', () => {
	const { createRootRoute } = jest.requireActual( '@tanstack/react-router' );
	return { rootRoute: createRootRoute() };
} );

const beforeLoad = switchRoute.options.beforeLoad;

if ( ! beforeLoad ) {
	throw new Error( 'Switch route must define an access guard.' );
}

describe( 'Switch route access', () => {
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
