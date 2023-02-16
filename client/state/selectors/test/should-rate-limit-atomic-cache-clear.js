import { shouldRateLimitAtomicCacheClear } from 'calypso/state/selectors/should-rate-limit-atomic-cache-clear';

const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000;
const ONE_SECOND = 1000;
const SITE_ID = 123;
const TIMESTAMP = 1234567890;

const generateState = ( { timestamp } ) => ( {
	atomicHosting: {
		[ SITE_ID ]: {
			lastCacheClearTimestamp: timestamp,
		},
	},
} );

describe( 'shouldRateLimitAtomicCacheClear', () => {
	beforeAll( () => {
		jest.useFakeTimers( 'modern' ).setSystemTime( TIMESTAMP );
	} );

	afterAll( () => {
		jest.useRealTimers();
	} );

	test( 'should return false if there is no stored timestamp', () => {
		expect( shouldRateLimitAtomicCacheClear( generateState( { timestamp: null } ), SITE_ID ) ).toBe(
			false
		);
	} );

	test( 'should return false if the cache was cleared more than a minute ago', () => {
		expect(
			shouldRateLimitAtomicCacheClear(
				generateState( { timestamp: TIMESTAMP - ONE_MINUTE_IN_MILLISECONDS - ONE_SECOND } ),
				SITE_ID
			)
		).toBe( false );
	} );

	test( 'should return true if the cache was cleared less than a minute ago', () => {
		expect(
			shouldRateLimitAtomicCacheClear(
				generateState( { timestamp: TIMESTAMP - ONE_MINUTE_IN_MILLISECONDS + ONE_SECOND } ),
				SITE_ID
			)
		).toBe( true );
	} );
} );
