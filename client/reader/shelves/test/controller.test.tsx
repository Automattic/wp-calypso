/**
 * @jest-environment jsdom
 */

const mockNext = jest.fn();

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: jest.fn() },
} ) );

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn().mockReturnValue( true ),
} ) );

import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { shelves } from '../controller';
import type { ReactElement } from 'react';

function makeContext( params: Record< string, string > = {} ) {
	return { params, query: {}, primary: null } as unknown as Parameters< typeof shelves >[ 0 ];
}

beforeEach( () => {
	mockNext.mockReset();
	jest.mocked( page.redirect ).mockReset();
	jest.mocked( isEnabled ).mockReturnValue( true );
} );

describe( 'shelves controller', () => {
	it( 'sets context.primary and calls next when reader/shelves is enabled', () => {
		const ctx = makeContext();
		shelves( ctx, mockNext );
		expect( ctx.primary ).not.toBeNull();
		expect( ( ctx.primary as ReactElement ).props ).toMatchObject( { tab: 'feed' } );
		expect( mockNext ).toHaveBeenCalled();
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'redirects to /reader without mounting the view when reader/shelves is off', () => {
		jest.mocked( isEnabled ).mockReturnValue( false );
		const ctx = makeContext();
		shelves( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader' );
		expect( ctx.primary ).toBeNull();
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'mounts the view on the discover tab and forwards the parsed tab', () => {
		const ctx = makeContext( { slug: 'work', tab: 'discover' } );
		shelves( ctx, mockNext );
		expect( ctx.primary ).not.toBeNull();
		expect( ( ctx.primary as ReactElement ).props ).toMatchObject( {
			slug: 'work',
			tab: 'discover',
		} );
		expect( mockNext ).toHaveBeenCalled();
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'redirects an unknown tab slug to the shelf’s canonical feed path', () => {
		const ctx = makeContext( { slug: 'work', tab: 'bogus' } );
		shelves( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/shelves/work' );
		expect( ctx.primary ).toBeNull();
		expect( mockNext ).not.toHaveBeenCalled();
	} );
} );
