/**
 * External Dependencies
 *
 * @format
 */

/**
 * Internal Dependencies
 */
import Dispatcher from 'dispatcher';
import { setReduxStore, registerActionForward } from '../';

describe( 'redux-bridge', () => {
	let fakeStore;
	beforeAll( () => {
		fakeStore = {
			dispatch: jest.fn(),
			getState: jest.fn(),
		};
		setReduxStore( fakeStore );
	} );

	afterAll( () => {
		setReduxStore( null );
	} );
	test( 'flux actions that match the dispatch map get forwarded to the redux store', () => {
		registerActionForward( 'MY_ACTION' );
		Dispatcher.handleServerAction( { type: 'MY_ACTION' } );
		expect( fakeStore.dispatch ).toHaveBeenLastCalledWith( { type: 'FLUX_MY_ACTION' } );
	} );
} );
