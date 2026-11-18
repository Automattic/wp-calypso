/**
 * @jest-environment jsdom
 */
import { isKnownReaderRoute } from 'calypso/reader/lib/reader-router';
import registerConversationsRoutes from '../index';

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
} );
