import { cacheSet, cacheGet, createMemcachedClient, removeMemcachedClient } from '../';

const TEST_ENV = 'test-memcached';
let MOCK_SERVER_MEMCACHED_ENABLED = true;
jest.mock( '@automattic/calypso-config', () => ( configKey ) => {
	if ( configKey === 'server_side_memcached' ) {
		return MOCK_SERVER_MEMCACHED_ENABLED;
	}
	if ( configKey === 'env_id' ) {
		return TEST_ENV;
	}
} );

let MOCK_SIMULATE_ERROR = false;
let MOCK_CACHE = {};
jest.mock( 'memjs', () => ( {
	Client: {
		create: () => ( {
			set: ( key, value ) => {
				if ( MOCK_SIMULATE_ERROR ) {
					throw new Error( 'Memcached set fail!!!' );
				}

				MOCK_CACHE[ key ] = value;
				return Promise.resolve( true );
			},
			get: ( key ) => {
				if ( MOCK_SIMULATE_ERROR ) {
					throw new Error( 'Memcached get fail!!!' );
				}
				return Promise.resolve( { value: MOCK_CACHE[ key ] } );
			},
		} ),
	},
} ) );

describe( 'server memcached client enabled', () => {
	beforeAll( () => {
		MOCK_SERVER_MEMCACHED_ENABLED = true;
		createMemcachedClient();
	} );
	afterEach( () => {
		MOCK_CACHE = {}; // Flush the cache.
		MOCK_SIMULATE_ERROR = false;
		MOCK_SERVER_MEMCACHED_ENABLED = true;
	} );

	it( 'should normalize cache keys with the environment', () => {
		cacheSet( 'foo', 'bar' );
		expect( MOCK_CACHE[ TEST_ENV + 'foo' ] ).toBeDefined();

		// Replaces whitespace with underscores.
		cacheSet( 'foo    howdy\ttest', 'bar' );
		expect( MOCK_CACHE[ TEST_ENV + 'foo_howdy_test' ] ).toBeDefined();
	} );

	it( 'should not allow null and undefined values to be set', async () => {
		const set1 = await cacheSet( 'foo', null );
		expect( MOCK_CACHE[ TEST_ENV + 'foo' ] ).toBeUndefined();
		expect( set1 ).toBe( false );

		const set2 = await cacheSet( 'bar', undefined );
		expect( set2 ).toBe( false );
	} );

	it( 'should serialize numbers, objects, and arrays on set', () => {
		cacheSet( 'foo1', 1 );
		cacheSet( 'foo2', { bar: 'baz' } );
		cacheSet( 'foo3', [ { test: 1 }, { test: 2 } ] );
		expect( MOCK_CACHE ).toEqual( {
			'test-memcachedfoo1': '1',
			'test-memcachedfoo2': '{"bar":"baz"}',
			'test-memcachedfoo3': '[{"test":1},{"test":2}]',
		} );
	} );

	it( 'should deserialize numbers, objects, and arrays on get', async () => {
		cacheSet( 'foo1', 1 );
		expect( await cacheGet( 'foo1' ) ).toEqual( 1 );

		cacheSet( 'foo2', { bar: 'baz' } );
		expect( await cacheGet( 'foo2' ) ).toEqual( { bar: 'baz' } );

		cacheSet( 'foo3', [ { test: 1 }, { test: 2 } ] );
		expect( await cacheGet( 'foo3' ) ).toEqual( [ { test: 1 }, { test: 2 } ] );
	} );

	it( 'should resolve undefined on get if value is not in cache', async () => {
		expect( await cacheGet( "this doesn't exist" ) ).toBeUndefined();
	} );

	it( 'should resolve undefined if an error occurs on cache get', async () => {
		// JSON.parse( { abc: 1 }.toString() ) will throw an error, which we don't want to crash the app.
		MOCK_CACHE[ TEST_ENV + 'foo' ] = { abc: 1 };
		expect( await cacheGet( 'foo' ) );
	} );

	it( 'should gracefully fail if an error occurs in the memjs lib', async () => {
		// Cache works for now.
		cacheSet( 'foo', 1 );
		expect( await cacheGet( 'foo' ) ).toBeDefined();

		// After an error occurs, cache get will always be undefined, and cache set will resolve to false.
		MOCK_SIMULATE_ERROR = true;
		expect( await cacheGet( 'foo' ) ).toBeUndefined();

		expect( await cacheSet( 'bar', 2 ) ).toBe( false );
	} );
} );

describe( 'server memcached client disabled', () => {
	beforeEach( () => {
		removeMemcachedClient();
		MOCK_CACHE = {}; // Flush the cache.
	} );

	it( 'should not create a client if not on the server', () => {
		MOCK_SERVER_MEMCACHED_ENABLED = true;
		const documentBefore = global.document; // Probably just undefined, but let's be safe.
		global.document = true;
		expect( createMemcachedClient() ).toBe( false );
		global.document = documentBefore;
	} );

	it( 'should not create a client if disabled in config', () => {
		MOCK_SERVER_MEMCACHED_ENABLED = false;
		const documentBefore = global.document; // Probably just undefined, but let's be safe.
		global.document = undefined;
		expect( createMemcachedClient() ).toBe( false );
		global.document = documentBefore;
	} );

	it( 'should not create a client if client exists', () => {
		MOCK_SERVER_MEMCACHED_ENABLED = true;
		expect( createMemcachedClient() ).toBe( true );
		// Now that it exists, it should not create a new one.
		expect( createMemcachedClient() ).toBe( false );
	} );

	it( 'should not allow cache set when client does not exist', async () => {
		MOCK_SERVER_MEMCACHED_ENABLED = false;
		createMemcachedClient();
		expect( await cacheSet( 'foo', 'bar' ) ).toBe( false );
	} );

	it( 'should not allow cache get when client does not exist', async () => {
		MOCK_SERVER_MEMCACHED_ENABLED = true;
		createMemcachedClient();
		await cacheSet( 'foo', 'bar' );
		expect( await cacheGet( 'foo' ) ).toBe( 'bar' );

		removeMemcachedClient();
		// While our mock cache still has the value, the client is gone, so it should return undefined.
		expect( MOCK_CACHE[ TEST_ENV + 'foo' ] ).toBeDefined();
		expect( await cacheGet( 'foo', 'bar' ) ).toBe( undefined );
	} );
} );
