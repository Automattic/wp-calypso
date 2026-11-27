import { select, dispatch } from '@wordpress/data';
import { register } from '..';

let store: ReturnType< typeof register >;

beforeAll( () => {
	store = register();
} );

describe( 'StepperInternal selectors', () => {
	it( 'can set the step data and retrieve it', async () => {
		const data = { message: 'test' };

		expect( select( store ).getStepData() ).toEqual( null );

		dispatch( store ).setStepData( data );
		expect( select( store ).getStepData() ).toEqual( data );

		dispatch( store ).clearStepData();
		expect( select( store ).getStepData() ).toEqual( null );
	} );
} );
