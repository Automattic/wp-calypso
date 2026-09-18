import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getThankYouError } from '../get-thank-you-error';

const defaults = {
	transferStatus: transferStates.ACTIVE,
	hasTimedOut: false,
	isPageReady: false,
};

describe( 'getThankYouError', () => {
	test.each( [
		transferStates.ERROR,
		transferStates.FAILURE,
		transferStates.CONFLICTS,
		transferStates.REVERTED,
	] )( 'reports transfer failure for %s', ( transferStatus ) => {
		expect( getThankYouError( { ...defaults, transferStatus } ) ).toBe( 'transfer-failed' );
	} );

	test.each( [
		[ 'client timeout', { transferStatus: transferStates.CLIENT_TIMEOUT } ],
		[ 'page deadline', { hasTimedOut: true } ],
	] )( 'reports timeout for %s', ( _label, overrides ) => {
		expect( getThankYouError( { ...defaults, ...overrides } ) ).toBe( 'timeout' );
	} );

	it( 'prioritizes transfer failure over timeout', () => {
		expect(
			getThankYouError( {
				...defaults,
				transferStatus: transferStates.FAILURE,
				hasTimedOut: true,
			} )
		).toBe( 'transfer-failed' );
	} );

	it( 'suppresses stale errors once the page is ready', () => {
		expect(
			getThankYouError( {
				...defaults,
				transferStatus: transferStates.FAILURE,
				hasTimedOut: true,
				isPageReady: true,
			} )
		).toBeNull();
	} );

	it( 'returns null while work remains in progress', () => {
		expect( getThankYouError( defaults ) ).toBeNull();
	} );
} );
