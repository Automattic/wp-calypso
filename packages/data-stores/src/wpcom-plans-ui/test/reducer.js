import { setShowDomainUpsellDialog } from '../actions';
import reducer from '../reducer';

describe( 'WpcomPlansUI reducer', () => {
	describe( 'showDomainUpsellDialog', () => {
		it( 'should set the domain upsell dialog visibility', () => {
			const action = setShowDomainUpsellDialog( true );
			const state = reducer( undefined, action );

			expect( state ).toEqual( {
				showDomainUpsellDialog: true,
			} );
		} );
	} );
} );
