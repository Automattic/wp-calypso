/**
 * @vitest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { vi } from 'vitest';
import { isKnownReaderRoute, readerPage } from 'calypso/reader/lib/reader-router';
import registerConversationsRoutes from '../index';

vi.mock( 'calypso/reader/lib/reader-router', async () => {
	const actual = await vi.importActual( 'calypso/reader/lib/reader-router' );
	return { ...actual, readerPage: vi.fn( actual.readerPage ) };
} );

describe( 'conversations routes', () => {
	// Vitest clears mock calls before each test, so keep the routes registered here.
	let routes;

	beforeAll( () => {
		registerConversationsRoutes();
		routes = [ ...readerPage.mock.calls ];
	} );

	it.each( [
		'/reader/conversations',
		'/reader/conversations/a8c',
		'/reader/conversations/inbox',
		'/reader/conversations/inbox/1/2',
	] )( 'keeps %s out of the Reader 404 catch-all', ( path ) => {
		expect( isKnownReaderRoute( path ) ).toBe( true );
	} );

	it.each( [ '/reader/conversations', '/reader/conversations/a8c' ] )(
		'redirects %s to the inbox',
		( path ) => {
			const redirect = vi.spyOn( page, 'redirect' ).mockImplementation( () => {} );
			const [ , handler ] = routes.find( ( [ route ] ) => route === path );

			handler();

			expect( redirect ).toHaveBeenCalledWith( '/reader/conversations/inbox' );
			redirect.mockRestore();
		}
	);
} );
