/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { NOTICE_CREATE, NOTICE_REMOVE } from 'state/action-types';
import { removeNotice, successNotice, errorNotice } from '../actions';

describe( 'actions', function() {
	describe( 'removeNotice()', function() {
		it( 'should return an action object', function() {
			const action = removeNotice( 123 );

			expect( action ).to.eql( {
				type: NOTICE_REMOVE,
				noticeId: 123
			} );
		} );
	} );

	describe( 'successNotice()', function() {
		it( 'should return action object with a proper text', function() {
			const text = 'potato',
				action = successNotice( text );

			expect( action.type ).to.eql( NOTICE_CREATE );
			expect( action.notice ).to.include( {
				text,
				status: 'is-success'
			} );
		} );

		it( 'should use default options when none provided', function() {
			const action = successNotice( '' );

			expect( action.notice ).to.include( {
				showDismiss: true
			} );
		} );

	} );

	describe( 'errorNotice()', function() {
		it( 'should return action object with a proper text', function() {
			const text = 'potato',
				action = errorNotice( text );

			expect( action.type ).to.eql( NOTICE_CREATE );
			expect( action.notice ).to.include( {
				text,
				status: 'is-error'
			} );
		} );
	} );
} );
