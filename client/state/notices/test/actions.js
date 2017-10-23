/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { removeNotice, successNotice, errorNotice } from '../actions';
import { NOTICE_CREATE, NOTICE_REMOVE } from 'state/action-types';

describe( 'actions', () => {
	describe( 'removeNotice()', () => {
		test( 'should return an action object', () => {
			const action = removeNotice( 123 );

			expect( action ).to.eql( {
				type: NOTICE_REMOVE,
				noticeId: 123,
			} );
		} );
	} );

	describe( 'successNotice()', () => {
		test( 'should return action object with a proper text', () => {
			const text = 'potato',
				action = successNotice( text );

			expect( action.type ).to.eql( NOTICE_CREATE );
			expect( action.notice ).to.include( {
				text,
				status: 'is-success',
			} );
		} );

		test( 'should use default options when none provided', () => {
			const action = successNotice( '' );

			expect( action.notice ).to.include( {
				showDismiss: true,
			} );
		} );
	} );

	describe( 'errorNotice()', () => {
		test( 'should return action object with a proper text', () => {
			const text = 'potato',
				action = errorNotice( text );

			expect( action.type ).to.eql( NOTICE_CREATE );
			expect( action.notice ).to.include( {
				text,
				status: 'is-error',
			} );
		} );
	} );
} );
