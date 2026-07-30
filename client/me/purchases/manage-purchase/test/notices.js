/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import PurchaseNotice from '../notices';

describe( 'PurchaseNotice', () => {
	const store = createReduxStore();
	const queryClient = new QueryClient();
	const futureYearDate = new Date();
	futureYearDate.setFullYear( futureYearDate.getFullYear() + 10 );
	const pastYearDate = new Date();
	pastYearDate.setFullYear( pastYearDate.getFullYear() - 10 );

	function renderNotice( props ) {
		return render(
			<ReduxProvider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<PurchaseNotice renewableSitePurchases={ [] } { ...props } />
				</QueryClientProvider>
			</ReduxProvider>
		);
	}

	it( 'renders pending payment text and no buttons if purchase has a payment pending', () => {
		const purchase = {
			product_slug: 'value_bundle',
			product_name: 'Premium',
			is_rechargeable: true,
			expiry_status: 'manual-renew',
			async_pending_payment_block_is_set: true,
			can_disable_auto_renew: false,
			can_reenable_auto_renewal: false,
			can_explicit_renew: false,
			is_cancelable: false,
			is_locked: true,
			is_refundable: false,
			is_renewable: false,
			payment_type: 'credit_card',
			payment_expiry: '01/' + futureYearDate.getYear(),
			payment_card_type: 'visa',
			payment_details: 1111,
		};
		renderNotice( {
			purchase,
			isProductOwner: true,
			selectedSite: { slug: 'testingsite' },
		} );
		expect(
			screen.getByText( /There is currently a payment processing for this subscription/ )
		).toBeInTheDocument();
		expect( screen.queryByText( 'Add Payment Method' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Renew Now' ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing when data is still loading', () => {
		renderNotice( { isDataLoading: true } );
		expect( screen.container ).toBeFalsy();
	} );

	it( 'renders nothing when the purchase is a domain transfer', () => {
		const purchase = { product_slug: 'domain_transfer' };
		renderNotice( { purchase } );
		expect( screen.container ).toBeFalsy();
	} );

	it( 'renders non-product-owner message if not product owner', () => {
		const purchase = { product_slug: 'something_else' };
		renderNotice( { purchase, isProductOwner: false } );
		expect(
			screen.getByText( /This product was purchased by a different WordPress.com account./ )
		).toBeInTheDocument();
	} );

	it( 'renders concierge session used notice if concierge session has expired', () => {
		const purchase = { product_slug: 'concierge-session', expiry_status: 'expired' };
		renderNotice( { purchase, isProductOwner: true } );
		expect( screen.getByText( 'This session has been used.' ) ).toBeInTheDocument();
	} );

	// TODO: add tests for remaining cases of renderOtherRenewablePurchasesNotice
	it( 'renders distant product expiry text and add card button if purchase is not expiring soon and the payment method is credits', () => {
		const purchase = {
			product_slug: 'value_bundle',
			product_name: 'Premium',
			is_renewable: true,
			is_rechargeable: false,
			expiry_status: 'manual-renew',
			subscription_status: 'active',
			payment_type: 'credits',
		};
		renderNotice( { purchase, isProductOwner: true, selectedSite: { slug: 'testingsite' } } );
		expect(
			screen.getByText(
				/You purchased Premium with credits. Please update your payment information before your plan expires/
			)
		).toBeInTheDocument();
		expect( screen.getByText( 'Add Payment Method' ) ).toBeInTheDocument();
	} );

	it( 'renders distant product expiry text and no button if purchase is not expiring soon and the payment method is a card', () => {
		const purchase = {
			product_slug: 'value_bundle',
			product_name: 'Premium',
			is_renewable: true,
			is_rechargeable: true,
			expiry_status: 'manual-renew',
			subscription_status: 'active',
			payment_type: 'credit_card',
			payment_expiry: '01/' + futureYearDate.getYear(),
			payment_card_type: 'visa',
			payment_details: 1111,
		};
		renderNotice( { purchase, isProductOwner: true, selectedSite: { slug: 'testingsite' } } );
		expect(
			screen.getByText( /Premium will expire and be removed from your site/ )
		).toBeInTheDocument();
		expect(
			screen.getByText( /Please enable auto-renewal so you don't lose out on your paid features/ )
		).toBeInTheDocument();
		expect( screen.queryByText( 'Add Payment Method' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Renew Now' ) ).not.toBeInTheDocument();
	} );

	it( 'renders expired plan text if purchase is included with a plan, the plan is expired, and the purchase is not renewable', () => {
		const plan = {
			ID: 'whatever1',
			product_slug: 'value_bundle',
			product_name: 'Premium',
			is_renewable: false,
			is_rechargeable: false,
			expiry_status: 'expired',
			payment_type: 'credit_card',
		};
		const purchase = {
			ID: 'whatever2',
			product_slug: 'domain_mapping',
			product_name: 'Domain mapping',
			is_renewable: false,
			is_rechargeable: false,
			expiry_status: 'included',
			payment_type: 'credit_card',
		};
		renderNotice( {
			purchase,
			purchaseAttachedTo: plan,
			isProductOwner: true,
			selectedSite: { slug: 'testingsite' },
		} );
		expect( screen.getByText( 'Premium plan' ) ).toBeInTheDocument();
		expect(
			screen.getByText( /\(which includes your Domain mapping subscription\) has expired/ )
		).toBeInTheDocument();
	} );

	it( 'renders expired purchase text and renew button if purchase is expired, renewable, not rechargable, and the payment method is a card', () => {
		const purchase = {
			product_slug: 'value_bundle',
			is_renewable: true,
			is_rechargeable: false,
			expiry_status: 'expired',
			payment_type: 'credit_card',
		};
		renderNotice( { purchase, isProductOwner: true, selectedSite: { slug: 'testingsite' } } );
		expect(
			screen.getByText( 'This purchase has expired and is no longer in use.' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Renew Now' ) ).toBeInTheDocument();
	} );

	it( 'renders expired purchase text and add card button if purchase is expired, renewable, not rechargable, and there is no payment method', () => {
		const purchase = {
			product_slug: 'value_bundle',
			is_renewable: true,
			is_rechargeable: false,
			expiry_status: 'expired',
		};
		renderNotice( { purchase, isProductOwner: true, selectedSite: { slug: 'testingsite' } } );
		expect(
			screen.getByText( 'This purchase has expired and is no longer in use.' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Add Payment Method' ) ).toBeInTheDocument();
	} );

	it( 'renders expired purchase text and renew button if purchase is expired, renewable, not rechargable, and payment method is credits', () => {
		const purchase = {
			product_slug: 'value_bundle',
			is_renewable: true,
			is_rechargeable: false,
			expiry_status: 'expired',
			payment_type: 'credits',
		};
		renderNotice( { purchase, isProductOwner: true, selectedSite: { slug: 'testingsite' } } );
		expect(
			screen.getByText( 'This purchase has expired and is no longer in use.' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Renew Now' ) ).toBeInTheDocument();
	} );

	it( 'renders nothing if purchase is expired, is not renewable, not rechargable, and the payment method is a card', () => {
		const purchase = {
			product_slug: 'value_bundle',
			is_renewable: false,
			is_rechargeable: false,
			expiry_status: 'expired',
			payment_type: 'credit_card',
		};
		renderNotice( { purchase, isProductOwner: true, selectedSite: { slug: 'testingsite' } } );
		expect( screen.container ).toBeFalsy();
	} );

	it( 'renders nothing if purchase is not expired, and is a partner purchase', () => {
		const purchase = {
			product_slug: 'value_bundle',
			is_renewable: false,
			partner_name: 'something',
			is_rechargeable: false,
			expiry_status: 'tofu',
			payment_type: 'credit_card',
		};
		renderNotice( { purchase, isProductOwner: true, selectedSite: { slug: 'testingsite' } } );
		expect( screen.container ).toBeFalsy();
	} );

	it( 'renders plan expiring text if purchase is included with a plan, and the plan is expiring', () => {
		const plan = {
			ID: 'whatever1',
			product_slug: 'value_bundle',
			product_name: 'Premium',
			is_renewable: false,
			is_rechargeable: false,
			expiry_status: 'expiring',
			subscription_status: 'active',
			payment_type: 'credit_card',
		};
		const purchase = {
			ID: 'whatever2',
			product_slug: 'domain_mapping',
			product_name: 'Domain mapping',
			is_renewable: false,
			is_rechargeable: false,
			expiry_status: 'included',
			subscription_status: 'active',
			payment_type: 'credit_card',
		};
		renderNotice( {
			purchase,
			isProductOwner: true,
			selectedSite: { slug: 'testingsite' },
			purchaseAttachedTo: plan,
		} );
		expect( screen.getByText( 'Premium plan' ) ).toBeInTheDocument();
		expect(
			screen.getByText( /\(which includes your Domain mapping subscription\) will expire/ )
		).toBeInTheDocument();
	} );

	it( 'renders product expiring text and renew button if purchase is expiring and payment method is a card', () => {
		const purchase = {
			ID: 'whatever1',
			product_slug: 'value_bundle',
			product_name: 'Premium',
			is_renewable: false,
			is_rechargeable: false,
			expiry_status: 'expiring',
			payment_type: 'credit_card',
		};
		renderNotice( { purchase, isProductOwner: true, selectedSite: { slug: 'testingsite' } } );
		expect(
			screen.getByText( /Premium will expire and be removed from your site/ )
		).toBeInTheDocument();
		expect( screen.getByText( 'Renew Now' ) ).toBeInTheDocument();
	} );

	it( 'renders product expiring text and renew button if purchase is expiring and payment method is credits', () => {
		const purchase = {
			ID: 'whatever1',
			product_slug: 'value_bundle',
			product_name: 'Premium',
			is_renewable: false,
			is_rechargeable: false,
			expiry_status: 'expiring',
			payment_type: 'credits',
		};
		renderNotice( { purchase, isProductOwner: true, selectedSite: { slug: 'testingsite' } } );
		expect(
			screen.getByText( /Premium will expire and be removed from your site/ )
		).toBeInTheDocument();
		expect( screen.getByText( 'Renew Now' ) ).toBeInTheDocument();
	} );

	it( 'renders product expiring text and add card button if purchase is expiring and there is no payment method', () => {
		const purchase = {
			ID: 'whatever1',
			product_slug: 'value_bundle',
			product_name: 'Premium',
			is_renewable: false,
			is_rechargeable: false,
			expiry_status: 'expiring',
		};
		renderNotice( { purchase, isProductOwner: true, selectedSite: { slug: 'testingsite' } } );
		expect(
			screen.getByText( /Premium will expire and be removed from your site/ )
		).toBeInTheDocument();
		expect( screen.getByText( 'Add Payment Method' ) ).toBeInTheDocument();
	} );

	it( 'renders card expiring notice if card is expiring before subscription', () => {
		const purchaseExpiry = new Date();
		purchaseExpiry.setMonth( purchaseExpiry.getMonth() + 4 );
		const purchase = {
			ID: 'whatever1',
			product_slug: 'value_bundle',
			product_name: 'Premium',
			is_renewable: false,
			is_rechargeable: false,
			expiry_status: 'tofu',
			subscription_status: 'active',
			expiry_date: purchaseExpiry.toISOString(),
			payment_type: 'credit_card',
			payment_expiry: '01/' + pastYearDate.getYear(),
			payment_card_type: 'visa',
			payment_details: 1111,
		};
		renderNotice( { purchase, isProductOwner: true, selectedSite: { slug: 'testingsite' } } );
		expect( screen.getByText( /Your VISA ending in 1111 expired/ ) ).toBeInTheDocument();
		expect( screen.getByText( 'update your payment information' ) ).toBeInTheDocument();
	} );

	it( 'renders nothing if card is expiring before subscription and the purchase is included with a plan', () => {
		const purchaseExpiry = new Date();
		purchaseExpiry.setMonth( purchaseExpiry.getMonth() + 4 );
		const purchase = {
			ID: 'whatever1',
			product_slug: 'value_bundle',
			product_name: 'Premium',
			is_renewable: false,
			is_rechargeable: false,
			expiry_status: 'included',
			expiry_date: purchaseExpiry.toISOString(),
			payment_type: 'credit_card',
			payment_expiry: '01/' + pastYearDate.getYear(),
			payment_card_type: 'visa',
			payment_details: 1111,
		};
		renderNotice( { purchase, isProductOwner: true, selectedSite: { slug: 'testingsite' } } );
		expect( screen.container ).toBeFalsy();
	} );

	it( 'renders nothing if card is expiring before subscription and the purchase is a one-time purchase', () => {
		const purchaseExpiry = new Date();
		purchaseExpiry.setMonth( purchaseExpiry.getMonth() + 4 );
		const purchase = {
			ID: 'whatever1',
			product_slug: 'value_bundle',
			product_name: 'Premium',
			is_renewable: false,
			is_rechargeable: false,
			expiry_status: 'one-time-purchase',
			expiry_date: purchaseExpiry.toISOString(),
			payment_type: 'credit_card',
			payment_expiry: '01/' + pastYearDate.getYear(),
			payment_card_type: 'visa',
			payment_details: 1111,
		};
		renderNotice( { purchase, isProductOwner: true, selectedSite: { slug: 'testingsite' } } );
		expect( screen.container ).toBeFalsy();
	} );
} );
