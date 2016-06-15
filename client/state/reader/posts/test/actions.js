/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_POSTS_RECEIVE
} from 'state/action-types';
import useMockery from 'test/helpers/use-mockery';

describe( 'actions', () => {
	let receivePosts;
	const dispatchSpy = sinon.spy();
	const trackingSpy = sinon.spy();

	useMockery( mockery => {
		mockery.registerMock( 'lib/analytics', {
			tracks: {
				recordEvent: trackingSpy
			}
		} );

		receivePosts = require( '../actions' ).receivePosts;
	} );

	afterEach( () => {
		dispatchSpy.reset();
		trackingSpy.reset();
	} );

	describe( '#receivePosts()', () => {
		it( 'should return an action object and dispatch posts receive', () => {
			const posts = [];
			return receivePosts( posts )( dispatchSpy ).then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_POSTS_RECEIVE,
					posts
				} );
			} );
		} );

		it( 'should fire tracks events for posts with railcars', () => {
			const posts = [
				{
					ID: 1,
					site_ID: 1,
					global_ID: 1,
					railcar: 'foo'
				}
			];
			receivePosts( posts )( dispatchSpy );
			expect( trackingSpy ).to.have.been.calledWith( 'calypso_traintracks_render', 'foo' );
		} );
	} );
} );
