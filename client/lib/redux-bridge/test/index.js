/**
 * External Dependencies
 *
 * @format
 */

/**
 * Internal Dependencies
 */
import Dispatcher from 'dispatcher';
import { setReduxStore } from '../';

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
		Dispatcher.handleServerAction( { type: 'RECEIVE_MEDIA_ITEM' } );
		expect( fakeStore.dispatch ).toHaveBeenLastCalledWith( { type: 'FLUX_RECEIVE_MEDIA_ITEM' } );
	} );
} );
