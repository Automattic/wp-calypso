/**
 * @jest-environment jsdom
 */
import wpcom from 'calypso/lib/wp';
import { closeLegacyMigration } from '../controller';

jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn(), post: jest.fn() } } ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: () => ( { ID: 123, slug: 'example.com' } ),
} ) );

describe( 'closeLegacyMigration', () => {
	const originalLocation = Object.getOwnPropertyDescriptor( window, 'location' );
	const context = { params: { site: 'example.com' }, store: { getState: () => ( {} ) } };
	let locationReplace;

	beforeEach( () => {
		jest.clearAllMocks();
		wpcom.req.post.mockResolvedValue( {} );
		locationReplace = jest.fn();
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: { replace: locationReplace },
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	it.each( [
		[ 'done', '/home/example.com' ],
		[ 'error', '/setup/site-migration?siteSlug=example.com' ],
	] )( 'resets a %s migration and leaves for %s', async ( status, destination ) => {
		wpcom.req.get.mockResolvedValue( { status } );
		await closeLegacyMigration( { ...context }, jest.fn() );
		expect( wpcom.req.post ).toHaveBeenCalledWith( {
			path: '/sites/123/reset-migration',
			apiNamespace: 'wpcom/v2',
		} );
		expect( locationReplace ).toHaveBeenCalledWith( destination );
	} );

	it.each( [ 'backing-up-queued', 'restoring', 'in-progress' ] )(
		'leaves a %s migration alone',
		async ( status ) => {
			wpcom.req.get.mockResolvedValue( { status } );
			const next = jest.fn();
			await closeLegacyMigration( { ...context }, next );
			expect( wpcom.req.post ).not.toHaveBeenCalled();
			expect( locationReplace ).not.toHaveBeenCalled();
			expect( next ).toHaveBeenCalled();
		}
	);

	it( 'stays put without resetting when the status request fails', async () => {
		wpcom.req.get.mockRejectedValue( new Error( 'Service unavailable' ) );
		const next = jest.fn();
		await closeLegacyMigration( { ...context }, next );
		expect( wpcom.req.post ).not.toHaveBeenCalled();
		expect( locationReplace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );
} );
