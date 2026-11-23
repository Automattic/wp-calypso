/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { isKnownReaderRoute, readerPage } from 'calypso/reader/lib/reader-router';
import registerConversationsRoutes from '../index';

jest.mock( 'calypso/reader/lib/reader-router', () => {
	const actual = jest.requireActual( 'calypso/reader/lib/reader-router' );
	return { ...actual, readerPage: jest.fn( actual.readerPage ) };
} );

describe( 'conversations routes', () => {
	beforeAll( () => {
		registerConversationsRoutes();
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
			const redirect = jest.spyOn( page, 'redirect' ).mockImplementation( () => {} );
			const [ , handler ] = readerPage.mock.calls.find( ( [ route ] ) => route === path );

			handler();

			expect( redirect ).toHaveBeenCalledWith( '/reader/conversations/inbox' );
			redirect.mockRestore();
		}
	);
} );
