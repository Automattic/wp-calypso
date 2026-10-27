import { getSubscriberUserId } from '../use-subscribers-totals-query';

describe( 'getSubscriberUserId()', () => {
	test( 'returns the user id when ID differs from the subscription id (wpcom subscriber)', () => {
		expect( getSubscriberUserId( 266514373, 944012532 ) ).toBe( 266514373 );
	} );

	test( 'omits the user id when ID equals the subscription id (email-only subscriber)', () => {
		expect( getSubscriberUserId( 944012532, 944012532 ) ).toBeUndefined();
	} );

	test( 'omits the user id when ID is missing', () => {
		expect( getSubscriberUserId( undefined, 944012532 ) ).toBeUndefined();
		expect( getSubscriberUserId( 0, 944012532 ) ).toBeUndefined();
	} );
} );
