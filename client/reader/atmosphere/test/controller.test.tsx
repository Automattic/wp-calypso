/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import page, { type Context } from '@automattic/calypso-router';
import { atmosphereController } from '../controller';

jest.mock( '@automattic/calypso-config', () => ( {
	...jest.requireActual( '@automattic/calypso-config' ),
	isEnabled: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: jest.fn() },
} ) );

describe( 'atmosphereController', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'redirects to /reader when flag is off', () => {
		( isEnabled as jest.Mock ).mockReturnValue( false );
		const next = jest.fn();
		atmosphereController( { path: '/reader/atmosphere' } as unknown as Context, next );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'calls next and sets context.primary when flag is on', () => {
		( isEnabled as jest.Mock ).mockReturnValue( true );
		const next = jest.fn();
		const context = { path: '/reader/atmosphere', primary: null } as unknown as Context;
		atmosphereController( context, next );
		expect( next ).toHaveBeenCalled();
		expect( context.primary ).not.toBeNull();
	} );
} );
