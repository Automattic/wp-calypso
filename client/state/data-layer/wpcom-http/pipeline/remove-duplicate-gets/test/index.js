import {
	addResponder,
	applyDuplicatesHandlers,
	buildKey,
	clearQueue,
	removeDuplicateGets,
} from '../';

const failer = { type: 'FAIL' };
const filler = { type: 'FILL' };
const succeeder = { type: 'SUCCEED' };

const getSites = {
	method: 'GET',
	path: '/sites',
	apiVersion: 'v1',
	onSuccess: succeeder,
	onFailure: failer,
};

const getPosts = {
	method: 'GET',
	path: '/sites/posts',
	apiVersion: 'v1.2',
	onSuccess: succeeder,
	onFailure: failer,
};

const postLike = {
	method: 'POST',
	path: '/sites/posts/like',
	apiVersion: 'v1.4',
	onSuccess: succeeder,
	onFailure: failer,
};

/**
 * Make a quick clone of an object for testing
 *
 * @param {Object} o object to shallow-clone
 * @returns {Object} cloned object
 */
const cp = ( o ) => ( { ...o } );

describe( '#buildKey', () => {
	test( 'should collapse "duplicate" requests', () => {
		const duplicates = [
			[
				{ path: '/', apiNamespace: 'wpcom/v2', query: { id: 1, limit: 5 } },
				{ path: '/', apiNamespace: 'wpcom/v2', query: { limit: 5, id: 1 } },
			],
			[ { path: '/' }, { path: '/', query: undefined } ],
			[ { path: '/' }, { path: '/', query: {} } ],
			[ { path: '/' }, { path: '/', apiNamespace: undefined } ],
			[
				{ path: '/', onSuccess: succeeder },
				{ path: '/', onSuccess: filler },
			],
		];

		duplicates.forEach( ( [ a, b ] ) => expect( buildKey( a ) ).toEqual( buildKey( b ) ) );
	} );

	test( 'should differentiate "unique" requests', () => {
		const uniques = [
			[
				{ path: '/', apiNamespace: 'wp/v1' },
				{ path: '/', apiNamespace: 'wpcom/v1' },
			],
			[
				{ path: '/', apiNamespace: 'wp/v1' },
				{ path: '/', apiVersion: 'wp/v1' },
			],
			[ { path: '/' }, { path: '/a' } ],
			[
				{ path: '/', query: { id: 1 } },
				{ path: '/', query: { id: 2 } },
			],
		];

		uniques.forEach( ( [ a, b ] ) => expect( buildKey( a ) ).not.toEqual( buildKey( b ) ) );
	} );
} );

describe( '#addResponder', () => {
	test( 'should add an `onFailure` action to an empty list', () => {
		const union = addResponder( {}, { onFailure: cp( failer ) } );

		expect( union.failures ).toEqual( [ failer ] );
		expect( union.successes ).toHaveLength( 0 );
	} );

	test( 'should add an `onSuccess` action to an empty list', () => {
		const union = addResponder( {}, { onSuccess: cp( succeeder ) } );

		expect( union.failures ).toHaveLength( 0 );
		expect( union.successes ).toEqual( [ succeeder ] );
	} );

	test( 'should add a "unique" action to an existing list', () => {
		const union = addResponder( { successes: [ cp( succeeder ) ] }, { onSuccess: cp( filler ) } );

		expect( union.successes ).toEqual( [ succeeder, filler ] );
	} );

	test( 'should merge "duplicate" actions to an existing list', () => {
		const union = addResponder(
			{ successes: [ cp( succeeder ) ] },
			{ onSuccess: cp( succeeder ) }
		);

		expect( union.successes ).toEqual( [ succeeder ] );
	} );

	test( 'should add both `onSuccess` and `onFailure`', () => {
		const union = addResponder(
			{
				failures: [ cp( failer ) ],
				successes: [ cp( succeeder ) ],
			},
			{
				onFailure: cp( filler ),
				onSuccess: cp( filler ),
			}
		);

		expect( union.failures ).toEqual( [ failer, filler ] );
		expect( union.successes ).toEqual( [ succeeder, filler ] );
	} );
} );

describe( '#removeDuplicateGets', () => {
	beforeEach( clearQueue );

	test( 'should pass through non-GET requests', () => {
		const primed = removeDuplicateGets( { nextRequest: cp( postLike ) } );

		expect( primed.nextRequest ).toEqual( postLike );

		const processed = removeDuplicateGets( { nextRequest: cp( postLike ) } );

		expect( processed.nextRequest ).toEqual( postLike );
	} );

	test( 'should pass through new requests', () => {
		const processed = removeDuplicateGets( { nextRequest: cp( getSites ) } );

		expect( processed.nextRequest ).toEqual( getSites );
	} );

	test( 'should pass through "unique" requests', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const processed = removeDuplicateGets( { nextRequest: cp( getPosts ) } );

		expect( processed.nextRequest ).toEqual( getPosts );
	} );

	test( 'should drop "duplicate" requests', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const processed = removeDuplicateGets( { nextRequest: cp( getSites ) } );

		expect( processed.nextRequest ).toBeNull();
	} );
} );

describe( '#applyDuplicateHandlers', () => {
	beforeAll( clearQueue );

	test( 'should return new requests', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const processed = applyDuplicatesHandlers( { originalRequest: cp( getSites ) } );

		expect( processed.failures ).toEqual( [ getSites.onFailure ] );
		expect( processed.successes ).toEqual( [ getSites.onSuccess ] );
	} );

	test( 'should collapse "duplicate" requests having same responders', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const processed = applyDuplicatesHandlers( { originalRequest: cp( getSites ) } );

		expect( processed.failures ).toEqual( [ getSites.onFailure ] );
		expect( processed.successes ).toEqual( [ getSites.onSuccess ] );
	} );

	test( 'should spread "duplicate" requests having different responders', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );
		removeDuplicateGets( { nextRequest: { ...getSites, onSuccess: cp( filler ) } } );

		const processed = applyDuplicatesHandlers( { originalRequest: cp( getSites ) } );

		expect( processed.failures ).toEqual( [ getSites.onFailure ] );
		expect( processed.successes ).toEqual( [ getSites.onSuccess, filler ] );
	} );

	test( 'should pass through "unique" requests', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );
		removeDuplicateGets( { nextRequest: cp( getPosts ) } );

		const sites = applyDuplicatesHandlers( { originalRequest: cp( getSites ) } );

		expect( sites.failures ).toEqual( [ failer ] );
		expect( sites.successes ).toEqual( [ succeeder ] );

		const posts = applyDuplicatesHandlers( { originalRequest: cp( getPosts ) } );

		expect( posts.failures ).toEqual( [ failer ] );
		expect( posts.successes ).toEqual( [ succeeder ] );
	} );

	test( 'should pass through "duplicate" requests which never overlap', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const first = applyDuplicatesHandlers( { originalRequest: cp( getSites ) } );

		expect( first.failures ).toEqual( [ failer ] );
		expect( first.successes ).toEqual( [ succeeder ] );

		const { nextRequest } = removeDuplicateGets( { nextRequest: cp( getSites ) } );

		expect( nextRequest ).toEqual( getSites );

		const second = applyDuplicatesHandlers( { originalRequest: cp( getSites ) } );

		expect( second.failures ).toEqual( [ failer ] );
		expect( second.successes ).toEqual( [ succeeder ] );
	} );

	test( 'should not collapse non-GET requests', () => {
		removeDuplicateGets( { nextRequest: cp( postLike ) } );
		removeDuplicateGets( { nextRequest: cp( postLike ) } );

		const processed = applyDuplicatesHandlers( {
			failures: [ cp( postLike.onFailure ) ],
			originalRequest: cp( postLike ),
			successes: [ cp( postLike.onSuccess ) ],
		} );

		expect( processed.failures ).toEqual( [ postLike.onFailure ] );
		expect( processed.successes ).toEqual( [ postLike.onSuccess ] );
	} );

	test( 'should not wipe out previous responders in the pipeline', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const processed = applyDuplicatesHandlers( {
			failures: [ cp( filler ) ],
			originalRequest: cp( getSites ),
			successes: [ cp( filler ) ],
		} );

		expect( processed.failures ).toEqual( [ filler, getSites.onFailure ] );
		expect( processed.successes ).toEqual( [ filler, getSites.onSuccess ] );
	} );

	test( 'should combine previous responders with "duplicate" responders in the pipeline', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const processed = applyDuplicatesHandlers( {
			failures: [ cp( getSites.onFailure ) ],
			originalRequest: cp( getSites ),
			successes: [ cp( getSites.onSuccess ) ],
		} );

		expect( processed.failures ).toEqual( [ getSites.onFailure ] );
		expect( processed.successes ).toEqual( [ getSites.onSuccess ] );
	} );
} );
