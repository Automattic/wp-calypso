/**
 * External dependencies
 */
import { mount } from 'enzyme';
import { castArray } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	registerStore,
	registerReducer,
	registerSelectors,
	registerResolvers,
	registerActions,
	dispatch,
	select,
	withSelect,
	withDispatch,
	subscribe,
	isActionLike,
	isAsyncIterable,
	isIterable,
	toAsyncIterable,
} from '../';

// Mock data store to prevent self-initialization, as it needs to be reset
// between tests of `registerResolvers` by replacement (new `registerStore`).
jest.mock( '../store', () => () => {} );
const registerDataStore = require.requireActual( '../store' ).default;

describe( 'registerStore', () => {
	it( 'should be shorthand for reducer, actions, selectors registration', () => {
		const store = registerStore( 'butcher', {
			reducer( state = { ribs: 6, chicken: 4 }, action ) {
				switch ( action.type ) {
					case 'sale':
						return {
							...state,
							[ action.meat ]: state[ action.meat ] / 2,
						};
				}

				return state;
			},
			selectors: {
				getPrice: ( state, meat ) => state[ meat ],
			},
			actions: {
				startSale: ( meat ) => ( { type: 'sale', meat } ),
			},
		} );

		expect( store.getState() ).toEqual( { ribs: 6, chicken: 4 } );
		expect( dispatch( 'butcher' ) ).toHaveProperty( 'startSale' );
		expect( select( 'butcher' ) ).toHaveProperty( 'getPrice' );
		expect( select( 'butcher' ).getPrice( 'chicken' ) ).toBe( 4 );
		expect( select( 'butcher' ).getPrice( 'ribs' ) ).toBe( 6 );
		dispatch( 'butcher' ).startSale( 'chicken' );
		expect( select( 'butcher' ).getPrice( 'chicken' ) ).toBe( 2 );
		expect( select( 'butcher' ).getPrice( 'ribs' ) ).toBe( 6 );
	} );
} );

describe( 'registerReducer', () => {
	it( 'Should append reducers to the state', () => {
		const reducer1 = () => 'chicken';
		const reducer2 = () => 'ribs';

		const store = registerReducer( 'red1', reducer1 );
		expect( store.getState() ).toEqual( 'chicken' );

		const store2 = registerReducer( 'red2', reducer2 );
		expect( store2.getState() ).toEqual( 'ribs' );
	} );
} );

describe( 'registerResolvers', () => {
	beforeEach( () => {
		registerDataStore();
	} );

	const unsubscribes = [];
	afterEach( () => {
		let unsubscribe;
		while ( ( unsubscribe = unsubscribes.shift() ) ) {
			unsubscribe();
		}
	} );

	function subscribeWithUnsubscribe( ...args ) {
		const unsubscribe = subscribe( ...args );
		unsubscribes.push( unsubscribe );
		return unsubscribe;
	}

	function subscribeUntil( predicates ) {
		predicates = castArray( predicates );

		return new Promise( ( resolve ) => {
			subscribeWithUnsubscribe( () => {
				if ( predicates.every( ( predicate ) => predicate() ) ) {
					resolve();
				}
			} );
		} );
	}

	it( 'should not do anything for selectors which do not have resolvers', () => {
		registerReducer( 'demo', ( state = 'OK' ) => state );
		registerSelectors( 'demo', {
			getValue: ( state ) => state,
		} );
		registerResolvers( 'demo', {} );

		expect( select( 'demo' ).getValue() ).toBe( 'OK' );
	} );

	it( 'should behave as a side effect for the given selector, with arguments', () => {
		const resolver = jest.fn();

		registerReducer( 'demo', ( state = 'OK' ) => state );
		registerSelectors( 'demo', {
			getValue: ( state ) => state,
		} );
		registerResolvers( 'demo', {
			getValue: resolver,
		} );

		const value = select( 'demo' ).getValue( 'arg1', 'arg2' );
		expect( value ).toBe( 'OK' );
		expect( resolver ).toHaveBeenCalledWith( 'OK', 'arg1', 'arg2' );
		select( 'demo' ).getValue( 'arg1', 'arg2' );
		expect( resolver ).toHaveBeenCalledTimes( 1 );
		select( 'demo' ).getValue( 'arg3', 'arg4' );
		expect( resolver ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should support the object resolver definition', () => {
		const resolver = jest.fn();

		registerReducer( 'demo', ( state = 'OK' ) => state );
		registerSelectors( 'demo', {
			getValue: ( state ) => state,
		} );
		registerResolvers( 'demo', {
			getValue: { fulfill: resolver },
		} );

		const value = select( 'demo' ).getValue( 'arg1', 'arg2' );
		expect( value ).toBe( 'OK' );
	} );

	it( 'should use isFulfilled definition before calling the side effect', () => {
		const fulfill = jest.fn().mockImplementation( ( state, page ) => {
			return { type: 'SET_PAGE', page, result: [] };
		} );

		const store = registerReducer( 'demo', ( state = {}, action ) => {
			switch ( action.type ) {
				case 'SET_PAGE':
					return {
						...state,
						[ action.page ]: action.result,
					};
			}

			return state;
		} );

		store.dispatch( { type: 'SET_PAGE', page: 4, result: [] } );

		registerSelectors( 'demo', {
			getPage: ( state, page ) => state[ page ],
		} );
		registerResolvers( 'demo', {
			getPage: {
				fulfill,
				isFulfilled( state, page ) {
					return state.hasOwnProperty( page );
				},
			},
		} );

		select( 'demo' ).getPage( 1 );
		select( 'demo' ).getPage( 2 );

		expect( fulfill ).toHaveBeenCalledTimes( 2 );

		select( 'demo' ).getPage( 1 );
		select( 'demo' ).getPage( 2 );
		select( 'demo' ).getPage( 3, {} );

		// Expected: First and second page fulfillments already triggered, so
		// should only be one more than previous assertion set.
		expect( fulfill ).toHaveBeenCalledTimes( 3 );

		select( 'demo' ).getPage( 1 );
		select( 'demo' ).getPage( 2 );
		select( 'demo' ).getPage( 3, {} );
		select( 'demo' ).getPage( 4 );

		// Expected:
		//  - Fourth page was pre-filled. Necessary to determine via
		//    isFulfilled, but fulfillment resolver should not be triggered.
		//  - Third page arguments are not strictly equal but are equivalent,
		//    so fulfillment should already be satisfied.
		expect( fulfill ).toHaveBeenCalledTimes( 3 );

		select( 'demo' ).getPage( 4, {} );
	} );

	it( 'should resolve action to dispatch', () => {
		registerReducer( 'demo', ( state = 'NOTOK', action ) => {
			return action.type === 'SET_OK' ? 'OK' : state;
		} );
		registerSelectors( 'demo', {
			getValue: ( state ) => state,
		} );
		registerResolvers( 'demo', {
			getValue: () => ( { type: 'SET_OK' } ),
		} );

		const promise = subscribeUntil( [
			() => select( 'demo' ).getValue() === 'OK',
			() => select( 'core/data' ).hasFinishedResolution( 'demo', 'getValue' ),
		] );

		select( 'demo' ).getValue();

		return promise;
	} );

	it( 'should resolve mixed type action array to dispatch', () => {
		registerReducer( 'counter', ( state = 0, action ) => {
			return action.type === 'INCREMENT' ? state + 1 : state;
		} );
		registerSelectors( 'counter', {
			getCount: ( state ) => state,
		} );
		registerResolvers( 'counter', {
			getCount: () => [
				{ type: 'INCREMENT' },
				Promise.resolve( { type: 'INCREMENT' } ),
			],
		} );

		const promise = subscribeUntil( [
			() => select( 'counter' ).getCount() === 2,
			() => select( 'core/data' ).hasFinishedResolution( 'counter', 'getCount' ),
		] );

		select( 'counter' ).getCount();

		return promise;
	} );

	it( 'should resolve generator action to dispatch', () => {
		registerReducer( 'demo', ( state = 'NOTOK', action ) => {
			return action.type === 'SET_OK' ? 'OK' : state;
		} );
		registerSelectors( 'demo', {
			getValue: ( state ) => state,
		} );
		registerResolvers( 'demo', {
			* getValue() {
				yield { type: 'SET_OK' };
			},
		} );

		const promise = subscribeUntil( [
			() => select( 'demo' ).getValue() === 'OK',
			() => select( 'core/data' ).hasFinishedResolution( 'demo', 'getValue' ),
		] );

		select( 'demo' ).getValue();

		return promise;
	} );

	it( 'should resolve promise action to dispatch', () => {
		registerReducer( 'demo', ( state = 'NOTOK', action ) => {
			return action.type === 'SET_OK' ? 'OK' : state;
		} );
		registerSelectors( 'demo', {
			getValue: ( state ) => state,
		} );
		registerResolvers( 'demo', {
			getValue: () => Promise.resolve( { type: 'SET_OK' } ),
		} );

		const promise = subscribeUntil( [
			() => select( 'demo' ).getValue() === 'OK',
			() => select( 'core/data' ).hasFinishedResolution( 'demo', 'getValue' ),
		] );

		select( 'demo' ).getValue();

		return promise;
	} );

	it( 'should resolve promise non-action to dispatch', ( done ) => {
		let shouldThrow = false;
		registerReducer( 'demo', ( state = 'OK' ) => {
			if ( shouldThrow ) {
				throw 'Should not have dispatched';
			}

			return state;
		} );
		shouldThrow = true;
		registerSelectors( 'demo', {
			getValue: ( state ) => state,
		} );
		registerResolvers( 'demo', {
			getValue: () => Promise.resolve(),
		} );

		select( 'demo' ).getValue();

		process.nextTick( () => {
			done();
		} );
	} );

	it( 'should resolve async iterator action to dispatch', () => {
		registerReducer( 'counter', ( state = 0, action ) => {
			return action.type === 'INCREMENT' ? state + 1 : state;
		} );
		registerSelectors( 'counter', {
			getCount: ( state ) => state,
		} );
		registerResolvers( 'counter', {
			getCount: async function* () {
				yield { type: 'INCREMENT' };
				yield await Promise.resolve( { type: 'INCREMENT' } );
			},
		} );

		const promise = subscribeUntil( [
			() => select( 'counter' ).getCount() === 2,
			() => select( 'core/data' ).hasFinishedResolution( 'counter', 'getCount' ),
		] );

		select( 'counter' ).getCount();

		return promise;
	} );

	it( 'should not dispatch resolved promise action on subsequent selector calls', () => {
		registerReducer( 'demo', ( state = 'NOTOK', action ) => {
			return action.type === 'SET_OK' && state === 'NOTOK' ? 'OK' : 'NOTOK';
		} );
		registerSelectors( 'demo', {
			getValue: ( state ) => state,
		} );
		registerResolvers( 'demo', {
			getValue: () => Promise.resolve( { type: 'SET_OK' } ),
		} );

		const promise = subscribeUntil( () => select( 'demo' ).getValue() === 'OK' );

		select( 'demo' ).getValue();
		select( 'demo' ).getValue();

		return promise;
	} );
} );

describe( 'select', () => {
	it( 'registers multiple selectors to the public API', () => {
		const store = registerReducer( 'reducer1', () => 'state1' );
		const selector1 = jest.fn( () => 'result1' );
		const selector2 = jest.fn( () => 'result2' );

		registerSelectors( 'reducer1', {
			selector1,
			selector2,
		} );

		expect( select( 'reducer1' ).selector1() ).toEqual( 'result1' );
		expect( selector1 ).toBeCalledWith( store.getState() );

		expect( select( 'reducer1' ).selector2() ).toEqual( 'result2' );
		expect( selector2 ).toBeCalledWith( store.getState() );
	} );
} );

describe( 'withSelect', () => {
	let wrapper, store;

	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	it( 'passes the relevant data to the component', () => {
		registerReducer( 'reactReducer', () => ( { reactKey: 'reactState' } ) );
		registerSelectors( 'reactReducer', {
			reactSelector: ( state, key ) => state[ key ],
		} );

		// In normal circumstances, the fact that we have to add an arbitrary
		// prefix to the variable name would be concerning, and perhaps an
		// argument that we ought to expect developer to use select from the
		// wp.data export. But in-fact, this serves as a good deterrent for
		// including both `withSelect` and `select` in the same scope, which
		// shouldn't occur for a typical component, and if it did might wrongly
		// encourage the developer to use `select` within the component itself.
		const mapSelectToProps = jest.fn().mockImplementation( ( _select, ownProps ) => ( {
			data: _select( 'reactReducer' ).reactSelector( ownProps.keyName ),
		} ) );

		const OriginalComponent = jest.fn().mockImplementation( ( props ) => (
			<div>{ props.data }</div>
		) );

		const Component = withSelect( mapSelectToProps )( OriginalComponent );

		wrapper = mount( <Component keyName="reactKey" /> );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 1 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 1 );

		// Wrapper is the enhanced component. Find props on the rendered child.
		const child = wrapper.childAt( 0 );
		expect( child.props() ).toEqual( {
			keyName: 'reactKey',
			data: 'reactState',
		} );
		expect( wrapper.text() ).toBe( 'reactState' );
	} );

	it( 'should rerun selection on state changes', () => {
		registerReducer( 'counter', ( state = 0, action ) => {
			if ( action.type === 'increment' ) {
				return state + 1;
			}

			return state;
		} );

		registerSelectors( 'counter', {
			getCount: ( state ) => state,
		} );

		registerActions( 'counter', {
			increment: () => ( { type: 'increment' } ),
		} );

		const mapSelectToProps = jest.fn().mockImplementation( ( _select ) => ( {
			count: _select( 'counter' ).getCount(),
		} ) );

		const mapDispatchToProps = jest.fn().mockImplementation( ( _dispatch ) => ( {
			increment: _dispatch( 'counter' ).increment,
		} ) );

		const OriginalComponent = jest.fn().mockImplementation( ( props ) => (
			<button onClick={ props.increment }>
				{ props.count }
			</button>
		) );

		const Component = compose( [
			withSelect( mapSelectToProps ),
			withDispatch( mapDispatchToProps ),
		] )( OriginalComponent );

		wrapper = mount( <Component /> );

		expect( OriginalComponent ).toHaveBeenCalledTimes( 1 );
		expect( mapSelectToProps ).toHaveBeenCalledTimes( 1 );
		expect( mapDispatchToProps ).toHaveBeenCalledTimes( 1 );

		const button = wrapper.find( 'button' );

		button.simulate( 'click' );

		expect( button.text() ).toBe( '1' );
		// 3 times =
		//  1. Initial mount
		//  2. When click handler is called
		//  3. After select updates its merge props
		expect( mapDispatchToProps ).toHaveBeenCalledTimes( 3 );
		expect( mapSelectToProps ).toHaveBeenCalledTimes( 2 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should rerun selection on props changes', () => {
		registerReducer( 'counter', ( state = 0, action ) => {
			if ( action.type === 'increment' ) {
				return state + 1;
			}

			return state;
		} );

		registerSelectors( 'counter', {
			getCount: ( state, offset ) => state + offset,
		} );

		const mapSelectToProps = jest.fn().mockImplementation( ( _select, ownProps ) => ( {
			count: _select( 'counter' ).getCount( ownProps.offset ),
		} ) );

		const OriginalComponent = jest.fn().mockImplementation( ( props ) => (
			<div>{ props.count }</div>
		) );

		const Component = withSelect( mapSelectToProps )( OriginalComponent );

		wrapper = mount( <Component offset={ 0 } /> );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 1 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 1 );

		wrapper.setProps( { offset: 10 } );

		expect( wrapper.childAt( 0 ).text() ).toBe( '10' );
		expect( mapSelectToProps ).toHaveBeenCalledTimes( 2 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should not run selection if props have not changed', () => {
		store = registerReducer( 'unchanging', ( state = {} ) => state );

		registerSelectors( 'unchanging', {
			getState: ( state ) => state,
		} );

		const mapSelectToProps = jest.fn();

		const OriginalComponent = jest.fn().mockImplementation( () => <div /> );

		const Component = compose( [
			withSelect( mapSelectToProps ),
		] )( OriginalComponent );

		const Parent = ( props ) => <Component propName={ props.propName } />;

		wrapper = mount( <Parent propName="foo" /> );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 1 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 1 );

		wrapper.setProps( { propName: 'foo' } );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 1 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not run selection if state has changed but merge props the same', () => {
		store = registerReducer( 'demo', () => ( {} ) );

		registerSelectors( 'demo', {
			getUnchangingValue: () => 10,
		} );

		registerActions( 'demo', {
			update: () => ( { type: 'update' } ),
		} );

		const mapSelectToProps = jest.fn().mockImplementation( ( _select ) => ( {
			value: _select( 'demo' ).getUnchangingValue(),
		} ) );

		const OriginalComponent = jest.fn().mockImplementation( () => <div /> );

		const Component = withSelect( mapSelectToProps )( OriginalComponent );

		wrapper = mount( <Component /> );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 1 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 1 );

		dispatch( 'demo' ).update();

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 2 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should render if props have changed but not state', () => {
		store = registerReducer( 'unchanging', ( state = {} ) => state );

		registerSelectors( 'unchanging', {
			getState: ( state ) => state,
		} );

		const mapSelectToProps = jest.fn();

		const OriginalComponent = jest.fn().mockImplementation( () => <div /> );

		const Component = compose( [
			withSelect( mapSelectToProps ),
		] )( OriginalComponent );

		wrapper = mount( <Component /> );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 1 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 1 );

		wrapper.setProps( { propName: 'foo' } );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 2 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should not rerun selection on unchanging state', () => {
		store = registerReducer( 'unchanging', ( state = {} ) => state );

		registerSelectors( 'unchanging', {
			getState: ( state ) => state,
		} );

		const mapSelectToProps = jest.fn();

		const OriginalComponent = jest.fn().mockImplementation( () => <div /> );

		const Component = compose( [
			withSelect( mapSelectToProps ),
		] )( OriginalComponent );

		wrapper = mount( <Component /> );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 1 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 1 );

		store.dispatch( { type: 'dummy' } );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 1 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'omits props which are not returned on subsequent mappings', () => {
		registerReducer( 'demo', ( state = 'OK' ) => state );
		registerSelectors( 'demo', {
			getValue: ( state ) => state,
		} );

		const mapSelectToProps = jest.fn().mockImplementation( ( _select, ownProps ) => {
			return {
				[ ownProps.propName ]: _select( 'demo' ).getValue(),
			};
		} );

		const OriginalComponent = jest.fn().mockImplementation( () => <div /> );

		const Component = withSelect( mapSelectToProps )( OriginalComponent );

		wrapper = mount( <Component propName="foo" /> );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 1 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 1 );
		expect( wrapper.childAt( 0 ).props() ).toEqual( { foo: 'OK', propName: 'foo' } );

		wrapper.setProps( { propName: 'bar' } );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 2 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 2 );
		expect( wrapper.childAt( 0 ).props() ).toEqual( { bar: 'OK', propName: 'bar' } );
	} );

	it( 'allows undefined return from mapSelectToProps', () => {
		registerReducer( 'demo', ( state = 'OK' ) => state );
		registerSelectors( 'demo', {
			getValue: ( state ) => state,
		} );

		const mapSelectToProps = jest.fn().mockImplementation( ( _select, ownProps ) => {
			if ( ownProps.pass ) {
				return {
					count: _select( 'demo' ).getValue(),
				};
			}
		} );

		const OriginalComponent = jest.fn().mockImplementation( (
			( props ) => <div>{ props.count || 'Unknown' }</div>
		) );

		const Component = withSelect( mapSelectToProps )( OriginalComponent );

		wrapper = mount( <Component pass={ false } /> );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 1 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 1 );
		expect( wrapper.childAt( 0 ).text() ).toBe( 'Unknown' );

		wrapper.setProps( { pass: true } );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 2 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 2 );
		expect( wrapper.childAt( 0 ).text() ).toBe( 'OK' );

		wrapper.setProps( { pass: false } );

		expect( mapSelectToProps ).toHaveBeenCalledTimes( 3 );
		expect( OriginalComponent ).toHaveBeenCalledTimes( 3 );
		expect( wrapper.childAt( 0 ).text() ).toBe( 'Unknown' );
	} );

	it( 'should run selections on parents before its children', () => {
		registerReducer( 'childRender', ( state = true, action ) => (
			action.type === 'TOGGLE_RENDER' ? ! state : state
		) );
		registerSelectors( 'childRender', {
			getValue: ( state ) => state,
		} );
		registerActions( 'childRender', {
			toggleRender: () => ( { type: 'TOGGLE_RENDER' } ),
		} );

		const childMapStateToProps = jest.fn();
		const parentMapStateToProps = jest.fn().mockImplementation( ( _select ) => ( {
			isRenderingChild: _select( 'childRender' ).getValue(),
		} ) );

		const ChildOriginalComponent = jest.fn().mockImplementation( () => <div /> );
		const ParentOriginalComponent = jest.fn().mockImplementation( ( props ) => (
			<div>{ props.isRenderingChild ? <Child /> : null }</div>
		) );

		const Child = withSelect( childMapStateToProps )( ChildOriginalComponent );
		const Parent = withSelect( parentMapStateToProps )( ParentOriginalComponent );

		wrapper = mount( <Parent /> );

		expect( childMapStateToProps ).toHaveBeenCalledTimes( 1 );
		expect( parentMapStateToProps ).toHaveBeenCalledTimes( 1 );
		expect( ChildOriginalComponent ).toHaveBeenCalledTimes( 1 );
		expect( ParentOriginalComponent ).toHaveBeenCalledTimes( 1 );

		dispatch( 'childRender' ).toggleRender();

		expect( childMapStateToProps ).toHaveBeenCalledTimes( 1 );
		expect( parentMapStateToProps ).toHaveBeenCalledTimes( 2 );
		expect( ChildOriginalComponent ).toHaveBeenCalledTimes( 1 );
		expect( ParentOriginalComponent ).toHaveBeenCalledTimes( 2 );
	} );
} );

describe( 'withDispatch', () => {
	let wrapper;
	afterEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
			wrapper = null;
		}
	} );

	it( 'passes the relevant data to the component', () => {
		const store = registerReducer( 'counter', ( state = 0, action ) => {
			if ( action.type === 'increment' ) {
				return state + action.count;
			}
			return state;
		} );

		const increment = ( count = 1 ) => ( { type: 'increment', count } );
		registerActions( 'counter', {
			increment,
		} );

		const Component = withDispatch( ( _dispatch, ownProps ) => {
			const { count } = ownProps;

			return {
				increment: () => _dispatch( 'counter' ).increment( count ),
			};
		} )( ( props ) => <button onClick={ props.increment } /> );

		wrapper = mount( <Component count={ 0 } /> );

		// Wrapper is the enhanced component. Find props on the rendered child.
		const child = wrapper.childAt( 0 );

		const incrementBeforeSetProps = child.prop( 'increment' );

		// Verify that dispatch respects props at the time of being invoked by
		// changing props after the initial mount.
		wrapper.setProps( { count: 2 } );

		// Function value reference should not have changed in props update.
		expect( child.prop( 'increment' ) ).toBe( incrementBeforeSetProps );

		wrapper.find( 'button' ).simulate( 'click' );

		expect( store.getState() ).toBe( 2 );
	} );
} );

describe( 'subscribe', () => {
	const unsubscribes = [];
	afterEach( () => {
		let unsubscribe;
		while ( ( unsubscribe = unsubscribes.shift() ) ) {
			unsubscribe();
		}
	} );

	function subscribeWithUnsubscribe( ...args ) {
		const unsubscribe = subscribe( ...args );
		unsubscribes.push( unsubscribe );
		return unsubscribe;
	}

	it( 'registers multiple selectors to the public API', () => {
		let incrementedValue = null;
		const store = registerReducer( 'myAwesomeReducer', ( state = 0 ) => state + 1 );
		registerSelectors( 'myAwesomeReducer', {
			globalSelector: ( state ) => state,
		} );
		const unsubscribe = subscribe( () => {
			incrementedValue = select( 'myAwesomeReducer' ).globalSelector();
		} );
		const action = { type: 'dummy' };

		store.dispatch( action ); // increment the data by => data = 2
		expect( incrementedValue ).toBe( 2 );

		store.dispatch( action ); // increment the data by => data = 3
		expect( incrementedValue ).toBe( 3 );

		unsubscribe(); // Store subscribe to changes, the data variable stops upgrading.

		store.dispatch( action );
		store.dispatch( action );

		expect( incrementedValue ).toBe( 3 );
	} );

	it( 'snapshots listeners on change, avoiding a later listener if subscribed during earlier callback', () => {
		const store = registerReducer( 'myAwesomeReducer', ( state = 0 ) => state + 1 );
		const secondListener = jest.fn();
		const firstListener = jest.fn( () => {
			subscribeWithUnsubscribe( secondListener );
		} );

		subscribeWithUnsubscribe( firstListener );

		store.dispatch( { type: 'dummy' } );

		expect( secondListener ).not.toHaveBeenCalled();
	} );

	it( 'snapshots listeners on change, calling a later listener even if unsubscribed during earlier callback', () => {
		const store = registerReducer( 'myAwesomeReducer', ( state = 0 ) => state + 1 );
		const firstListener = jest.fn( () => {
			secondUnsubscribe();
		} );
		const secondListener = jest.fn();

		subscribeWithUnsubscribe( firstListener );
		const secondUnsubscribe = subscribeWithUnsubscribe( secondListener );

		store.dispatch( { type: 'dummy' } );

		expect( secondListener ).toHaveBeenCalled();
	} );

	it( 'does not call listeners if state has not changed', () => {
		const store = registerReducer( 'unchanging', ( state = {} ) => state );
		const listener = jest.fn();
		subscribeWithUnsubscribe( listener );

		store.dispatch( { type: 'dummy' } );

		expect( listener ).not.toHaveBeenCalled();
	} );
} );

describe( 'dispatch', () => {
	it( 'registers actions to the public API', () => {
		const store = registerReducer( 'counter', ( state = 0, action ) => {
			if ( action.type === 'increment' ) {
				return state + action.count;
			}
			return state;
		} );
		const increment = ( count = 1 ) => ( { type: 'increment', count } );
		registerActions( 'counter', {
			increment,
		} );

		dispatch( 'counter' ).increment(); // state = 1
		dispatch( 'counter' ).increment( 4 ); // state = 5
		expect( store.getState() ).toBe( 5 );
	} );
} );

describe( 'isActionLike', () => {
	it( 'returns false if non-action-like', () => {
		expect( isActionLike( undefined ) ).toBe( false );
		expect( isActionLike( null ) ).toBe( false );
		expect( isActionLike( [] ) ).toBe( false );
		expect( isActionLike( {} ) ).toBe( false );
		expect( isActionLike( 1 ) ).toBe( false );
		expect( isActionLike( 0 ) ).toBe( false );
		expect( isActionLike( Infinity ) ).toBe( false );
		expect( isActionLike( { type: null } ) ).toBe( false );
	} );

	it( 'returns true if action-like', () => {
		expect( isActionLike( { type: 'POW' } ) ).toBe( true );
	} );
} );

describe( 'isAsyncIterable', () => {
	it( 'returns false if not async iterable', () => {
		expect( isAsyncIterable( undefined ) ).toBe( false );
		expect( isAsyncIterable( null ) ).toBe( false );
		expect( isAsyncIterable( [] ) ).toBe( false );
		expect( isAsyncIterable( {} ) ).toBe( false );
	} );

	it( 'returns true if async iterable', async () => {
		async function* getAsyncIterable() {
			yield new Promise( ( resolve ) => process.nextTick( resolve ) );
		}

		const result = getAsyncIterable();

		expect( isAsyncIterable( result ) ).toBe( true );

		await result;
	} );
} );

describe( 'isIterable', () => {
	it( 'returns false if not iterable', () => {
		expect( isIterable( undefined ) ).toBe( false );
		expect( isIterable( null ) ).toBe( false );
		expect( isIterable( {} ) ).toBe( false );
		expect( isIterable( Promise.resolve( {} ) ) ).toBe( false );
	} );

	it( 'returns true if iterable', () => {
		function* getIterable() {
			yield 'foo';
		}

		const result = getIterable();

		expect( isIterable( result ) ).toBe( true );
		expect( isIterable( [] ) ).toBe( true );
	} );
} );

describe( 'toAsyncIterable', () => {
	it( 'normalizes async iterable', async () => {
		async function* getAsyncIterable() {
			yield await Promise.resolve( { ok: true } );
		}

		const object = getAsyncIterable();
		const normalized = toAsyncIterable( object );

		expect( ( await normalized.next() ).value ).toEqual( { ok: true } );
	} );

	it( 'normalizes promise', async () => {
		const object = Promise.resolve( { ok: true } );
		const normalized = toAsyncIterable( object );

		expect( ( await normalized.next() ).value ).toEqual( { ok: true } );
	} );

	it( 'normalizes object', async () => {
		const object = { ok: true };
		const normalized = toAsyncIterable( object );

		expect( ( await normalized.next() ).value ).toEqual( { ok: true } );
	} );

	it( 'normalizes array of promise', async () => {
		const object = [ Promise.resolve( { ok: true } ) ];
		const normalized = toAsyncIterable( object );

		expect( ( await normalized.next() ).value ).toEqual( { ok: true } );
	} );

	it( 'normalizes mixed array', async () => {
		const object = [ { foo: 'bar' }, Promise.resolve( { ok: true } ) ];
		const normalized = toAsyncIterable( object );

		expect( ( await normalized.next() ).value ).toEqual( { foo: 'bar' } );
		expect( ( await normalized.next() ).value ).toEqual( { ok: true } );
	} );

	it( 'normalizes generator', async () => {
		function* getIterable() {
			yield Promise.resolve( { ok: true } );
		}

		const object = getIterable();
		const normalized = toAsyncIterable( object );

		expect( ( await normalized.next() ).value ).toEqual( { ok: true } );
	} );
} );
