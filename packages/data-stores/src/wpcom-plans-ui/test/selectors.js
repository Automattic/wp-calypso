import { isDomainUpsellDialogShown } from '../selectors';

describe( 'WpcomPlansUI selectors', () => {
	describe( 'isDomainUpsellDialogShown', () => {
		it( 'should retrieve the domain upsell dialog visibility', () => {
			const state = {
				showDomainUpsellDialog: true,
			};

			expect( isDomainUpsellDialogShown( state ) ).toBe( true );
		} );

		it( 'should retrieve false if domain upsell dialog visibility is undefined', () => {
			const state = {};

			expect( isDomainUpsellDialogShown( state ) ).toBe( false );
		} );
	} );
} );
