/** @format */
/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe.skip( 'reader utils', () => {
	const pageSpy = sinon.spy();

	beforeEach( () => {
		pageSpy.reset();
	} );

	describe( '#showSelectedPost', () => {
		let showSelectedPost;
		useMockery( mockery => {
			mockery.registerMock( 'page', {
				show: pageSpy,
			} );
			mockery.registerMock( 'lib/feed-stream-store/actions', {
				selectItem: sinon.stub(),
			} );
			mockery.registerMock( 'reader/controller-helper', {
				setLastStoreId: sinon.stub(),
			} );
			showSelectedPost = require( '../utils' ).showSelectedPost;
		} );

		it( 'does not do anything if postKey argument is missing', () => {
			showSelectedPost( {} );
			expect( pageSpy ).to.have.not.been.called;
		} );

		it( 'redirects if passed a post key', () => {
			showSelectedPost( { postKey: { feedId: 1, postId: 5 } } );
			expect( pageSpy ).to.have.been.calledOnce;
		} );

		it( 'redirects to a #comments URL if we passed comments argument', () => {
			showSelectedPost( { postKey: { feedId: 1, postId: 5 }, comments: true } );
			expect( pageSpy ).to.have.been.calledWithMatch( '#comments' );
		} );
	} );
} );
