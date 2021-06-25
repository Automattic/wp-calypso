/**
 * Internal dependencies
 */
import { withEnhancers } from 'calypso/state/utils';

describe( '#withEnhancers', () => {
	it( 'should enhance action creator', () => {
		const actionCreator = () => ( { type: 'HELLO' } );
		const enhancedActionCreator = withEnhancers( actionCreator, ( action ) =>
			Object.assign( { name: 'test' }, action )
		);
		const thunk = enhancedActionCreator();
		const getState = () => ( {} );
		let dispatchedAction = null;
		const dispatch = ( action ) => ( dispatchedAction = action );
		thunk( dispatch, getState );

		expect( dispatchedAction ).toEqual( {
			name: 'test',
			type: 'HELLO',
		} );
	} );

	it( 'should enhance with multiple enhancers, from last to first', () => {
		const actionCreator = () => ( { type: 'HELLO' } );
		const enhancedActionCreator = withEnhancers( actionCreator, [
			( action ) => Object.assign( { name: 'test' }, action ),
			( action ) => Object.assign( { name: 'test!!!' }, action ),
			( action ) => Object.assign( { meetup: 'akumal' }, action ),
		] );
		const thunk = enhancedActionCreator();
		const getState = () => ( {} );
		let dispatchedAction = null;
		const dispatch = ( action ) => ( dispatchedAction = action );
		thunk( dispatch, getState );

		expect( dispatchedAction ).toEqual( {
			name: 'test',
			type: 'HELLO',
			meetup: 'akumal',
		} );
	} );

	it( 'should provider enhancers with getState function', () => {
		let providedGetState = null;
		const actionCreator = () => ( { type: 'HELLO' } );
		const enhancedActionCreator = withEnhancers( actionCreator, [
			( action, getState ) => {
				providedGetState = getState;
				Object.assign( { name: 'test' }, action );
			},
		] );
		const thunk = enhancedActionCreator();
		const getState = () => ( {} );
		const dispatch = ( action ) => action;
		thunk( dispatch, getState );

		expect( providedGetState ).toEqual( getState );
	} );

	it( 'should accept an action creator as first parameter', () => {
		const actionCreator = () => ( { type: 'HELLO' } );
		const enhancedActionCreator = withEnhancers(
			withEnhancers( actionCreator, ( action ) => Object.assign( { name: 'test' }, action ) ),
			( action ) => Object.assign( { hello: 'world' }, action )
		);

		const thunk = enhancedActionCreator();
		const getState = () => ( {} );
		let dispatchedAction = null;
		const dispatch = ( action ) => ( dispatchedAction = action );
		thunk( dispatch, getState );

		expect( dispatchedAction ).toEqual( {
			name: 'test',
			hello: 'world',
			type: 'HELLO',
		} );
	} );

	it( 'should enhance nested thunk actions', () => {
		// plain action
		const actionCreator = () => ( { type: 'HELLO' } );
		// thunk action that dispatches the plain action
		const thunkCreator = () => ( dispatch ) => dispatch( actionCreator() );
		// nested thunk action that dispatches the thunk action that dispatches the plain action
		const thunkThunkCreator = () => ( dispatch ) => dispatch( thunkCreator() );
		// enhancer that's supposed to enhance the deeply nested plain action
		const enhancer = ( action ) => ( { ...action, name: 'test' } );
		// apply the enhancer to the nested thunk creator
		const enhancedThunkThunkCreator = withEnhancers( thunkThunkCreator, enhancer );

		// mocks the base Redux dispatch function that handles plain actions
		const dispatch = jest.fn();
		// mock the Redux Thunk enhanced dispatch function that handles thunks, too
		const thunkDispatch = ( action ) => {
			if ( typeof action === 'function' ) {
				return action( thunkDispatch );
			}
			return dispatch( action );
		};

		// dispatch the nested thunk action with the enhancer
		thunkDispatch( enhancedThunkThunkCreator() );
		// verify that the enhancer reached to the bottom of the thunk nesting and enhanced
		// the plain action at the bottom
		expect( dispatch ).toHaveBeenCalledWith( { type: 'HELLO', name: 'test' } );
	} );
} );
