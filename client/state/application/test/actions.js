/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { connectionLost, connectionRestored } from '../actions';
import {
	CONNECTION_LOST,
	CONNECTION_RESTORED,
	NOTICE_REMOVE,
	NOTICE_CREATE,
} from 'calypso/state/action-types';

describe( 'state/application actions', () => {
	describe( '#connectionLost()', () => {
		const dispatch = spy();
		const exampleText = 'potato';

		//( dispatch ) because it is a thunk action creator
		connectionLost( exampleText )( dispatch );

		test( 'should dispatch an action with CONNECTION_LOST type ', () => {
			expect( dispatch.calledWith( { type: CONNECTION_LOST } ) ).ok;
		} );

		test( 'should remove notice with connectionRestored information', () => {
			expect( dispatch.calledWith( { type: NOTICE_REMOVE, noticeId: 'connectionRestored' } ) ).ok;
		} );

		test( 'should dispatch a notice with connectionLost information ', () => {
			expect(
				dispatch.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						noticeId: 'connectionLost',
						text: exampleText,
					},
				} )
			).ok;
		} );
	} );

	describe( '#connectionRestored()', () => {
		const dispatch = spy();
		const exampleText = 'potato';

		//( dispatch ) because it is a thunk action creator
		connectionRestored( exampleText )( dispatch );

		test( 'should dispatch an action with CONNECTION_RESTORED type ', () => {
			expect( dispatch.calledWith( { type: CONNECTION_RESTORED } ) ).ok;
		} );

		test( 'should remove notice with connectionLost information', () => {
			expect( dispatch.calledWith( { type: NOTICE_REMOVE, noticeId: 'connectionLost' } ) ).ok;
		} );

		test( 'should dispatch a notice with connectionRestored information ', () => {
			expect(
				dispatch.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						noticeId: 'connectionRestored',
						text: exampleText,
					},
				} )
			).ok;
		} );
	} );
} );
