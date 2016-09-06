import { expect } from 'chai';
import { getPromoLink } from '../lib/promo-retriever'

describe( 'promo-retriever', ( ) => {
	context( 'getPromoLink', ( ) => {
		it('should render a mobile link when the mobile promo code is passed in', ( ) => {
			expect( getPromoLink( 'reader','a0006' ) ).to.include( 'mobile' );
		});

		it('should render a desktop link when the desktop promo code is passed in', ( ) => {
			expect( getPromoLink( 'reader', 'a0001' ) ).to.include( 'desktop' );
			expect( getPromoLink( 'reader', 'a0002' ) ).to.include( 'desktop' );
			expect( getPromoLink( 'reader', 'a0003' ) ).to.include( 'desktop' );
			expect( getPromoLink( 'reader', 'a0005' ) ).to.include( 'desktop' );
		});
	} );
} );
