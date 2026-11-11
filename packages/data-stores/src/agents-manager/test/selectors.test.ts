import reducer from '../reducer';
import { getAgentsManagerState } from '../selectors';
import type { State } from '../reducer';

const initialState = reducer( undefined, { type: '@@INIT' } as never );

describe( 'getAgentsManagerState', () => {
	const cases: Array< [ string, Partial< State >, boolean ] > = [
		[ 'open', { isOpen: true, isMinimized: false }, true ],
		[ 'minimized', { isOpen: true, isMinimized: true }, false ],
		[ 'closed', { isOpen: false, isMinimized: false }, false ],
	];

	it.each( cases )(
		'reports the chat as visible only while it is %s',
		( _state, state, isChatVisible ) => {
			expect( getAgentsManagerState( { ...initialState, ...state } ).isChatVisible ).toBe(
				isChatVisible
			);
		}
	);
} );
