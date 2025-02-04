import {
	READER_REGISTER_LAST_ACTION_REQUIRES_LOGIN,
	READER_CLEAR_LAST_ACTION_REQUIRES_LOGIN,
} from '../action-types';
import { lastActionRequiresLogin } from '../reducer';

describe( 'state/reader-ui/reducer', () => {
	const lastAction = {
		type: 'like',
		siteId: 123,
		postId: 456,
	};

	describe( 'items()', () => {
		test( 'should store the lastAction field', () => {
			const state = lastActionRequiresLogin( undefined, {
				type: READER_REGISTER_LAST_ACTION_REQUIRES_LOGIN,
				lastAction,
			} );

			expect( state ).toEqual( lastAction );
		} );

		test( 'should clear the stored data', () => {
			const state = lastAction;

			const updated = lastActionRequiresLogin( state, {
				type: READER_CLEAR_LAST_ACTION_REQUIRES_LOGIN,
			} );

			expect( updated ).toEqual( null );
		} );
	} );
} );
