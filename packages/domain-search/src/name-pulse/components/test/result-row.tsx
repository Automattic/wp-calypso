/**
 * @jest-environment jsdom
 */
import { DomainAvailabilityStatus } from '@automattic/api-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useViewportMatch } from '@wordpress/compose';
import { DomainSearchContext, useDomainSearchContextValue } from '../../../page/context';
import { buildAvailability } from '../../../test-helpers/factories/availability';
import { buildCart } from '../../../test-helpers/factories/cart';
import { withNamePulseQueries } from '../../../test-helpers/factories/name-pulse';
import { queryClient } from '../../../test-helpers/renderer';
import { NamePulseDomainStatus, type NamePulseDomainResult } from '../../helpers';
import { NamePulseResultRow } from '../result-row';
import type { DomainAvailability } from '@automattic/api-core';

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

const mockUseViewportMatch = jest.mocked( useViewportMatch );

beforeEach( () => {
	mockUseViewportMatch.mockReturnValue( false );
} );

const LONG_DOMAIN = 'icecreamshopnearsuratairport.boutique';

const buildResult = ( overrides: Partial< NamePulseDomainResult > ): NamePulseDomainResult => ( {
	domain_name: 'icecream.net',
	suffix: 'net',
	status: NamePulseDomainStatus.AVAILABLE,
	source: 'exact',
	...overrides,
} );

/**
 * A premium exact match as the bulk check reports it: flagged premium, priced
 * at the standard .co rate.
 */
const buildPremiumResult = ( overrides: Partial< NamePulseDomainResult > = {} ) =>
	buildResult( {
		domain_name: 'icecream.co',
		suffix: 'co',
		cost: '$35.00',
		raw_price: 35,
		currency_code: 'USD',
		is_premium: true,
		...overrides,
	} );

const buildPremiumAvailability = ( domainName: string, isSupported: boolean ) =>
	buildAvailability( {
		domain_name: domainName,
		tld: 'co',
		status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
		is_supported_premium_domain: isSupported,
		cost: '$3,500.00',
		raw_price: 3500,
	} );

const notUsed = () => Promise.reject( new Error( 'not used' ) );

const renderRow = (
	result: NamePulseDomainResult,
	domainAvailability: ( domainName: string ) => Promise< DomainAvailability > = notUsed,
	cart = buildCart()
) => {
	const fetcher = jest.fn( domainAvailability );

	const Wrapper = () => {
		const contextValue = useDomainSearchContextValue( {
			cart,
			config: { showNamePulseSearch: true },
		} );

		return (
			<QueryClientProvider client={ queryClient }>
				<DomainSearchContext.Provider
					value={ withNamePulseQueries( contextValue, {
						availability: notUsed,
						suggestions: notUsed,
						tlds: notUsed,
						domainAvailability: fetcher,
					} ) }
				>
					<NamePulseResultRow result={ result } position={ 0 } />
				</DomainSearchContext.Provider>
			</QueryClientProvider>
		);
	};

	return { ...render( <Wrapper /> ), fetcher };
};

describe( 'NamePulseResultRow', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	it( 'falls back to the server-formatted cost, without a sale, when currency_code is missing', () => {
		renderRow( buildResult( { cost: '€22.00', raw_price: 22, sale_cost: 6 } ) );

		expect( screen.getByText( '€22.00' ) ).toBeInTheDocument();
		expect( screen.getByText( '/year' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Sale' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( '/first year' ) ).not.toBeInTheDocument();
	} );

	it( 'announces the waiting skeleton', () => {
		renderRow( buildResult( { status: NamePulseDomainStatus.WAITING } ) );

		expect( screen.getByRole( 'img', { name: 'Checking…' } ) ).toBeInTheDocument();
	} );

	it( 'truncates a long name on desktop', () => {
		const { container } = renderRow(
			buildResult( { domain_name: LONG_DOMAIN, suffix: 'boutique' } )
		);

		expect( container.querySelector( '.name-pulse-row__domain--wrap' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'icecreamshopnearsuratairport' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '.boutique' ) ).toBeInTheDocument();
	} );

	it( 'shows the full long name below desktop', () => {
		mockUseViewportMatch.mockReturnValue( true );

		renderRow( buildResult( { domain_name: LONG_DOMAIN, suffix: 'boutique' } ) );

		expect( screen.getByText( 'icecreamshopnearsuratairport' ) ).toBeInTheDocument();
		expect( screen.getByText( '.boutique' ) ).toBeInTheDocument();
	} );

	it( 'wraps the full long name below the large breakpoint, where the two-column row is too tight to truncate', () => {
		mockUseViewportMatch.mockImplementation(
			( breakpoint, operator ) => breakpoint === 'large' && operator === '<'
		);

		const { container } = renderRow(
			buildResult( { domain_name: LONG_DOMAIN, suffix: 'boutique' } )
		);

		expect( container.querySelector( '.name-pulse-row__domain--wrap' ) ).toBeInTheDocument();
		expect( screen.getByText( 'icecreamshopnearsuratairport' ) ).toBeInTheDocument();
		expect( screen.getByText( '.boutique' ) ).toBeInTheDocument();
	} );

	it( 'replaces the bulk price of a premium exact match with the per-domain one', async () => {
		const { fetcher } = renderRow( buildPremiumResult(), async ( domainName ) =>
			buildPremiumAvailability( domainName, true )
		);

		expect( screen.getByRole( 'img', { name: 'Checking price…' } ) ).toBeInTheDocument();
		expect( screen.queryByText( '$35' ) ).not.toBeInTheDocument();

		expect( await screen.findByText( '$3,500' ) ).toBeInTheDocument();
		expect( screen.getByText( '/year' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Premium' ) ).toBeInTheDocument();
		expect( fetcher ).toHaveBeenCalledWith( 'icecream.co' );
	} );

	it( 'marks a premium exact match its TLD cannot sell as unavailable', async () => {
		renderRow( buildPremiumResult(), async ( domainName ) =>
			buildPremiumAvailability( domainName, false )
		);

		expect( await screen.findByText( 'Unavailable' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Premium' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( '$3,500' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps a premium exact match on its badge alone when the per-domain check fails', async () => {
		renderRow( buildPremiumResult(), () =>
			Promise.reject( new Error( 'Availability check failed' ) )
		);

		await waitFor( () =>
			expect( screen.queryByRole( 'img', { name: 'Checking price…' } ) ).not.toBeInTheDocument()
		);
		expect( screen.getByText( 'Premium' ) ).toBeInTheDocument();
		expect( screen.queryByText( '$35' ) ).not.toBeInTheDocument();
	} );

	it( 'prices a premium suggestion from the suggestions response, without a per-domain check', () => {
		const { fetcher } = renderRow(
			buildPremiumResult( {
				domain_name: 'gelato.io',
				suffix: 'io',
				source: 'keyword',
				cost: '$350.00',
				raw_price: 350,
			} )
		);

		expect( screen.getByText( 'Premium' ) ).toBeInTheDocument();
		expect( screen.getByText( '$350' ) ).toBeInTheDocument();
		expect( fetcher ).not.toHaveBeenCalled();
	} );

	it( 'shows no Sale badge on a sale', () => {
		renderRow( buildResult( { sale_cost: 3.3, currency_code: 'USD' } ) );

		expect( screen.queryByText( 'Sale' ) ).not.toBeInTheDocument();
	} );

	describe( 'policy notices', () => {
		const POLICY_NOTICES = [
			{
				type: 'identity_verification',
				label: 'Special requirements',
				message: '.in domains may require identity verification by the registry.',
			},
		];

		const available = () =>
			Promise.resolve(
				buildAvailability( {
					domain_name: 'icecream.in',
					tld: 'in',
					status: DomainAvailabilityStatus.AVAILABLE,
				} )
			);

		const buildPolicyResult = () =>
			buildResult( { domain_name: 'icecream.in', suffix: 'in', policy_notices: POLICY_NOTICES } );

		it( 'keeps the notice off the row', () => {
			renderRow( buildPolicyResult() );

			expect( screen.queryByText( 'Special requirements' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( POLICY_NOTICES[ 0 ].message ) ).not.toBeInTheDocument();
		} );

		it( 'confirms the notice in a dialog before adding the name', async () => {
			const { fetcher } = renderRow( buildPolicyResult(), available );

			await userEvent.click( screen.getByRole( 'button', { name: 'Add to cart' } ) );

			const dialog = await screen.findByRole( 'dialog', { name: 'Special requirements' } );
			expect( dialog ).toHaveTextContent( POLICY_NOTICES[ 0 ].message );
			await waitFor( () => expect( dialog ).toHaveFocus() );
			expect( fetcher ).not.toHaveBeenCalled();

			await userEvent.click( within( dialog ).getByRole( 'button', { name: 'Add to cart' } ) );

			await waitFor( () => expect( fetcher ).toHaveBeenCalled() );
		} );

		it( 'keeps the dialog open until the name is in the cart', async () => {
			let finishAdding = () => {};
			const cart = buildCart( {
				onAddItem: jest.fn(
					() => new Promise< void >( ( resolve ) => ( finishAdding = resolve ) )
				),
			} );
			renderRow( buildPolicyResult(), available, cart );

			await userEvent.click( screen.getByRole( 'button', { name: 'Add to cart' } ) );
			const dialog = await screen.findByRole( 'dialog', { name: 'Special requirements' } );
			await userEvent.click( within( dialog ).getByRole( 'button', { name: 'Add to cart' } ) );

			await waitFor( () => expect( cart.onAddItem ).toHaveBeenCalled() );
			expect( dialog ).toBeInTheDocument();
			expect( within( dialog ).getByRole( 'button', { name: 'Cancel' } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			);

			finishAdding();

			await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
		} );

		it( 'keeps the name out of the cart when the dialog is canceled', async () => {
			const { fetcher } = renderRow( buildPolicyResult(), available );

			await userEvent.click( screen.getByRole( 'button', { name: 'Add to cart' } ) );
			const dialog = await screen.findByRole( 'dialog', { name: 'Special requirements' } );
			await userEvent.click( within( dialog ).getByRole( 'button', { name: 'Cancel' } ) );

			await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
			expect( fetcher ).not.toHaveBeenCalled();
		} );

		it( 'adds a name without notices straight away', async () => {
			const { fetcher } = renderRow( buildResult( {} ), available );

			await userEvent.click( screen.getByRole( 'button', { name: 'Add to cart' } ) );

			await waitFor( () => expect( fetcher ).toHaveBeenCalled() );
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
	} );
} );
