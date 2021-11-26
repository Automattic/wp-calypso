import { defaultValue } from '../reducer';
import { getDIFMLiteState, getSelectedCategory } from '../selectors';

describe( 'DIFM Lite Data selectors', () => {
	test( 'Should return default state by default', () => {
		expect( getDIFMLiteState( {} ) ).toEqual( defaultValue );
	} );

	test( 'Should get DIFM lite state', () => {
		expect(
			getDIFMLiteState( {
				signup: {
					steps: {
						difmLite: {
							selectedDIFMCategory: 'creative services',
							typeformResponseId: 'XXXTTT',
						},
					},
				},
			} )
		).toEqual( {
			selectedDIFMCategory: 'creative services',
			typeformResponseId: 'XXXTTT',
		} );
	} );

	test( 'Should get selected category', () => {
		expect(
			getSelectedCategory( {
				signup: {
					steps: {
						difmLite: {
							selectedDIFMCategory: 'creative services',
							typeformResponseId: 'XXXTTT',
						},
					},
				},
			} )
		).toEqual( 'creative services' );
	} );
} );
