import { JETPACK_BACKUP_PREFLIGHT_TESTS_SET } from 'calypso/state/action-types';
import preflightReducer from '../reducer';
import { PreflightState, PreflightTestStatus } from '../types';
import { calculateOverallStatus } from '../utils';

describe( 'preflightReducer', () => {
	const initialState: PreflightState = {
		overallStatus: PreflightTestStatus.PENDING,
		tests: [],
	};

	it( 'should return the initial state when an undefined state and an unknown action type are provided', () => {
		const action = { type: 'unknown' };
		expect( preflightReducer( undefined, action ) ).toEqual( initialState );
	} );

	it( 'should maintain the current state when an unrecognized action type is dispatched', () => {
		const previousState = {
			overallStatus: PreflightTestStatus.SUCCESS,
			tests: [ { test: 'test1', status: PreflightTestStatus.SUCCESS } ],
		};

		const action = { type: 'ANOTHER_ACTION' };
		expect( preflightReducer( previousState, action ) ).toEqual( previousState );
	} );

	it( 'should not alter the state when JETPACK_BACKUP_PREFLIGHT_TESTS_SET is dispatched with an empty payload', () => {
		const action = {
			type: JETPACK_BACKUP_PREFLIGHT_TESTS_SET,
		};
		const expectedState = {
			...initialState,
			overallStatus: PreflightTestStatus.PENDING,
		};
		expect( preflightReducer( initialState, action ) ).toEqual( expectedState );
	} );

	it( 'should correctly update the state with new statuses for existing tests upon receiving JETPACK_BACKUP_PREFLIGHT_TESTS_SET action', () => {
		// Previous state with three tests
		const previousState: PreflightState = {
			overallStatus: PreflightTestStatus.PENDING,
			tests: [
				{ test: 'test1', status: PreflightTestStatus.PENDING },
				{ test: 'test2', status: PreflightTestStatus.PENDING },
				{ test: 'test3', status: PreflightTestStatus.PENDING },
			],
		};

		// New statuses for the existing tests
		const updatedTests = [
			{ test: 'test1', status: PreflightTestStatus.SUCCESS },
			{ test: 'test2', status: PreflightTestStatus.FAILED },
			{ test: 'test3', status: PreflightTestStatus.IN_PROGRESS },
		];

		// Action to update the state
		const action = {
			type: JETPACK_BACKUP_PREFLIGHT_TESTS_SET,
			tests: updatedTests,
		};

		// Expected new state
		const expectedState = {
			overallStatus: calculateOverallStatus( updatedTests ),
			tests: updatedTests,
		};

		// Reducer should update the state correctly
		expect( preflightReducer( previousState, action ) ).toEqual( expectedState );
	} );
} );
