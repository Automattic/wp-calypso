/**
 * Internal dependencies
 */
import { isActive } from '../selectors/is-automated-transfer-active';
import { transferStates } from '../constants';

describe( 'Automated Transfer', () => {
	describe( 'isActive()', () => {
		test( 'should return `null` if no information is available', () => {
			expect( isActive( null ) ).toBeNull();
			expect( isActive( '' ) ).toBeNull(); // plausible that the status could wind up as an empty string
		} );

		test( 'should return `true` for active transfer states', () => {
			expect( isActive( transferStates.START ) ).toBe( true );
		} );

		test( 'should return `false` for non-active transfer states', () => {
			expect( isActive( transferStates.COMPLETE ) ).toBe( false );
			expect( isActive( transferStates.CONFLICTS ) ).toBe( false );
			expect( isActive( transferStates.FAILURE ) ).toBe( false );
			expect( isActive( transferStates.INQUIRING ) ).toBe( false );
		} );
	} );
} );
