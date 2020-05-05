/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import {
	PLAN_FREE,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
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
import { CheckoutThankYou } from '../index';

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.unmock( 'lib/plans' );
const plans = require( 'lib/plans' );
plans.getFeatureByKey = () => null;
plans.shouldFetchSitePlans = () => false;

jest.unmock( 'lib/products-values' );
const productValues = require( 'lib/products-values' );
productValues.isDotComPlan = jest.fn( () => false );

jest.mock( 'lib/analytics/tracks', () => ( {
	recordTracksEvent: () => null,
} ) );
jest.mock( '../domain-registration-details', () => 'component--domain-registration-details' );
jest.mock( '../google-apps-details', () => 'component--google-apps-details' );
jest.mock( '../jetpack-plan-details', () => 'component--jetpack-plan-details' );
jest.mock( '../rebrand-cities-thank-you', () => 'component--RebrandCitiesThankYou' );
jest.mock( '../atomic-store-thank-you-card', () => 'component--AtomicStoreThankYouCard' );
jest.mock( 'lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( '../header', () => 'CheckoutThankYouHeader' );
jest.mock( 'components/happiness-support', () => 'HappinessSupport' );
jest.mock( 'lib/rebrand-cities', () => ( {
	isRebrandCitiesSiteUrl: jest.fn( () => false ),
} ) );

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

import RebrandCities from 'lib/rebrand-cities';

const translate = ( x ) => x;

const defaultProps = {
	translate,
	receipt: {
		data: {},
	},
	loadTrackingTool: () => {},
	fetchReceipt: () => {},
};

describe( 'CheckoutThankYou', () => {
	beforeAll( () => {
		global.window = {
			scrollTo: () => null,
		};
	} );
	afterAll( () => {
		delete global.window;
	} );

	describe( 'Basic tests', () => {
		test( 'should not blow up and have proper CSS class', () => {
			const comp = shallow( <CheckoutThankYou { ...defaultProps } /> );
			expect( comp.find( '.checkout-thank-you' ) ).toHaveLength( 1 );
		} );

		test( 'Show WordPressLogo when there are no purchase but a receipt is present', () => {
			const comp = shallow( <CheckoutThankYou { ...defaultProps } receiptId={ 12 } /> );
			expect( comp.find( 'WordPressLogo' ) ).toHaveLength( 1 );
		} );
	} );

	describe( 'Simplified page', () => {
		const props = {
			...defaultProps,
			receiptId: 12,
			selectedSite: {
				ID: 12,
			},
			sitePlans: {
				hasLoadedFromServer: true,
			},
			receipt: {
				hasLoadedFromServer: true,
				data: {
					purchases: [ { productSlug: PLAN_BUSINESS }, [] ],
				},
			},
			refreshSitePlans: ( selectedSite ) => selectedSite,
			planSlug: PLAN_BUSINESS,
		};
		test( 'Should display a full version when isSimplified is missing', () => {
			const comp = shallow( <CheckoutThankYou { ...props } /> );
			expect( comp.find( '.checkout-thank-you__purchase-details-list' ) ).toHaveLength( 1 );
			expect( comp.find( 'HappinessSupport' ) ).toHaveLength( 1 );
			expect( comp.find( 'CheckoutThankYouHeader' ).props().isSimplified ).toBeFalsy();
		} );
		test( 'Should display a simplified version when isSimplified is set to true', () => {
			const comp = shallow( <CheckoutThankYou { ...props } isSimplified={ true } /> );
			expect( comp.find( '.checkout-thank-you__purchase-details-list' ) ).toHaveLength( 0 );
			expect( comp.find( 'HappinessSupport' ) ).toHaveLength( 0 );
			expect( comp.find( 'CheckoutThankYouHeader' ).props().isSimplified ).toBe( true );
		} );
		test( 'Should pass props down to CheckoutThankYou', () => {
			const comp = shallow(
				<CheckoutThankYou
					{ ...props }
					isSimplified={ true }
					siteUnlaunchedBeforeUpgrade={ true }
					upgradeIntent={ 'plugins' }
				/>
			);
			expect( comp.find( 'CheckoutThankYouHeader' ).props().siteUnlaunchedBeforeUpgrade ).toBe(
				true
			);
			expect( comp.find( 'CheckoutThankYouHeader' ).props().upgradeIntent ).toBe( 'plugins' );
		} );
	} );

	describe( 'Presence of <RebrandCitiesThankYou /> in render() output', () => {
		afterAll( () => {
			RebrandCities.isRebrandCitiesSiteUrl.mockImplementation( () => false );
		} );

		[ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ].forEach( ( product_slug ) => {
			test( 'Should be there for a business plan', () => {
				RebrandCities.isRebrandCitiesSiteUrl.mockImplementation( () => true );
				const props = {
					...defaultProps,
					selectedSite: {
						plan: {
							product_slug,
						},
					},
				};
				const comp = shallow( <CheckoutThankYou { ...props } /> );
				expect( comp.find( 'component--RebrandCitiesThankYou' ) ).toHaveLength( 1 );
			} );
		} );

		[ PLAN_BUSINESS, PLAN_BUSINESS_2_YEARS ].forEach( ( product_slug ) => {
			test( 'Should not be there for a business plan if isRebrandCitiesSiteUrl is false', () => {
				RebrandCities.isRebrandCitiesSiteUrl.mockImplementation( () => false );
				const props = {
					...defaultProps,
					selectedSite: {
						plan: {
							product_slug,
						},
					},
				};
				const comp = shallow( <CheckoutThankYou { ...props } /> );
				expect( comp.find( 'component--RebrandCitiesThankYou' ) ).toHaveLength( 0 );
			} );
		} );

		[
			PLAN_BLOGGER,
			PLAN_BLOGGER_2_YEARS,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_BUSINESS,
			PLAN_JETPACK_BUSINESS_MONTHLY,
		].forEach( ( product_slug ) => {
			test( 'Should not be there for any no-business plan', () => {
				RebrandCities.isRebrandCitiesSiteUrl.mockImplementation( () => true );
				const props = {
					...defaultProps,
					selectedSite: {
						plan: {
							product_slug,
						},
					},
				};
				const comp = shallow( <CheckoutThankYou { ...props } /> );
				expect( comp.find( 'component--RebrandCitiesThankYou' ) ).toHaveLength( 0 );
			} );
		} );
	} );

	describe( 'Presence of <AtomicStoreThankYouCard /> in render() output', () => {
		const props = {
			...defaultProps,
			receiptId: 12,
			selectedSite: {
				ID: 12,
			},
			sitePlans: {
				hasLoadedFromServer: true,
			},
			receipt: {
				hasLoadedFromServer: true,
				data: {
					purchases: [ { productSlug: PLAN_ECOMMERCE }, [] ],
				},
			},
			refreshSitePlans: ( selectedSite ) => selectedSite,
			planSlug: PLAN_ECOMMERCE,
		};

		afterAll( () => {
			productValues.isDotComPlan.mockImplementation( () => false );
		} );

		test( 'Should be there for AT', () => {
			const comp = shallow( <CheckoutThankYou { ...props } transferComplete={ true } /> );
			expect( comp.find( 'component--AtomicStoreThankYouCard' ) ).toHaveLength( 1 );
		} );

		test( 'Should not be there for AT', () => {
			let comp;
			comp = shallow( <CheckoutThankYou { ...props } transferComplete={ false } /> );
			expect( comp.find( 'component--AtomicStoreThankYouCard' ) ).toHaveLength( 0 );

			productValues.isDotComPlan.mockImplementation( () => true );

			comp = shallow( <CheckoutThankYou { ...props } /> );
			expect( comp.find( 'component--AtomicStoreThankYouCard' ) ).toHaveLength( 0 );
		} );
	} );

	describe( 'isEligibleForLiveChat', () => {
		[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY ].forEach( ( planSlug ) => {
			test( `Should return true for Jetpack business plans (${ planSlug })`, () => {
				const instance = new CheckoutThankYou( { planSlug } );
				expect( instance.isEligibleForLiveChat() ).toBe( true );
			} );
		} );

		[
			PLAN_FREE,
			PLAN_BLOGGER,
			PLAN_BLOGGER_2_YEARS,
			PLAN_PERSONAL,
			PLAN_PERSONAL_2_YEARS,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
			PLAN_PREMIUM,
			PLAN_PREMIUM_2_YEARS,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_BUSINESS,
			PLAN_BUSINESS_2_YEARS,
			PLAN_ECOMMERCE,
			PLAN_ECOMMERCE_2_YEARS,
		].forEach( ( planSlug ) => {
			test( `Should return false for all other plans (${ planSlug })`, () => {
				const instance = new CheckoutThankYou( { planSlug } );
				expect( instance.isEligibleForLiveChat() ).toBe( false );
			} );
		} );
	} );
} );
