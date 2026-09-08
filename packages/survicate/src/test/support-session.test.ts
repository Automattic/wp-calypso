/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/calypso-support-session', () => ( {
	isSupportSession: jest.fn( () => false ),
	isSupportSessionProxy: jest.fn( () => false ),
} ) );

import { isSupportSession, isSupportSessionProxy } from '@automattic/calypso-support-session';
import { isInSupportSession } from '../support-session';

const mockIsSupportSession = isSupportSession as jest.Mock;
const mockIsSupportSessionProxy = isSupportSessionProxy as jest.Mock;

describe( 'isInSupportSession', () => {
	beforeEach( () => {
		mockIsSupportSession.mockReturnValue( false );
		mockIsSupportSessionProxy.mockReturnValue( false );
	} );

	test( 'should be false for an ordinary user session', () => {
		expect( isInSupportSession() ).toBe( false );
	} );

	test( 'should be true during a support session', () => {
		mockIsSupportSession.mockReturnValue( true );
		expect( isInSupportSession() ).toBe( true );
	} );

	test( 'should be true during a support session proxy view', () => {
		mockIsSupportSessionProxy.mockReturnValue( true );
		expect( isInSupportSession() ).toBe( true );
	} );
} );
