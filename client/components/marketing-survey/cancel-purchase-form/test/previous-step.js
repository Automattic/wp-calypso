import previousStep from '../previous-step';

describe( 'previousStep', () => {
	const steps = [ 'a', 'b', 'c' ];

	test( 'should return initial step if current step is unknown', () => {
		expect( previousStep( 'unknown', steps ) ).toEqual( 'a' );
	} );

	test( 'should return initial step if current step is initial step', () => {
		expect( previousStep( 'a', steps ) ).toEqual( 'a' );
	} );

	test( 'should return previous step current step is subsequent step', () => {
		expect( previousStep( 'c', steps ) ).toEqual( 'b' );
	} );
} );
