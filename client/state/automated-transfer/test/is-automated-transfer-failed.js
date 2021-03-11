/**
 * Internal dependencies
 */
import { isFailed } from '../selectors/is-automated-transfer-failed';
import { transferStates } from '../constants';

describe( 'Automated Transfer', () => {
	describe( 'isFailed()', () => {
		test( 'should return `null` if no information is available', () => {
			expect( isFailed( null ) ).toBeNull();
			expect( isFailed( '' ) ).toBeNull(); // plausible that the status could wind up as an empty string
		} );

		test( 'should return `true` for failed transfer states', () => {
			expect( isFailed( transferStates.CONFLICTS ) ).toBe( true );
			expect( isFailed( transferStates.FAILURE ) ).toBe( true );
		} );

		test( 'should return `false` for non-failed transfer states', () => {
			expect( isFailed( transferStates.COMPLETE ) ).toBe( false );
			expect( isFailed( transferStates.INQUIRING ) ).toBe( false );
			expect( isFailed( transferStates.START ) ).toBe( false );
		} );
	} );
} );
