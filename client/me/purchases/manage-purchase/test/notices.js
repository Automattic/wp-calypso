/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import PurchaseNotice from '../notices';

describe( 'PurchaseNotice', () => {
	const store = createReduxStore();
	const futureYearDate = new Date();
	futureYearDate.setFullYear( futureYearDate.getFullYear() + 10 );
	const pastYearDate = new Date();
	pastYearDate.setFullYear( pastYearDate.getFullYear() - 10 );

	it( 'renders pending payment text and no buttons if purchase has a payment pending', () => {
		const purchase = {
			product_slug: 'value_bundle',
			productName: 'Premium',
			isRechargeable: true,
			expiryStatus: 'manualRenew',
			asyncPendingPaymentBlockIsSet: true,
			canDisableAutoRenew: false,
			canReenableAutoRenewal: false,
			canExplicitRenew: false,
			isCancelable: false,
			isLocked: true,
			isRefundable: false,
			isRenewable: false,

			payment: {
				type: 'credit_card',
				creditCard: {
					expiryDate: '01/' + futureYearDate.getYear(),
					type: 'visa',
					number: 1111,
				},
			},
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect(
			screen.getByText( /There is currently a payment processing for this subscription/ )
		).toBeInTheDocument();
		expect( screen.queryByText( 'Add Payment Method' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Renew Now' ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing when data is still loading', () => {
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice isDataLoading renewableSitePurchases={ [] } />
			</ReduxProvider>
		);
		expect( screen.container ).toBeFalsy();
	} );

	it( 'renders nothing when the purchase is a domain transfer', () => {
		const purchase = { product_slug: 'domain_transfer' };
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice purchase={ purchase } renewableSitePurchases={ [] } />
			</ReduxProvider>
		);
		expect( screen.container ).toBeFalsy();
	} );

	it( 'renders non-product-owner message if not product owner', () => {
		const purchase = { product_slug: 'something_else' };
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner={ false }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect(
			screen.getByText( /This product was purchased by a different WordPress.com account./ )
		).toBeInTheDocument();
	} );

	it( 'renders concierge session used notice if concierge session has expired', () => {
		const purchase = { product_slug: 'concierge-session', expiryStatus: 'expired' };
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice purchase={ purchase } isProductOwner renewableSitePurchases={ [] } />
			</ReduxProvider>
		);
		expect( screen.getByText( 'This session has been used.' ) ).toBeInTheDocument();
	} );

	// TODO: add tests for remaining cases of renderOtherRenewablePurchasesNotice
	it( 'renders distant product expiry text and add card button if purchase is not expiring soon and the payment method is credits', () => {
		const purchase = {
			product_slug: 'value_bundle',
			productName: 'Premium',
			isRenewable: true,
			isRechargeable: false,
			expiryStatus: 'manualRenew',
			payment: { type: 'credits' },
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
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
			productName: 'Premium',
			isRenewable: true,
			isRechargeable: true,
			expiryStatus: 'manualRenew',
			payment: {
				type: 'credit_card',
				creditCard: {
					expiryDate: '01/' + futureYearDate.getYear(),
					type: 'visa',
					number: 1111,
				},
			},
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
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
			id: 'whatever1',
			product_slug: 'value_bundle',
			productName: 'Premium',
			isRenewable: false,
			isRechargeable: false,
			expiryStatus: 'expired',
			payment: { type: 'credit_card' },
		};
		const purchase = {
			id: 'whatever2',
			product_slug: 'domain_mapping',
			productName: 'Domain mapping',
			isRenewable: false,
			isRechargeable: false,
			expiryStatus: 'included',
			payment: { type: 'credit_card' },
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					purchaseAttachedTo={ plan }
					isProductOwner
					renewableSitePurchases={ [] }
					selectedSite={ { slug: 'testingsite' } }
				/>
			</ReduxProvider>
		);
		expect( screen.getByText( 'Premium plan' ) ).toBeInTheDocument();
		expect(
			screen.getByText( /\(which includes your Domain mapping subscription\) has expired/ )
		).toBeInTheDocument();
	} );

	it( 'renders expired purchase text and renew button if purchase is expired, renewable, not rechargable, and the payment method is a card', () => {
		const purchase = {
			product_slug: 'value_bundle',
			isRenewable: true,
			isRechargeable: false,
			expiryStatus: 'expired',
			payment: { type: 'credit_card' },
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect(
			screen.getByText( 'This purchase has expired and is no longer in use.' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Renew Now' ) ).toBeInTheDocument();
	} );

	it( 'renders expired purchase text and add card button if purchase is expired, renewable, not rechargable, and there is no payment method', () => {
		const purchase = {
			product_slug: 'value_bundle',
			isRenewable: true,
			isRechargeable: false,
			expiryStatus: 'expired',
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect(
			screen.getByText( 'This purchase has expired and is no longer in use.' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Add Payment Method' ) ).toBeInTheDocument();
	} );

	it( 'renders expired purchase text and renew button if purchase is expired, renewable, not rechargable, and payment method is credits', () => {
		const purchase = {
			product_slug: 'value_bundle',
			isRenewable: true,
			isRechargeable: false,
			expiryStatus: 'expired',
			payment: { type: 'credits' },
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect(
			screen.getByText( 'This purchase has expired and is no longer in use.' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Renew Now' ) ).toBeInTheDocument();
	} );

	it( 'renders nothing if purchase is expired, is not renewable, not rechargable, and the payment method is a card', () => {
		const purchase = {
			product_slug: 'value_bundle',
			isRenewable: false,
			isRechargeable: false,
			expiryStatus: 'expired',
			payment: { type: 'credit_card' },
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect( screen.container ).toBeFalsy();
	} );

	it( 'renders nothing if purchase is not expired, and is a partner purchase', () => {
		const purchase = {
			product_slug: 'value_bundle',
			isRenewable: false,
			partnerName: 'something',
			isRechargeable: false,
			expiryStatus: 'tofu',
			payment: { type: 'credit_card' },
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect( screen.container ).toBeFalsy();
	} );

	it( 'renders plan expiring text if purchase is included with a plan, and the plan is expiring', () => {
		const plan = {
			id: 'whatever1',
			product_slug: 'value_bundle',
			productName: 'Premium',
			isRenewable: false,
			isRechargeable: false,
			expiryStatus: 'expiring',
			payment: { type: 'credit_card' },
		};
		const purchase = {
			id: 'whatever2',
			product_slug: 'domain_mapping',
			productName: 'Domain mapping',
			isRenewable: false,
			isRechargeable: false,
			expiryStatus: 'included',
			payment: { type: 'credit_card' },
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					purchaseAttachedTo={ plan }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect( screen.getByText( 'Premium plan' ) ).toBeInTheDocument();
		expect(
			screen.getByText( /\(which includes your Domain mapping subscription\) will expire/ )
		).toBeInTheDocument();
	} );

	it( 'renders product expiring text and renew button if purchase is expiring and payment method is a card', () => {
		const purchase = {
			id: 'whatever1',
			product_slug: 'value_bundle',
			productName: 'Premium',
			isRenewable: false,
			isRechargeable: false,
			expiryStatus: 'expiring',
			payment: { type: 'credit_card' },
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect(
			screen.getByText( /Premium will expire and be removed from your site/ )
		).toBeInTheDocument();
		expect( screen.getByText( 'Renew Now' ) ).toBeInTheDocument();
	} );

	it( 'renders product expiring text and renew button if purchase is expiring and payment method is credits', () => {
		const purchase = {
			id: 'whatever1',
			product_slug: 'value_bundle',
			productName: 'Premium',
			isRenewable: false,
			isRechargeable: false,
			expiryStatus: 'expiring',
			payment: { type: 'credits' },
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect(
			screen.getByText( /Premium will expire and be removed from your site/ )
		).toBeInTheDocument();
		expect( screen.getByText( 'Renew Now' ) ).toBeInTheDocument();
	} );

	it( 'renders product expiring text and add card button if purchase is expiring and there is no payment method', () => {
		const purchase = {
			id: 'whatever1',
			product_slug: 'value_bundle',
			productName: 'Premium',
			isRenewable: false,
			isRechargeable: false,
			expiryStatus: 'expiring',
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect(
			screen.getByText( /Premium will expire and be removed from your site/ )
		).toBeInTheDocument();
		expect( screen.getByText( 'Add Payment Method' ) ).toBeInTheDocument();
	} );

	it( 'renders card expiring notice if card is expiring before subscription', () => {
		const purchaseExpiry = new Date();
		purchaseExpiry.setMonth( purchaseExpiry.getMonth() + 4 );
		const purchase = {
			id: 'whatever1',
			product_slug: 'value_bundle',
			productName: 'Premium',
			isRenewable: false,
			isRechargeable: false,
			expiryStatus: 'tofu',
			expiryDate: purchaseExpiry.toISOString(),
			payment: {
				type: 'credit_card',
				creditCard: {
					expiryDate: '01/' + pastYearDate.getYear(),
					type: 'visa',
					number: 1111,
				},
			},
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect( screen.getByText( /Your VISA ending in 1111 expires/ ) ).toBeInTheDocument();
		expect( screen.getByText( 'update your payment information' ) ).toBeInTheDocument();
	} );

	it( 'renders nothing if card is expiring before subscription and the purchase is included with a plan', () => {
		const purchaseExpiry = new Date();
		purchaseExpiry.setMonth( purchaseExpiry.getMonth() + 4 );
		const purchase = {
			id: 'whatever1',
			product_slug: 'value_bundle',
			productName: 'Premium',
			isRenewable: false,
			isRechargeable: false,
			expiryStatus: 'included',
			expiryDate: purchaseExpiry.toISOString(),
			payment: {
				type: 'credit_card',
				creditCard: {
					expiryDate: '01/' + pastYearDate.getYear(),
					type: 'visa',
					number: 1111,
				},
			},
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect( screen.container ).toBeFalsy();
	} );

	it( 'renders nothing if card is expiring before subscription and the purchase is a one-time purchase', () => {
		const purchaseExpiry = new Date();
		purchaseExpiry.setMonth( purchaseExpiry.getMonth() + 4 );
		const purchase = {
			id: 'whatever1',
			product_slug: 'value_bundle',
			productName: 'Premium',
			isRenewable: false,
			isRechargeable: false,
			expiryStatus: 'oneTimePurchase',
			expiryDate: purchaseExpiry.toISOString(),
			payment: {
				type: 'credit_card',
				creditCard: {
					expiryDate: '01/' + pastYearDate.getYear(),
					type: 'visa',
					number: 1111,
				},
			},
		};
		render(
			<ReduxProvider store={ store }>
				<PurchaseNotice
					purchase={ purchase }
					isProductOwner
					selectedSite={ { slug: 'testingsite' } }
					renewableSitePurchases={ [] }
				/>
			</ReduxProvider>
		);
		expect( screen.container ).toBeFalsy();
	} );
} );
