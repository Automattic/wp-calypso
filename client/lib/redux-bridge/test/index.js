/**
 * External Dependencies
 *
 * @format
 */

/**
 * Internal Dependencies
 */
import Dispatcher from 'dispatcher';
import { setReduxStore, registerActionForward, clearActionForwards } from '../';

describe( 'redux-bridge', () => {
	let fakeStore;
	beforeEach( () => {
		fakeStore = {
			dispatch: jest.fn(),
			getState: jest.fn(),
		};
		setReduxStore( fakeStore );
	} );

	afterEach( () => {
		setReduxStore( null );
		clearActionForwards();
	} );
	test( 'flux actions that match the dispatch map get forwarded to the redux store', () => {
		registerActionForward( 'MY_ACTION' );
		Dispatcher.handleServerAction( { type: 'MY_ACTION' } );
		expect( fakeStore.dispatch ).toHaveBeenLastCalledWith( { type: 'FLUX_MY_ACTION' } );
	} );

	test( 'flux actions that DO NOT match the dispatch map DO NOT get forwarded to the redux store', () => {
		registerActionForward( 'MY_OTHER_ACTION' );
		Dispatcher.handleServerAction( { type: 'MY_ACTION' } );
		expect( fakeStore.dispatch ).not.toHaveBeenCalled();
	} );

	test( 'if nothing is registered nothing breaks', () => {
		expect( fakeStore.dispatch ).not.toHaveBeenCalled();
	} );
} );
