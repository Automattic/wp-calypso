import {
	CONNECTION_LOST,
	CONNECTION_RESTORED,
	NOTICE_REMOVE,
	NOTICE_CREATE,
} from 'calypso/state/action-types';
import { connectionLost, connectionRestored } from '../actions';

describe( 'state/application actions', () => {
	describe( '#connectionLost()', () => {
		const dispatch = jest.fn();
		const exampleText = 'potato';

		//( dispatch ) because it is a thunk action creator
		connectionLost( exampleText )( dispatch );

		test( 'should dispatch an action with CONNECTION_LOST type', () => {
			expect( dispatch ).toHaveBeenCalledWith( { type: CONNECTION_LOST } );
		} );

		test( 'should remove notice with connectionRestored information', () => {
			expect( dispatch ).toHaveBeenCalledWith( {
				type: NOTICE_REMOVE,
				noticeId: 'connectionRestored',
			} );
		} );

		test( 'should dispatch a notice with connectionLost information', () => {
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: NOTICE_CREATE,
					notice: expect.objectContaining( {
						noticeId: 'connectionLost',
						text: exampleText,
					} ),
				} )
			);
		} );
	} );

	describe( '#connectionRestored()', () => {
		const dispatch = jest.fn();
		const exampleText = 'potato';

		//( dispatch ) because it is a thunk action creator
		connectionRestored( exampleText )( dispatch );

		test( 'should dispatch an action with CONNECTION_RESTORED type', () => {
			expect( dispatch ).toHaveBeenCalledWith( { type: CONNECTION_RESTORED } );
		} );

		test( 'should remove notice with connectionLost information', () => {
			expect( dispatch ).toHaveBeenCalledWith( {
				type: NOTICE_REMOVE,
				noticeId: 'connectionLost',
			} );
		} );

		test( 'should dispatch a notice with connectionRestored information', () => {
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: NOTICE_CREATE,
					notice: expect.objectContaining( {
						noticeId: 'connectionRestored',
						text: exampleText,
					} ),
				} )
			);
		} );
	} );
} );
