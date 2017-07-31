/**
 * @format
 * @jest-environment jsdom
 */
jest.mock( 'lib/feed-stream-store/actions', () => ( {
	selectItem: jest.fn(),
} ) );
jest.mock( 'lib/user', () => () => {} );
jest.mock( 'page', () => ( {
	show: require( 'sinon' ).spy(),
} ) );
jest.mock( 'reader/controller-helper', () => ( {
	setLastStoreId: jest.fn(),
} ) );

/**
 * External dependencies
 */
import { expect } from 'chai';
import page from 'page';

/**
 * Internal dependencies
 */
import { showSelectedPost } from '../utils';

describe( 'reader utils', () => {
	beforeEach( () => {
		page.show.reset();
	} );

	describe( '#showSelectedPost', () => {
		it( 'does not do anything if postKey argument is missing', () => {
			showSelectedPost( {} );
			expect( page.show ).to.have.not.been.called;
		} );

		it( 'redirects if passed a post key', () => {
			showSelectedPost( { postKey: { feedId: 1, postId: 5 } } );
			expect( page.show ).to.have.been.calledOnce;
		} );

		it( 'redirects to a #comments URL if we passed comments argument', () => {
			showSelectedPost( { postKey: { feedId: 1, postId: 5 }, comments: true } );
			expect( page.show ).to.have.been.calledWithMatch( '#comments' );
		} );
	} );
} );
