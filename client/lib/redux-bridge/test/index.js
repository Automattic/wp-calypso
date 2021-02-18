/**
 * External Dependencies
 *
 */

/**
 * Internal Dependencies
 */
import Dispatcher from 'calypso/dispatcher';
import { setReduxStore, registerActionForward, clearActionForwards } from '../';

describe( 'redux-bridge', () => {
	let mockReduxStore;
	beforeEach( () => {
		mockReduxStore = {
			dispatch: jest.fn(),
			getState: jest.fn(),
		};
		setReduxStore( mockReduxStore );
	} );

	afterEach( () => {
		setReduxStore( null );
		clearActionForwards();
	} );
	test( 'flux actions that match the dispatch map get forwarded to the redux store', () => {
		registerActionForward( 'MY_ACTION' );
		Dispatcher.handleServerAction( { type: 'MY_ACTION' } );
		expect( mockReduxStore.dispatch ).toHaveBeenLastCalledWith( { type: 'FLUX_MY_ACTION' } );
	} );

	test( 'flux actions that DO NOT match the dispatch map DO NOT get forwarded to the redux store', () => {
		registerActionForward( 'MY_OTHER_ACTION' );
		Dispatcher.handleServerAction( { type: 'MY_ACTION' } );
		expect( mockReduxStore.dispatch ).not.toHaveBeenCalled();
	} );

	test( 'if nothing is registered nothing breaks', () => {
		expect( mockReduxStore.dispatch ).not.toHaveBeenCalled();
	} );
} );
