import {
	READER_REGISTER_LAST_ACTION_REQUIRES_LOGIN,
	READER_CLEAR_LAST_ACTION_REQUIRES_LOGIN,
} from '../action-types';
import { registerLastActionRequiresLogin, clearLastActionRequiresLogin } from '../actions';

describe( '/state/reader-ui/actions', () => {
	const lastAction = {
		type: 'like',
		siteId: 123,
		postId: 456,
	};

	describe( 'registerLastActionRequiresLogin()', () => {
		test( 'should return expected action.', () => {
			expect( registerLastActionRequiresLogin( lastAction ) ).toEqual( {
				type: READER_REGISTER_LAST_ACTION_REQUIRES_LOGIN,
				lastAction,
			} );
		} );
	} );

	describe( 'clearLastActionRequiresLogin()', () => {
		test( 'should return expected action.', () => {
			expect( clearLastActionRequiresLogin() ).toEqual( {
				type: READER_CLEAR_LAST_ACTION_REQUIRES_LOGIN,
			} );
		} );
	} );
} );
