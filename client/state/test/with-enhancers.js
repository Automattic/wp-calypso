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
} );
