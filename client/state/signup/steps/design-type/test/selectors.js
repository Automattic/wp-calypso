import { getDesignType } from '../selectors';

describe( 'selectors', () => {
	test( 'should return empty string as a default state', () => {
		expect( getDesignType( { signup: undefined } ) ).toEqual( '' );
	} );

	test( 'should return design type from the state', () => {
		expect(
			getDesignType( {
				signup: {
					steps: {
						designType: 'design type',
					},
				},
			} )
		).toEqual( 'design type' );
	} );
} );
