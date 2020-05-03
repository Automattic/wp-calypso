jest.mock( 'components/purchase-detail', () => 'PurchaseDetail' );
jest.mock( '../google-vouchers', () => 'GoogleVouchers' );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import {
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { VideoAudioPosts } from '../video-audio-posts';

describe( 'VideoAudioPosts basic tests', () => {
	const props = {
		plan: PLAN_FREE,
		translate: ( x ) => x,
		selectedSite: {
			plan: PLAN_FREE,
		},
	};

	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <VideoAudioPosts { ...props } /> );
		expect( comp.find( 'PurchaseDetail' ).length ).toBe( 1 );
	} );
} );

describe( 'VideoAudioPosts should use proper description', () => {
	const props = {
		plan: PLAN_FREE,
		translate: ( x ) => x,
		selectedSite: {
			plan: PLAN_FREE,
		},
	};

	[ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ].forEach( ( plan ) => {
		test( `for business plan ${ plan }`, () => {
			const comp = shallow( <VideoAudioPosts { ...props } plan={ plan } /> );
			expect( comp.find( 'PurchaseDetail' ).props().description ).toContain( 'Business Plan' );
		} );
	} );

	[ PLAN_ECOMMERCE, PLAN_ECOMMERCE_2_YEARS ].forEach( ( plan ) => {
		test( `for ecommerce plan ${ plan }`, () => {
			const comp = shallow( <VideoAudioPosts { ...props } plan={ plan } /> );
			expect( comp.find( 'PurchaseDetail' ).props().description ).toContain( 'Ecommerce Plan' );
		} );
	} );

	[ PLAN_PREMIUM, PLAN_PREMIUM_2_YEARS ].forEach( ( plan ) => {
		test( `for premium plan ${ plan }`, () => {
			const comp = shallow( <VideoAudioPosts { ...props } plan={ plan } /> );
			expect( comp.find( 'PurchaseDetail' ).props().description ).toContain( '13GB of media' );
		} );
	} );

	[
		PLAN_FREE,
		PLAN_PERSONAL,
		PLAN_PERSONAL_2_YEARS,
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
	].forEach( ( plan ) => {
		test( `for plans ${ plan }`, () => {
			const comp = shallow( <VideoAudioPosts { ...props } plan={ plan } /> );
			expect( comp.find( 'PurchaseDetail' ).props().description ).toBe( '' );
		} );
	} );
} );
