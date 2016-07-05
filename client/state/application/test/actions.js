/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	CONNECTION_LOST,
	CONNECTION_RESTORED,
	NOTICE_REMOVE,
	NOTICE_CREATE
} from 'state/action-types';
import { connectionLost, connectionRestored } from '../actions';

describe( 'state/application actions', () => {
	describe( '#connectionLost()', () => {
		const dispatch = spy();
		const exampleText = 'potato';

		//( dispatch ) because it is a thunk action creator
		connectionLost( exampleText )( dispatch );

		it( 'should dispatch an action with CONNECTION_LOST type ', () => {
			expect( dispatch.calledWith( { type: CONNECTION_LOST } ) ).ok;
		} );

		it( 'should remove notice with connectionRestored information', () => {
			expect( dispatch.calledWith( { type: NOTICE_REMOVE, noticeId: 'connectionRestored' } ) ).ok;
		} );

		it( 'should dispatch a notice with connectionLost information ', () => {
			expect( dispatch.calledWithMatch( {
				type: NOTICE_CREATE,
				notice: {
					noticeId: 'connectionLost',
					text: exampleText
				}
			} ) ).ok;
		} );

	} );

	describe( '#connectionRestored()', () => {
		const dispatch = spy();
		const exampleText = 'potato';

		//( dispatch ) because it is a thunk action creator
		connectionRestored( exampleText )( dispatch );

		it( 'should dispatch an action with CONNECTION_RESTORED type ', () => {
			expect( dispatch.calledWith( { type: CONNECTION_RESTORED } ) ).ok;
		} );

		it( 'should remove notice with connectionLost information', () => {
			expect( dispatch.calledWith( { type: NOTICE_REMOVE, noticeId: 'connectionLost' } ) ).ok;
		} );

		it( 'should dispatch a notice with connectionRestored information ', () => {
			expect( dispatch.calledWithMatch( {
				type: NOTICE_CREATE,
				notice: {
					noticeId: 'connectionRestored',
					text: exampleText
				}
			} ) ).ok;
		} );

	} );
} );
