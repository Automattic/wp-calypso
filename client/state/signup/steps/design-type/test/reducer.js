import { SIGNUP_STEPS_DESIGN_TYPE_SET } from 'calypso/state/action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	test( 'should update the design type', () => {
		expect(
			reducer(
				{},
				{
					type: SIGNUP_STEPS_DESIGN_TYPE_SET,
					designType: 'design type',
				}
			)
		).toEqual( 'design type' );
	} );
} );
