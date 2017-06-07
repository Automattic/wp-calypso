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
const cp = o => ( { ...o } );

describe( '#addResponder', () => {
	it( 'should add an `onFailure` action to an empty list', () => {
		const union = addResponder( {}, { onFailure: cp( failer ) } );

		expect( union.failures ).to.eql( [ failer ] );
		expect( union.successes ).to.be.empty;
	} );

	it( 'should add an `onSuccess` action to an empty list', () => {
		const union = addResponder( {}, { onSuccess: cp( succeeder ) } );

		expect( union.failures ).to.be.empty;
		expect( union.successes ).to.eql( [ succeeder ] );
	} );

	it( 'should add a "unique" action to an existing list', () => {
		const union = addResponder( { successes: [ cp( succeeder ) ] }, { onSuccess: cp( filler ) } );

		expect( union.successes ).to.eql( [ succeeder, filler ] );
	} );

	it( 'should merge "duplicate" actions to an existing list', () => {
		const union = addResponder( { successes: [ cp( succeeder ) ] }, { onSuccess: cp( succeeder ) } );

		expect( union.successes ).to.eql( [ succeeder ] );
	} );

	it( 'should add both `onSuccess` and `onFailure`', () => {
		const union = addResponder( {
			failures: [ cp( failer ) ],
			successes: [ cp( succeeder ) ],
		}, {
			onFailure: cp( filler ),
			onSuccess: cp( filler ),
		} );

		expect( union.failures ).to.eql( [ failer, filler ] );
		expect( union.successes ).to.eql( [ succeeder, filler ] );
	} );
} );

describe( '#removeDuplicateGets', () => {
	beforeEach( clearQueue );

	it( 'should pass through non-GET requests', () => {
		const primed = removeDuplicateGets( { nextRequest: cp( postLike ) } );

		expect( primed.nextRequest ).to.eql( postLike );

		const processed = removeDuplicateGets( { nextRequest: cp( postLike ) } );

		expect( processed.nextRequest ).to.eql( postLike );
	} );

	it( 'should pass through new requests', () => {
		const processed = removeDuplicateGets( { nextRequest: cp( getSites ) } );

		expect( processed.nextRequest ).to.eql( getSites );
	} );

	it( 'should pass through "unique" requests', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const processed = removeDuplicateGets( { nextRequest: cp( getPosts ) } );

		expect( processed.nextRequest ).to.eql( getPosts );
	} );

	it( 'should drop "duplicate" requests', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const processed = removeDuplicateGets( { nextRequest: cp( getSites ) } );

		expect( processed.nextRequest ).to.be.null;
	} );
} );

describe( '#applyDuplicateHandlers', () => {
	before( clearQueue );

	it( 'should return new requests', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const processed = applyDuplicatesHandlers( { originalRequest: cp( getSites ) } );

		expect( processed.failures ).to.eql( [ getSites.onFailure ] );
		expect( processed.successes ).to.eql( [ getSites.onSuccess ] );
	} );

	it( 'should collapse "duplicate" requests having same responders', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const processed = applyDuplicatesHandlers( { originalRequest: cp( getSites ) } );

		expect( processed.failures ).to.eql( [ getSites.onFailure ] );
		expect( processed.successes ).to.eql( [ getSites.onSuccess ] );
	} );

	it( 'should spread "duplicate" requests having different responders', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );
		removeDuplicateGets( { nextRequest: { ...getSites, onSuccess: cp( filler ) } } );

		const processed = applyDuplicatesHandlers( { originalRequest: cp( getSites ) } );

		expect( processed.failures ).to.eql( [ getSites.onFailure ] );
		expect( processed.successes ).to.eql( [ getSites.onSuccess, filler ] );
	} );

	it( 'should pass through "unique" requests', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );
		removeDuplicateGets( { nextRequest: cp( getPosts ) } );

		const sites = applyDuplicatesHandlers( { originalRequest: cp( getSites ) } );

		expect( sites.failures ).to.eql( [ failer ] );
		expect( sites.successes ).to.eql( [ succeeder ] );

		const posts = applyDuplicatesHandlers( { originalRequest: cp( getPosts ) } );

		expect( posts.failures ).to.eql( [ failer ] );
		expect( posts.successes ).to.eql( [ succeeder ] );
	} );

	it( 'should pass through "duplicate" requests which never overlap', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const first = applyDuplicatesHandlers( { originalRequest: cp( getSites ) } );

		expect( first.failures ).to.eql( [ failer ] );
		expect( first.successes ).to.eql( [ succeeder ] );

		const { nextRequest } = removeDuplicateGets( { nextRequest: cp( getSites ) } );

		expect( nextRequest ).to.eql( getSites );

		const second = applyDuplicatesHandlers( { originalRequest: cp( getSites ) } );

		expect( second.failures ).to.eql( [ failer ] );
		expect( second.successes ).to.eql( [ succeeder ] );
	} );

	it( 'should not collapse non-GET requests', () => {
		removeDuplicateGets( { nextRequest: cp( postLike ) } );
		removeDuplicateGets( { nextRequest: cp( postLike ) } );

		const processed = applyDuplicatesHandlers( {
			failures: [ cp( postLike.onFailure ) ],
			originalRequest: cp( postLike ),
			successes: [ cp( postLike.onSuccess ) ],
		} );

		expect( processed.failures ).to.eql( [ postLike.onFailure ] );
		expect( processed.successes ).to.eql( [ postLike.onSuccess ] );
	} );

	it( 'should not wipe out previous responders in the pipeline', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const processed = applyDuplicatesHandlers( {
			failures: [ cp( filler ) ],
			originalRequest: cp( getSites ),
			successes: [ cp( filler ) ],
		} );

		expect( processed.failures ).to.eql( [ filler, getSites.onFailure ] );
		expect( processed.successes ).to.eql( [ filler, getSites.onSuccess ] );
	} );

	it( 'should combine previous responders with "duplicate" responders in the pipeline', () => {
		removeDuplicateGets( { nextRequest: cp( getSites ) } );
		removeDuplicateGets( { nextRequest: cp( getSites ) } );

		const processed = applyDuplicatesHandlers( {
			failures: [ cp( getSites.onFailure ) ],
			originalRequest: cp( getSites ),
			successes: [ cp( getSites.onSuccess ) ],
		} );

		expect( processed.failures ).to.eql( [ getSites.onFailure ] );
		expect( processed.successes ).to.eql( [ getSites.onSuccess ] );
	} );
} );
