/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getVouchersBySite,
	getVouchersBySiteId,
	getVouchersBySiteIdAndServiceType,
	isRequestingSiteVouchers
} from '../selectors';

/**
 * Fixture data
 */
import {
	SITE_ID_0 as firstSiteId,
	SITE_ID_1 as secondSiteId,
	AD_CREDITS_0 as firstAdCredits,
	VOUCHER_0 as firstVoucher,
	SERVICE_TYPE as serviceType,
	getStateInstance
} from './fixture';

describe( 'selectors', () => {
	describe( '#getVouchersBySite()', () => {
		it( 'should return vouchers by site', () => {
			const state = getStateInstance();
			const vouchers = getVouchersBySite( state, { ID: firstSiteId } );
			expect( vouchers ).to.eql( firstAdCredits );
		} );
	} );

	describe( '#getVouchersBySiteId()', () => {
		it( 'should return vouchers by site id', () => {
			const state = getStateInstance();
			const vouchers = getVouchersBySiteId( state, firstSiteId );
			expect( vouchers ).to.eql( firstAdCredits );
		} );
	} );

	describe( '#getVouchersBySiteIdAndServiceType()', () => {
		it( 'should return vouchers by site id', () => {
			const state = getStateInstance();
			const vouchers = getVouchersBySiteIdAndServiceType( state, firstSiteId, serviceType );
			expect( vouchers ).to.eql( [ firstVoucher ] );
		} );
	} );

	describe( '#isRequestingSiteVouchers()', () => {
		it( 'should return true if we are fetching vouchers', () => {
			const state = getStateInstance();

			expect( isRequestingSiteVouchers( state, firstSiteId ) ).to.equal( false );
			expect( isRequestingSiteVouchers( state, secondSiteId ) ).to.equal( true );
			expect( isRequestingSiteVouchers( state, 'unknown' ) ).to.equal( false );
		} );
	} );
} );
