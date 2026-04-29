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

import page from '@automattic/calypso-router';
import { atmosphereThread } from '../controller';

const validDid = 'did:plc:abc234567defghi234567jkl';
const validRkey = '3kabcdefghijk';

function makeContext( params: Record< string, string > ) {
	return { params, primary: null } as unknown as Parameters< typeof atmosphereThread >[ 0 ];
}

beforeEach( () => {
	mockNext.mockReset();
	jest.mocked( page.redirect ).mockReset();
} );

describe( 'atmosphereThread controller', () => {
	it( 'sets context.primary and calls next on valid input', () => {
		const ctx = makeContext( { id: '7', did: validDid, rkey: validRkey } );
		atmosphereThread( ctx, mockNext );
		expect( ctx.primary ).not.toBeNull();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'redirects to /reader/atmosphere when id is non-finite', () => {
		const ctx = makeContext( { id: 'NaN', did: validDid, rkey: validRkey } );
		atmosphereThread( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/atmosphere' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'redirects to /reader/atmosphere/:id on invalid did', () => {
		const ctx = makeContext( { id: '7', did: 'did:bad:UPPERCASE', rkey: validRkey } );
		atmosphereThread( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/atmosphere/7' );
	} );

	it( 'redirects on did:web inputs that aren’t hostname-shaped', () => {
		const ctx = makeContext( { id: '7', did: 'did:web:.', rkey: validRkey } );
		atmosphereThread( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/atmosphere/7' );
	} );

	it( 'accepts a valid did:web', () => {
		const ctx = makeContext( { id: '7', did: 'did:web:example.com', rkey: validRkey } );
		atmosphereThread( ctx, mockNext );
		expect( ctx.primary ).not.toBeNull();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'redirects to /reader/atmosphere/:id on invalid rkey', () => {
		const ctx = makeContext( { id: '7', did: validDid, rkey: 'BAD' } );
		atmosphereThread( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/atmosphere/7' );
	} );

	it( 'redirects to /reader when feature flag is off', () => {
		const config = jest.requireMock( '@automattic/calypso-config' ) as {
			isEnabled: jest.Mock;
		};
		config.isEnabled.mockReturnValueOnce( false );
		const ctx = makeContext( { id: '7', did: validDid, rkey: validRkey } );
		atmosphereThread( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );
} );
