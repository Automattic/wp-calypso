import { shouldProvideReasonToClearAtomicCache } from 'calypso/state/selectors/should-provide-reason-to-clear-atomic-cache';

const ONE_DAY_IN_MILLISECONDS = 86400 * 1000;
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

describe( 'shouldProvideReasonToClearAtomicCache', () => {
	beforeAll( () => {
		jest.useFakeTimers( 'modern' ).setSystemTime( TIMESTAMP );
	} );

	afterAll( () => {
		jest.useRealTimers();
	} );

	test( 'should return true if there is no stored timestamp', () => {
		expect(
			shouldProvideReasonToClearAtomicCache( generateState( { timestamp: null } ), SITE_ID )
		).toBe( true );
	} );

	test( 'should return true if the cache was cleared more than 24 hours ago', () => {
		expect(
			shouldProvideReasonToClearAtomicCache(
				generateState( { timestamp: TIMESTAMP - ONE_DAY_IN_MILLISECONDS - ONE_SECOND } ),
				SITE_ID
			)
		).toBe( true );
	} );

	test( 'should return false if the cache was cleared less than 24 hours ago', () => {
		expect(
			shouldProvideReasonToClearAtomicCache(
				generateState( { timestamp: TIMESTAMP - ONE_DAY_IN_MILLISECONDS } ),
				SITE_ID
			)
		).toBe( false );
	} );
} );
