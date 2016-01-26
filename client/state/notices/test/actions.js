/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { NEW_NOTICE, REMOVE_NOTICE } from 'state/action-types';
import { removeNotice, successNotice, errorNotice } from '../actions';

describe( 'actions', function() {
	describe( 'removeNotice()', function() {
		it( 'should return an action object', function() {
			const action = removeNotice( 123 );

			expect( action ).to.eql( {
				type: REMOVE_NOTICE,
				noticeId: 123
			} );
		} );
	} );

	describe( 'successNotice()', function() {
		it( 'should return action object with a proper text', function() {
			const text = 'potato',
				action = successNotice( text );

			expect( action.type ).to.eql( NEW_NOTICE );
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

			expect( action.type ).to.eql( NEW_NOTICE );
			expect( action.notice ).to.include( {
				text,
				status: 'is-error'
			} );
		} );
	} );
} );
