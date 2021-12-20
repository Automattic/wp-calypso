/**
 * @jest-environment jsdom
 */

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
	isDotComPlan,
	WPCOM_DIFM_LITE,
	isDIFMProduct,
} from '@automattic/calypso-products';
import { shallow } from 'enzyme';
import DIFMLiteThankYou from 'calypso/my-sites/checkout/checkout-thank-you/difm/difm-lite-thank-you';
import { CheckoutThankYou } from '../index';

jest.unmock( '@automattic/calypso-products' );
jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	shouldFetchSitePlans: () => false,
	isDotComPlan: jest.fn( () => false ),
	isDIFMProduct: jest.fn( () => false ),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: () => null,
} ) );
jest.mock( '../domain-registration-details', () => 'component--domain-registration-details' );
jest.mock( '../google-apps-details', () => 'component--google-apps-details' );
jest.mock( '../jetpack-plan-details', () => 'component--jetpack-plan-details' );
jest.mock( '../atomic-store-thank-you-card', () => 'component--AtomicStoreThankYouCard' );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( '../header', () => 'CheckoutThankYouHeader' );
jest.mock( 'calypso/components/happiness-support', () => 'HappinessSupport' );

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
			isDotComPlan.mockImplementation( () => false );
		} );

		test( 'Should be there for AT', () => {
			const comp = shallow( <CheckoutThankYou { ...props } transferComplete={ true } /> );
			expect( comp.find( 'component--AtomicStoreThankYouCard' ) ).toHaveLength( 1 );
		} );

		test( 'Should not be there for AT', () => {
			let comp;
			comp = shallow( <CheckoutThankYou { ...props } transferComplete={ false } /> );
			expect( comp.find( 'component--AtomicStoreThankYouCard' ) ).toHaveLength( 0 );

			isDotComPlan.mockImplementation( () => true );

			comp = shallow( <CheckoutThankYou { ...props } /> );
			expect( comp.find( 'component--AtomicStoreThankYouCard' ) ).toHaveLength( 0 );
		} );
	} );

	describe( 'Presence of <DIFMLiteThankYou /> in render() output', () => {
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
					purchases: [ { productSlug: PLAN_PREMIUM }, { productSlug: WPCOM_DIFM_LITE }, [] ],
				},
			},
			refreshSitePlans: ( selectedSite ) => selectedSite,
			planSlug: PLAN_PREMIUM,
		};
		test( 'Should be there with DIFM product', () => {
			isDIFMProduct.mockImplementation( () => true );
			const comp = shallow( <CheckoutThankYou { ...props } /> );

			expect( comp.find( DIFMLiteThankYou ) ).toHaveLength( 1 );
		} );

		test( 'Should not be there when no DIFM product', () => {
			isDIFMProduct.mockImplementation( () => false );

			const comp = shallow(
				<CheckoutThankYou
					{ ...{
						...props,
						receipt: {
							...props.receipt,
							data: {
								purchases: [ { productSlug: PLAN_PREMIUM }, [] ],
							},
						},
					} }
				/>
			);
			expect( comp.find( DIFMLiteThankYou ) ).toHaveLength( 0 );
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
