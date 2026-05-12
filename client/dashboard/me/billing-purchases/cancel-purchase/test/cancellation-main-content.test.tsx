/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import CancellationMainContent from '../cancellation-main-content';
import type { Purchase, Domain, AtomicTransfer, Site } from '@automattic/api-core';

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn( () => '' );
	return Object.assign( fn, {
		__esModule: true,
		default: fn,
		isEnabled: jest.fn( () => false ),
	} );
} );

const mockedIsEnabled = config.isEnabled as jest.MockedFunction< typeof config.isEnabled >;

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 123,
		product_name: 'WordPress.com Business',
		product_slug: 'business-bundle',
		is_plan: true,
		is_domain_registration: false,
		is_jetpack_plan_or_product: false,
		is_wpcom_atomic: false,
		expiry_status: 'auto-renewing',
		expiry_date: '2027-04-16T00:00:00+00:00',
		meta: '',
		domain: 'example.com',
		product_type: '',
		blog_id: 1,
		...overrides,
	} as Purchase;
}

function makeSite( overrides: Partial< Site > = {} ): Site {
	return {
		ID: 1,
		slug: 'example.com',
		name: 'Test Site',
		URL: 'https://example.com',
		is_wpcom_atomic: false,
		options: {
			admin_url: 'https://example.com/wp-admin/',
			software_version: '6.5',
			unmapped_url: 'https://example.wordpress.com',
			wordads: false,
		},
		...overrides,
	} as Site;
}

const noop = () => {};
const defaultProps = {
	displayVariant: 'cancel' as const,
	state: {
		cancelBundledDomain: false,
		confirmCancelBundledDomain: false,
		surveyShown: false,
		customerConfirmedUnderstanding: false,
		atomicRevertConfirmed: false,
		isLoading: false,
		domainConfirmationConfirmed: false,
		showDomainOptionsStep: false,
		questionOneOrder: [],
	},
	onCancelConfirmationStateChange: noop,
	onDomainConfirmationChange: noop,
	onCustomerConfirmedUnderstandingChange: noop,
	onCustomerConfirmedUnderstandingAtomicPlanRevert: noop,
	onKeepSubscriptionClick: noop,
};

describe( '<CancellationMainContent />', () => {
	beforeEach( () => {
		mockedIsEnabled.mockImplementation( () => false );
	} );

	test( 'non-primary domain bullets appear when site has custom primary domain and flag is on', () => {
		mockedIsEnabled.mockImplementation( ( flag ) => flag === 'purchases/split-cancel-remove' );

		render(
			<CancellationMainContent
				{ ...defaultProps }
				purchase={ makePurchase( { is_plan: true } ) }
				site={ makeSite( {
					URL: 'https://mycustomdomain.com',
					options: {
						admin_url: 'https://mycustomdomain.com/wp-admin/',
						software_version: '6.5',
						unmapped_url: 'https://example.wordpress.com',
					},
				} ) }
				wpcomDomain="example.wordpress.com"
			/>
		);

		expect(
			screen.getByText( /mycustomdomain\.com will start forwarding to example\.wordpress\.com/ )
		).toBeVisible();
		expect(
			screen.getByText(
				/example\.wordpress\.com will become the address people see when they visit your site/
			)
		).toBeVisible();
	} );

	test( 'non-primary domain bullets prefer wpcomDomain prop over site.options.unmapped_url (.home.blog fix)', () => {
		mockedIsEnabled.mockImplementation( ( flag ) => flag === 'purchases/split-cancel-remove' );

		// Server-side unmapped_url returns .wordpress.com even when the site's free
		// domain is .home.blog. The wpcomDomain prop, sourced from the loaded
		// domain list, is the source of truth.
		render(
			<CancellationMainContent
				{ ...defaultProps }
				purchase={ makePurchase( { is_plan: true } ) }
				site={ makeSite( {
					URL: 'https://mycustomdomain.com',
					options: {
						admin_url: 'https://mycustomdomain.com/wp-admin/',
						software_version: '6.5',
						unmapped_url: 'https://example.wordpress.com',
					},
				} ) }
				wpcomDomain="example.home.blog"
			/>
		);

		expect(
			screen.getByText( /mycustomdomain\.com will start forwarding to example\.home\.blog/ )
		).toBeVisible();
		expect(
			screen.queryByText( /example\.wordpress\.com will become the address/ )
		).not.toBeInTheDocument();
	} );

	test( 'WordAds bullet appears when site has wordads enabled and flag is on', () => {
		mockedIsEnabled.mockImplementation( ( flag ) => flag === 'purchases/split-cancel-remove' );

		render(
			<CancellationMainContent
				{ ...defaultProps }
				purchase={ makePurchase( { is_plan: true } ) }
				site={ makeSite( {
					options: {
						admin_url: 'https://example.com/wp-admin/',
						software_version: '6.5',
						unmapped_url: 'https://example.wordpress.com',
						wordads: true,
					},
				} ) }
			/>
		);

		expect(
			screen.getByText( 'You will become ineligible for the WordAds program.' )
		).toBeVisible();
	} );

	test( 'marketplace bullets appear when activeMarketplaceSubscriptions is non-empty', () => {
		mockedIsEnabled.mockImplementation( ( flag ) => flag === 'purchases/split-cancel-remove' );

		const marketplaceSub = makePurchase( {
			ID: 456,
			product_name: 'Yoast SEO Premium',
			product_slug: 'yoast-seo-premium',
			is_plan: false,
		} );

		render(
			<CancellationMainContent
				{ ...defaultProps }
				purchase={ makePurchase( { is_plan: true } ) }
				activeMarketplaceSubscriptions={ [ marketplaceSub ] }
			/>
		);

		expect( screen.getByText( 'Yoast SEO Premium will also be removed.' ) ).toBeVisible();
	} );

	test( 'domain deletion bullets appear when purchase is a domain registration', () => {
		mockedIsEnabled.mockImplementation( ( flag ) => flag === 'purchases/split-cancel-remove' );

		render(
			<CancellationMainContent
				{ ...defaultProps }
				purchase={ makePurchase( {
					is_plan: false,
					is_domain_registration: true,
					meta: 'mydomain.com',
				} ) }
			/>
		);

		expect(
			screen.getByText( /All services connected to mydomain\.com will become unreachable/ )
		).toBeVisible();
		expect(
			screen.getByText( /mydomain\.com will become available for someone else to register/ )
		).toBeVisible();
	} );

	test( 'Gravatar bullet appears when selectedDomain is a Gravatar domain', () => {
		mockedIsEnabled.mockImplementation( ( flag ) => flag === 'purchases/split-cancel-remove' );

		render(
			<CancellationMainContent
				{ ...defaultProps }
				purchase={ makePurchase( {
					is_plan: false,
					is_domain_registration: true,
					meta: 'mygravatar.com',
				} ) }
				selectedDomain={ { is_gravatar_restricted_domain: true } as Domain }
			/>
		);

		expect(
			screen.getByText( /This domain is provided at no cost for your Gravatar profile/ )
		).toBeVisible();
	} );

	test( 'no extra bullets appear when flag is off even with all conditions true', () => {
		mockedIsEnabled.mockImplementation( () => false );

		const marketplaceSub = makePurchase( {
			ID: 456,
			product_name: 'Yoast SEO Premium',
			product_slug: 'yoast-seo-premium',
			is_plan: false,
		} );

		render(
			<CancellationMainContent
				{ ...defaultProps }
				purchase={ makePurchase( { is_plan: true } ) }
				site={ makeSite( {
					URL: 'https://mycustomdomain.com',
					options: {
						admin_url: 'https://mycustomdomain.com/wp-admin/',
						software_version: '6.5',
						unmapped_url: 'https://example.wordpress.com',
						wordads: true,
					},
				} ) }
				activeMarketplaceSubscriptions={ [ marketplaceSub ] }
			/>
		);

		expect( screen.queryByText( /will start forwarding/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /ineligible for the WordAds program/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /will also be removed/ ) ).not.toBeInTheDocument();
	} );

	test( 'Atomic items still render regardless of flag', () => {
		mockedIsEnabled.mockImplementation( () => false );

		render(
			<CancellationMainContent
				{ ...defaultProps }
				purchase={ makePurchase( { is_plan: true, domain: 'example.wordpress.com' } ) }
				atomicTransfer={ { created_at: '2024-01-01' } as AtomicTransfer }
			/>
		);

		expect( screen.getByText( 'Set your site to private.' ) ).toBeVisible();
		expect(
			screen.getByText( /Remove your installed themes, plugins, and their data/ )
		).toBeVisible();
	} );
} );
