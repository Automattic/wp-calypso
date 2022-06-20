import { setStepData, clearStepData } from '../actions';

describe( 'StepperInternal actions', () => {
	it( 'should return a SET_STEP_DATA Action', () => {
		const data = {};

		const expected = {
			type: 'SET_STEP_DATA',
			data,
		};

		expect( setStepData( data ) ).toEqual( expected );
	} );

	it( 'should return a CLEAR_STEP_DATA Action', () => {
		const expected = {
			type: 'CLEAR_STEP_DATA',
		};

		expect( clearStepData() ).toEqual( expected );
	} );
} );
