/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
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

describe( '#buildKey', () => {
	it( 'should collapse "duplicate" requests', () => {
		const duplicates = [ [
			{ path: '/', apiNamespace: 'wpcom/v2', query: { id: 1, limit: 5 } },
			{ path: '/', apiNamespace: 'wpcom/v2', query: { limit: 5, id: 1 } },
		], [
			{ path: '/' },
			{ path: '/', query: undefined },
		], [
			{ path: '/' },
			{ path: '/', query: {} },
		], [
			{ path: '/' },
			{ path: '/', apiNamespace: undefined }
		], [
			{ path: '/', onSuccess: succeeder },
			{ path: '/', onSuccess: filler },
		] ];

		duplicates.forEach( ( [ a, b ] ) => expect( buildKey( a ) ).to.equal( buildKey( b ) ) );
	} );

	it( 'should differentiate "unique" requests', () => {
		const uniques = [ [
			{ path: '/', apiNamespace: 'wp/v1' },
			{ path: '/', apiNamespace: 'wpcom/v1' },
		], [
			{ path: '/', apiNamespace: 'wp/v1' },
			{ path: '/', apiVersion: 'wp/v1' },
		], [
			{ path: '/' },
			{ path: '/a' },
		], [
			{ path: '/', query: { id: 1 } },
			{ path: '/', query: { id: 2 } },
		] ];

		uniques.forEach( ( [ a, b ] ) => expect( buildKey( a ) ).to.not.equal( buildKey( b ) ) );
	} );
} );

describe( '#addResponder', () => {
	it( 'should add an `onFailure` action to an empty list', () => {
		const union = addResponder( {}, { onFailure: failer } );

		expect( union.failures ).to.eql( [ failer ] );
		expect( union.successes ).to.be.empty;
	} );

	it( 'should add an `onSuccess` action to an empty list', () => {
		const union = addResponder( {}, { onSuccess: succeeder } );

		expect( union.failures ).to.be.empty;
		expect( union.successes ).to.eql( [ succeeder ] );
	} );

	it( 'should add a "unique" action to an existing list', () => {
		const union = addResponder( { successes: [ succeeder ] }, { onSuccess: filler } );

		expect( union.successes ).to.eql( [ succeeder, filler ] );
	} );

	it( 'should merge "duplicate" actions to an existing list', () => {
		const union = addResponder( { successes: [ succeeder ] }, { onSuccess: succeeder } );

		expect( union.successes ).to.eql( [ succeeder ] );
	} );

	it( 'should add both `onSuccess` and `onFailure`', () => {
		const union = addResponder( {
			failures: [ failer ],
			successes: [ succeeder ],
		}, {
			onFailure: filler,
			onSuccess: filler,
		} );

		expect( union.failures ).to.eql( [ failer, filler ] );
		expect( union.successes ).to.eql( [ succeeder, filler ] );
	} );
} );

describe( '#removeDuplicateGets', () => {
	before( clearQueue );

	it( 'should pass through non-GET requests', () => {
		const primed = removeDuplicateGets( { nextRequest: postLike } );

		expect( primed.nextRequest ).to.eql( postLike );

		const processed = removeDuplicateGets( { nextRequest: postLike } );

		expect( processed.nextRequest ).to.eql( postLike );
	} );

	it( 'should pass through new requests', () => {
		const processed = removeDuplicateGets( { nextRequest: getSites } );

		expect( processed.nextRequest ).to.eql( getSites );
	} );

	it( 'should pass through "unique" requests', () => {
		removeDuplicateGets( { nextRequest: getSites } );

		const processed = removeDuplicateGets( { nextRequest: getPosts } );

		expect( processed.nextRequest ).to.eql( getPosts );
	} );

	it( 'should drop "duplicate" requests', () => {
		removeDuplicateGets( { nextRequest: getSites } );

		const processed = removeDuplicateGets( { nextRequest: getSites } );

		expect( processed.nextRequest ).to.be.null;
	} );
} );

describe( '#applyDuplicateHandlers', () => {
	before( clearQueue );

	it( 'should return new requests', () => {
		removeDuplicateGets( { nextRequest: getSites } );

		const processed = applyDuplicatesHandlers( { originalRequest: getSites } );

		expect( processed.failures ).to.eql( [ getSites.onFailure ] );
		expect( processed.successes ).to.eql( [ getSites.onSuccess ] );
	} );

	it( 'should collapse "duplicate" requests having same responders', () => {
		removeDuplicateGets( { nextRequest: getSites } );
		removeDuplicateGets( { nextRequest: getSites } );

		const processed = applyDuplicatesHandlers( { originalRequest: getSites } );

		expect( processed.failures ).to.eql( [ getSites.onFailure ] );
		expect( processed.successes ).to.eql( [ getSites.onSuccess ] );
	} );

	it( 'should spread "duplicate" requests having different responders', () => {
		removeDuplicateGets( { nextRequest: getSites } );
		removeDuplicateGets( { nextRequest: { ...getSites, onSuccess: filler } } );

		const processed = applyDuplicatesHandlers( { originalRequest: getSites } );

		expect( processed.failures ).to.eql( [ getSites.onFailure ] );
		expect( processed.successes ).to.eql( [ getSites.onSuccess, filler ] );
	} );

	it( 'should pass through "unique" requests', () => {
		removeDuplicateGets( { nextRequest: getSites } );
		removeDuplicateGets( { nextRequest: getPosts } );

		const sites = applyDuplicatesHandlers( { originalRequest: getSites } );

		expect( sites.failures ).to.eql( [ failer ] );
		expect( sites.successes ).to.eql( [ succeeder ] );

		const posts = applyDuplicatesHandlers( { originalRequest: getPosts } );

		expect( posts.failures ).to.eql( [ failer ] );
		expect( posts.successes ).to.eql( [ succeeder ] );
	} );

	it( 'should pass through "duplicate" requests which never overlap', () => {
		removeDuplicateGets( { nextRequest: getSites } );

		const first = applyDuplicatesHandlers( { originalRequest: getSites } );

		expect( first.failures ).to.eql( [ failer ] );
		expect( first.successes ).to.eql( [ succeeder ] );

		const { nextRequest } = removeDuplicateGets( { nextRequest: getSites } );

		expect( nextRequest ).to.eql( getSites );

		const second = applyDuplicatesHandlers( { originalRequest: getSites } );

		expect( second.failures ).to.eql( [ failer ] );
		expect( second.successes ).to.eql( [ succeeder ] );
	} );


	it( 'should not collapse non-GET requests', () => {
		removeDuplicateGets( { nextRequest: postLike } );
		removeDuplicateGets( { nextRequest: postLike } );

		const processed = applyDuplicatesHandlers( {
			failures: [ postLike.onFailure ],
			originalRequest: postLike,
			successes: [ postLike.onSuccess ],
		} );

		expect( processed.failures ).to.eql( [ postLike.onFailure ] );
		expect( processed.successes ).to.eql( [ postLike.onSuccess ] );
	} );

	it( 'should not wipe out previous responders in the pipeline', () => {
		removeDuplicateGets( { nextRequest: getSites } );
		removeDuplicateGets( { nextRequest: getSites } );

		const processed = applyDuplicatesHandlers( {
			failures: [ filler ],
			originalRequest: getSites,
			successes: [ filler ],
		} );

		expect( processed.failures ).to.eql( [ filler, getSites.onFailure ] );
		expect( processed.successes ).to.eql( [ filler, getSites.onSuccess ] );
	} );

	it( 'should combine previous responders with "duplicate" responders in the pipeline', () => {
		removeDuplicateGets( { nextRequest: getSites } );
		removeDuplicateGets( { nextRequest: getSites } );

		const processed = applyDuplicatesHandlers( {
			failures: [ getSites.onFailure ],
			originalRequest: getSites,
			successes: [ getSites.onSuccess ],
		} );

		expect( processed.failures ).to.eql( [ getSites.onFailure ] );
		expect( processed.successes ).to.eql( [ getSites.onSuccess ] );
	} );
} );
