/**
 * @jest-environment jsdom
 */
import { fetchWooCommerceLicenseSites } from '@automattic/api-core';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import a8cForAgencies from 'calypso/state/a8c-for-agencies/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import LicensePreview from '../index';
import type { License } from 'calypso/state/partner-portal/types';

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchWooCommerceLicenseSites: jest.fn(),
} ) );

jest.mock( 'calypso/a8c-for-agencies/hooks/use-help-center', () => ( {
	__esModule: true,
	default: () => ( { showSupportGuide: jest.fn() } ),
} ) );

jest.mock( '../../../payment-methods/hooks/use-payment-method', () => ( {
	__esModule: true,
	default: () => ( { paymentMethodRequired: false } ),
} ) );

jest.mock( 'calypso/a8c-for-agencies/components/a4a-feedback/hooks/use-show-a4a-feedback', () => ( {
	__esModule: true,
	default: () => ( { isFeedbackShown: true } ),
} ) );

jest.mock( '../../license-details', () => ( {
	__esModule: true,
	default: () => <div>License details panel</div>,
} ) );

jest.mock( '../../license-details/bundle-details', () => ( {
	__esModule: true,
	default: () => <div>Bundle details panel</div>,
} ) );

jest.mock( '../license-bundle-dropdown', () => ( {
	__esModule: true,
	default: () => <div>Bundle dropdown</div>,
} ) );

const baseLicense: License = {
	licenseId: 101,
	licenseKey: 'jetpack-backup-t1_abc',
	productId: 1,
	product: 'jetpack-backup-t1',
	userId: 1,
	username: 'agency',
	blogId: null,
	siteUrl: null,
	hasDownloads: false,
	issuedAt: '2026-10-01 00:00:00',
	attachedAt: null,
	revokedAt: null,
	ownerType: 'jetpack_partner_key',
	quantity: null,
	parentLicenseId: null,
	meta: {},
	referral: null,
	subscription: null,
};

const titanLicense: License = {
	...baseLicense,
	licenseId: 202,
	licenseKey: 'pressable-addon-titan-inbox-monthly_xyz',
	productId: 2,
	product: 'pressable-addon-titan-inbox-monthly',
	quantity: 2,
	meta: { titanDomain: 'example.com', titanPlan: 'standard' },
	subscription: {
		id: '1',
		productName: 'Pressable Titan Inbox Add-on',
		purchasePrice: 10,
		purchaseCurrency: 'USD',
		billingIntervalUnit: 'month',
		status: 'active',
		expiry: '2026-11-01',
		trialEnd: '2026-12-31',
		isActiveTrial: true,
		isAutoRenewEnabled: true,
		isRefundable: true,
	},
};

const initialState = {
	a8cForAgencies: {
		agencies: {
			activeAgency: { id: 1, user: { role: 'a4a_administrator' } },
			isAgencyClientUser: false,
		},
	},
};

function renderPreview(
	license: License,
	queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } )
) {
	return renderWithProvider(
		<LicensePreview
			license={ license }
			licenseType={ LicenseType.Partner }
			parentLicenseId={ license.licenseId }
			productName={ license.product }
			productId={ license.productId }
			quantity={ license.quantity }
			meta={ license.meta }
		/>,
		{ initialState, reducers: { a8cForAgencies }, queryClient }
	);
}

describe( 'LicensePreview', () => {
	it( 'renders a Titan license as a single license with inbox count, domain, and issued date', async () => {
		const user = userEvent.setup();
		renderPreview( titanLicense );

		expect( screen.getByText( '2 Inboxes' ) ).toBeVisible();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
		expect( screen.getByText( 'Issued on:' ) ).toBeVisible();
		expect( screen.getByText( '2026-10-01' ) ).toBeVisible();
		expect( screen.queryByText( 'Bundle dropdown' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Manage in Pressable' ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button' ) );

		expect( screen.getByText( 'License details panel' ) ).toBeVisible();
		expect( screen.queryByText( 'Bundle details panel' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps rendering a non-Titan quantity as a bundle', async () => {
		const user = userEvent.setup();
		renderPreview( { ...baseLicense, quantity: 3 } );

		expect( screen.getAllByText( '3 License Bundle' )[ 0 ] ).toBeVisible();
		expect( screen.queryByText( 'Issued on:' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Bundle dropdown' ) ).toBeVisible();

		await user.click( screen.getByRole( 'button' ) );

		expect( screen.getByText( 'Bundle details panel' ) ).toBeVisible();
	} );

	it( 'shows the trial notice for a Titan license', () => {
		renderPreview( titanLicense );

		expect( screen.getByText( /90-day trial ends/ ) ).toBeVisible();
	} );

	it( 'does not show the trial notice for a non-Titan introductory offer', () => {
		renderPreview( { ...baseLicense, subscription: titanLicense.subscription } );

		expect( screen.queryByText( /90-day trial/ ) ).not.toBeInTheDocument();
	} );

	describe( 'Woo license site', () => {
		const wooLicense: License = {
			...baseLicense,
			licenseKey: 'woocommerce-subscriptions_abc',
			product: 'WooCommerce Subscriptions',
			siteUrl: 'https://old-store.example',
			attachedAt: '2026-10-02 00:00:00',
		};

		it( 'shows the store WooCommerce.com has the license on', async () => {
			jest.mocked( fetchWooCommerceLicenseSites ).mockResolvedValue( {
				[ wooLicense.licenseId ]: { site_url: 'https://new-store.example' },
			} );
			renderPreview( wooLicense );

			expect( await screen.findByText( 'new-store.example' ) ).toBeVisible();
			expect( screen.queryByText( 'old-store.example' ) ).not.toBeInTheDocument();
		} );

		it( 'shows no site while the store is looked up', () => {
			jest.mocked( fetchWooCommerceLicenseSites ).mockReturnValue( new Promise( () => {} ) );
			renderPreview( wooLicense );

			expect( screen.queryByText( 'old-store.example' ) ).not.toBeInTheDocument();
		} );

		it( 'falls back to the license’s own site when the lookup fails', async () => {
			jest.mocked( fetchWooCommerceLicenseSites ).mockRejectedValue( new Error( 'Unavailable' ) );
			renderPreview( wooLicense );

			expect( await screen.findByText( 'old-store.example' ) ).toBeVisible();
		} );
	} );
} );
