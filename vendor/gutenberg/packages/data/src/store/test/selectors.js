/**
 * External dependencies
 */
import EquivalentKeyMap from 'equivalent-key-map';

/**
 * Internal dependencies
 */
import {
	getIsResolving,
	hasStartedResolution,
	hasFinishedResolution,
	isResolving,
} from '../selectors';

describe( 'getIsResolving', () => {
	it( 'should return undefined if no state by reducerKey, selectorName', () => {
		const state = {};
		const result = getIsResolving( state, 'test', 'getFoo', [] );

		expect( result ).toBe( undefined );
	} );

	it( 'should return undefined if state by reducerKey, selectorName, but not args', () => {
		const state = {
			test: {
				getFoo: new EquivalentKeyMap( [ [ [], true ] ] ),
			},
		};
		const result = getIsResolving( state, 'test', 'getFoo', [ 'bar' ] );

		expect( result ).toBe( undefined );
	} );

	it( 'should return value by reducerKey, selectorName', () => {
		const state = {
			test: {
				getFoo: new EquivalentKeyMap( [ [ [], true ] ] ),
			},
		};
		const result = getIsResolving( state, 'test', 'getFoo', [] );

		expect( result ).toBe( true );
	} );
} );

describe( 'hasStartedResolution', () => {
	it( 'returns false if not has started', () => {
		const state = {};
		const result = hasStartedResolution( state, 'test', 'getFoo', [] );

		expect( result ).toBe( false );
	} );

	it( 'returns true if has started', () => {
		const state = {
			test: {
				getFoo: new EquivalentKeyMap( [ [ [], true ] ] ),
			},
		};
		const result = hasStartedResolution( state, 'test', 'getFoo', [] );

		expect( result ).toBe( true );
	} );
} );

describe( 'hasFinishedResolution', () => {
	it( 'returns false if not has finished', () => {
		const state = {
			test: {
				getFoo: new EquivalentKeyMap( [ [ [], true ] ] ),
			},
		};
		const result = hasFinishedResolution( state, 'test', 'getFoo', [] );

		expect( result ).toBe( false );
	} );

	it( 'returns true if has finished', () => {
		const state = {
			test: {
				getFoo: new EquivalentKeyMap( [ [ [], false ] ] ),
			},
		};
		const result = hasFinishedResolution( state, 'test', 'getFoo', [] );

		expect( result ).toBe( true );
	} );
} );

describe( 'isResolving', () => {
	it( 'returns false if not has started', () => {
		const state = {};
		const result = isResolving( state, 'test', 'getFoo', [] );

		expect( result ).toBe( false );
	} );

	it( 'returns false if has finished', () => {
		const state = {
			test: {
				getFoo: new EquivalentKeyMap( [ [ [], false ] ] ),
			},
		};
		const result = isResolving( state, 'test', 'getFoo', [] );

		expect( result ).toBe( false );
	} );

	it( 'returns true if has started but not finished', () => {
		const state = {
			test: {
				getFoo: new EquivalentKeyMap( [ [ [], true ] ] ),
			},
		};
		const result = isResolving( state, 'test', 'getFoo', [] );

		expect( result ).toBe( true );
	} );
} );
