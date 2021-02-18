/**
 * Internal dependencies
 */
import { transformSite } from '../transientItems';

describe( 'transientItems utils', () => {
	describe( 'transformSite', () => {
		const site1State = Object.freeze( {
			transientItems: Symbol( 'site 1 transientItems' ),
			transientIdsToServerIds: Symbol( 'site 1 transientIdsToServerIds' ),
		} );
		const site2State = Symbol( 'site 2 state' );

		let state;
		beforeEach( () => {
			state = {
				1: site1State,
				2: site2State,
			};
		} );

		test( 'should preserve other sites', () => {
			const site1NextState = Symbol( 'site 1 next state' );
			const result = transformSite( state, 1, () => site1NextState );

			// assert only site 1 state changed and site 2 was preserved
			expect( result ).toEqual( {
				1: site1NextState,
				2: site2State,
			} );
		} );

		test( 'should map the state using the mapping fn', () => {
			const map = jest.fn();
			transformSite( state, 1, map );

			expect( map ).toHaveBeenCalledWith( site1State );
		} );

		test( 'should handle non-existant site by passing safe defaults ', () => {
			const map = jest.fn( () => site1State );
			const result = transformSite( { 2: site2State }, 1, map );

			expect( map ).toHaveBeenCalledWith( {
				transientItems: {},
				transientIdsToServerIds: {},
			} );

			expect( result ).toEqual( {
				1: {
					transientItems: site1State.transientItems,
					transientIdsToServerIds: site1State.transientIdsToServerIds,
				},
				2: site2State,
			} );
		} );

		test( 'should handle empty site state by passing safe defaults', () => {
			const map = jest.fn( () => site1State );
			const result = transformSite(
				{
					1: {},
					2: site2State,
				},
				1,
				map
			);

			expect( map ).toHaveBeenCalledWith( {
				transientItems: {},
				transientIdsToServerIds: {},
			} );

			expect( result ).toEqual( {
				1: {
					transientItems: site1State.transientItems,
					transientIdsToServerIds: site1State.transientIdsToServerIds,
				},
				2: site2State,
			} );
		} );
	} );
} );
