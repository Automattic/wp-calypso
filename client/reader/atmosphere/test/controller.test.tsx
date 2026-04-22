/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
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
		atmosphereController( { path: '/reader/atmosphere' } as unknown as PageJS.Context, next );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'calls next when flag is on', () => {
		( isEnabled as jest.Mock ).mockReturnValue( true );
		const next = jest.fn();
		const context = { path: '/reader/atmosphere', primary: null } as unknown as PageJS.Context;
		atmosphereController( context, next );
		expect( next ).toHaveBeenCalled();
	} );
} );
