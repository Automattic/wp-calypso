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
import { spaces } from '../controller';

function makeContext() {
	return { params: {}, query: {}, primary: null } as unknown as Parameters< typeof spaces >[ 0 ];
}

beforeEach( () => {
	mockNext.mockReset();
	jest.mocked( page.redirect ).mockReset();
	jest.mocked( isEnabled ).mockReturnValue( true );
} );

describe( 'spaces controller', () => {
	it( 'sets context.primary and calls next when reader/spaces is enabled', () => {
		const ctx = makeContext();
		spaces( ctx, mockNext );
		expect( ctx.primary ).not.toBeNull();
		expect( mockNext ).toHaveBeenCalled();
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	it( 'redirects to /reader without mounting the view when reader/spaces is off', () => {
		jest.mocked( isEnabled ).mockReturnValue( false );
		const ctx = makeContext();
		spaces( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader' );
		expect( ctx.primary ).toBeNull();
		expect( mockNext ).not.toHaveBeenCalled();
	} );
} );
