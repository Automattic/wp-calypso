/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import wpcom from 'calypso/lib/wp';
import { closeLegacyMigration } from '../controller';

jest.mock( '@automattic/calypso-router' );
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

	it( 'resets a finished migration and opens the site', async () => {
		wpcom.req.get.mockResolvedValue( { status: 'done' } );
		await closeLegacyMigration( { ...context }, jest.fn() );
		expect( wpcom.req.post ).toHaveBeenCalledWith( {
			path: '/sites/123/reset-migration',
			apiNamespace: 'wpcom/v2',
		} );
		expect( page.redirect ).toHaveBeenCalledWith( '/home/example.com' );
	} );

	it( 'resets a failed migration and opens the migration flow', async () => {
		wpcom.req.get.mockResolvedValue( { status: 'error' } );
		await closeLegacyMigration( { ...context }, jest.fn() );
		expect( wpcom.req.post ).toHaveBeenCalled();
		expect( locationReplace ).toHaveBeenCalledWith( '/setup/site-migration?siteSlug=example.com' );
	} );

	it( 'leaves a running migration alone', async () => {
		wpcom.req.get.mockResolvedValue( { status: 'restoring' } );
		const next = jest.fn();
		await closeLegacyMigration( { ...context }, next );
		expect( wpcom.req.post ).not.toHaveBeenCalled();
		expect( locationReplace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );
} );
