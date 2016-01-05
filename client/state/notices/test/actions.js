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
		it( 'should call dispatch with proper text and is-success status', function() {
			const text = 'potato',
				dispatch = spy();

			//successNotice is a thunk - returns a function:
			successNotice( text )( dispatch );

			expect( dispatch.calledWithMatch( {
				type: NEW_NOTICE,
				notice: {
					text,
					status: 'is-success'
				}
			} ) ).to.be.ok;
		} );

		it( 'should call dispatch with proper default options when none provided', function() {
			const dispatch = spy();

			//successNotice is a thunk - returns a function:
			successNotice( '' )( dispatch );

			expect( dispatch.calledWithMatch( {
				notice: {
					showDismiss: true
				}
			} ) ).to.be.ok;
		} );

		it( 'should call dispatch with type REMOVE_NOTICE and proper noticeId when duration is provided', function( done ) {
			const dispatch = spy();

			//successNotice is a thunk - returns a function:
			successNotice( '', { duration: 2 } )( dispatch );
			let noticeId = dispatch.firstCall.args[0].notice.noticeId;

			setTimeout( function() {
				expect( dispatch.calledWithMatch( {
					type: REMOVE_NOTICE,
					noticeId: noticeId
				} ) ).to.be.ok;
				done();
			}, 3 );
		} );
	} );

	describe( 'errorNotice()', function() {
		it( 'should call dispatch proper text and is-error status', function() {
			const text = 'potato',
				dispatch = spy();

			//errorNotice is a thunk - returns a function:
			errorNotice( text )( dispatch );

			expect( dispatch.calledWithMatch( {
				type: NEW_NOTICE,
				notice: {
					text,
					status: 'is-error'
				}
			} ) ).to.be.ok;
		} );
	} );
} );
