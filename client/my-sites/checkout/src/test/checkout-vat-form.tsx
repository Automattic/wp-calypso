/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { convertResponseCartToRequestCart } from '@automattic/shopping-cart';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch } from '@wordpress/data';
import nock from 'nock';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import {
	planWithoutDomain,
	mockSetCartEndpointWith,
	getActivePersonalPlanDataForType,
	mockCachedContactDetailsEndpoint,
	mockContactDetailsValidationEndpoint,
	getBasicCart,
	mockMatchMediaOnWindow,
	mockGetVatInfoEndpoint,
	mockSetVatInfoEndpoint,
	countryList,
	mockGetPaymentMethodsEndpoint,
	mockLogStashEndpoint,
	mockGetSupportedCountriesEndpoint,
	mockUserSignupValidationEndpoint,
	mockSetCachedContactDetailsEndpoint,
} from './util';
import { MockCheckout } from './util/mock-checkout';
import type { CartKey } from '@automattic/shopping-cart';

jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/sites/domains/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/sites/plans/selectors/get-plans-by-site' );
jest.mock( 'calypso/my-sites/checkout/use-cart-key' );
jest.mock( 'calypso/lib/analytics/utils/refresh-country-code-cookie-gdpr' );
jest.mock( 'calypso/state/products-list/selectors/is-marketplace-product' );
jest.mock( 'calypso/lib/navigate' );

// These tests seem to be particularly slow (it might be because of using
// it.each; it's not clear but the timeout might apply to the whole loop
// rather that each iteration?), so we need to increase the timeout for their
// operation. The standard timeout (at the time of writing) is 5 seconds so
// we are increasing this to 12 seconds.
jest.setTimeout( 12000 );

describe( 'Checkout contact step VAT form', () => {
	const mainCartKey: CartKey = 'foo.com' as CartKey;
	const initialCart = getBasicCart();
	const defaultPropsForMockCheckout = {
		initialCart,
	};

	getPlansBySiteId.mockImplementation( () => ( {
		data: getActivePersonalPlanDataForType( 'yearly' ),
	} ) );
	hasLoadedSiteDomains.mockImplementation( () => true );
	getDomainsBySiteId.mockImplementation( () => [] );
	isMarketplaceProduct.mockImplementation( () => false );
	isJetpackSite.mockImplementation( () => false );
	mockMatchMediaOnWindow();

	const mockSetCartEndpoint = mockSetCartEndpointWith( {
		currency: initialCart.currency,
		locale: initialCart.locale,
	} );

	beforeEach( () => {
		dispatch( CHECKOUT_STORE ).reset();
		( useCartKey as jest.Mock ).mockImplementation( () => mainCartKey );
		nock.cleanAll();
		mockGetPaymentMethodsEndpoint( [] );
		mockLogStashEndpoint();
		mockGetSupportedCountriesEndpoint( countryList );
		mockMatchMediaOnWindow();
		mockGetVatInfoEndpoint( {} );
		mockSetCachedContactDetailsEndpoint();
		mockCachedContactDetailsEndpoint( {} );
		mockGetVatInfoEndpoint( {} );
	} );

	it( 'does not render the VAT field checkbox if the selected country does not support VAT', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'US' );
		expect( screen.queryByLabelText( 'Add VAT details' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the VAT field checkbox if the selected country does support VAT', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeInTheDocument();
	} );

	it( 'does not render the VAT fields if the checkbox is not checked', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).not.toBeChecked();
		expect( screen.queryByLabelText( 'VAT ID' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the VAT fields if the checkbox is checked', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeChecked();
		expect( await screen.findByLabelText( 'VAT ID' ) ).toBeInTheDocument();
	} );

	it( 'does not render the Northern Ireland checkbox is if the VAT checkbox is checked and the country is EU', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'ES' );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		expect( screen.queryByLabelText( 'Is VAT for Northern Ireland?' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the Northern Ireland checkbox is if the VAT checkbox is checked and the country is GB', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		expect( await screen.findByLabelText( 'Is VAT for Northern Ireland?' ) ).toBeInTheDocument();
	} );

	it( 'hides the Northern Ireland checkbox is if the VAT checkbox is checked and the country is changed from GB to ES', async () => {
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'GB' );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		expect( await screen.findByLabelText( 'Is VAT for Northern Ireland?' ) ).toBeInTheDocument();
		await user.selectOptions( await screen.findByLabelText( 'Country' ), 'ES' );
		expect( screen.queryByLabelText( 'Is VAT for Northern Ireland?' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the VAT fields and checks the box on load if the VAT endpoint returns data', async () => {
		nock.cleanAll();
		mockGetSupportedCountriesEndpoint( countryList );
		mockGetPaymentMethodsEndpoint( [] );
		mockCachedContactDetailsEndpoint( {
			country_code: 'GB',
			postal_code: '',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: false, messages: [ 'Invalid' ] } );
		mockGetVatInfoEndpoint( {
			id: '12345',
			name: 'Test company',
			address: '123 Main Street',
			country: 'GB',
		} );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );

		// Wait for checkout to load.
		await screen.findByLabelText( 'Continue with the entered contact details' );
		const countryField = await screen.findByLabelText( 'Country' );

		await waitFor( () => {
			expect( countryField.selectedOptions[ 0 ].value ).toBe( 'GB' );
		} );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeChecked();
		expect( await screen.findByLabelText( 'VAT ID' ) ).toBeInTheDocument();
	} );

	it( 'renders the VAT fields pre-filled if the VAT endpoint returns data', async () => {
		nock.cleanAll();
		mockGetSupportedCountriesEndpoint( countryList );
		mockGetPaymentMethodsEndpoint( [] );
		mockCachedContactDetailsEndpoint( {
			country_code: 'GB',
			postal_code: '',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: false, messages: [ 'Invalid' ] } );
		mockGetVatInfoEndpoint( {
			id: '12345',
			name: 'Test company',
			address: '123 Main Street',
			country: 'GB',
		} );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );

		// Wait for checkout to load.
		await screen.findByLabelText( 'Continue with the entered contact details' );
		const countryField = await screen.findByLabelText( 'Country' );

		await waitFor( () => {
			expect( countryField.selectedOptions[ 0 ].value ).toBe( 'GB' );
		} );
		expect( await screen.findByLabelText( 'VAT ID' ) ).toHaveValue( '12345' );
		expect( await screen.findByLabelText( 'Organization for VAT' ) ).toHaveValue( 'Test company' );
		expect( await screen.findByLabelText( 'Address for VAT' ) ).toHaveValue( '123 Main Street' );
	} );

	it( 'renders the Northern Ireland checkbox pre-filled if the VAT endpoint returns XI', async () => {
		nock.cleanAll();
		mockGetSupportedCountriesEndpoint( countryList );
		mockGetPaymentMethodsEndpoint( [] );
		mockCachedContactDetailsEndpoint( {
			country_code: 'GB',
			postal_code: '',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: false, messages: [ 'Invalid' ] } );
		mockGetVatInfoEndpoint( {
			id: '12345',
			name: 'Test company',
			address: '123 Main Street',
			country: 'XI',
		} );
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );

		// Wait for checkout to load.
		await screen.findByLabelText( 'Continue with the entered contact details' );
		const countryField = await screen.findByLabelText( 'Country' );

		await waitFor( () => {
			expect( countryField.selectedOptions[ 0 ].value ).toBe( 'GB' );
		} );
		expect( await screen.findByLabelText( 'Is VAT for Northern Ireland?' ) ).toBeChecked();
	} );

	it( 'does not allow unchecking the VAT details checkbox if the VAT fields are pre-filled', async () => {
		nock.cleanAll();
		mockGetSupportedCountriesEndpoint( countryList );
		mockGetPaymentMethodsEndpoint( [] );
		mockCachedContactDetailsEndpoint( {
			country_code: 'GB',
			postal_code: '',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: false, messages: [ 'Invalid' ] } );
		mockGetVatInfoEndpoint( {
			id: '12345',
			name: 'Test company',
			address: '123 Main Street',
			country: 'GB',
		} );
		const cartChanges = { products: [ planWithoutDomain ] };
		const user = userEvent.setup();
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );

		// Wait for checkout to load.
		await screen.findByLabelText( 'Continue with the entered contact details' );
		const countryField = await screen.findByLabelText( 'Country' );

		await waitFor( () => {
			expect( countryField.selectedOptions[ 0 ].value ).toBe( 'GB' );
		} );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeChecked();
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeDisabled();

		// Try to click it anyway and make sure it does not change.
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeChecked();
		expect( await screen.findByLabelText( 'VAT ID' ) ).toBeInTheDocument();
	} );

	it( 'sends data to the VAT endpoint when completing the step if the box is checked', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		const mockVatEndpoint = mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );

		// Wait for the cart to load
		await screen.findByLabelText( 'Continue with the entered contact details' );

		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		await user.type( await screen.findByLabelText( 'VAT ID' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );
		await user.click( screen.getByText( 'Continue to payment' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint ).toHaveBeenCalledWith( {
			id: vatId,
			name: vatName,
			country: countryCode,
			address: vatAddress,
		} );
	} );

	it( 'continues to the next step if valid VAT info is entered and we are logged-in', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		mockSetVatInfoEndpoint();
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );

		// Wait for the cart to load
		await screen.findByLabelText( 'Continue with the entered contact details' );

		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		await user.type( await screen.findByLabelText( 'VAT ID' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );
		await user.click( screen.getByText( 'Continue to payment' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
	} );

	it( 'continues to the next step if valid VAT info is entered and we are logged-out', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		mockUserSignupValidationEndpoint( () => {
			return [
				200,
				{
					success: true,
				},
			];
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		mockSetVatInfoEndpoint();
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render(
			<MockCheckout
				{ ...defaultPropsForMockCheckout }
				cartChanges={ cartChanges }
				additionalProps={ { isLoggedOutCart: true } }
			/>,
			{
				legacyRoot: true,
			}
		);

		// Wait for the cart to load
		await screen.findByLabelText( 'Continue with the entered contact details' );

		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		await user.type( await screen.findByLabelText( 'VAT ID' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );
		await user.click( screen.getByText( 'Continue to payment' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
	} );

	it( 'sends ID to the VAT endpoint without prefixed country code when completing the step', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		const mockVatEndpoint = mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );

		// Wait for the cart to load
		await screen.findByLabelText( 'Continue with the entered contact details' );

		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		await user.type( await screen.findByLabelText( 'VAT ID' ), countryCode + vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );
		await user.click( screen.getByText( 'Continue to payment' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint ).toHaveBeenCalledWith( {
			id: vatId,
			name: vatName,
			country: countryCode,
			address: vatAddress,
		} );
	} );

	it( 'sends ID to the VAT endpoint without prefixed Swiss country code and hyphen when completing the step', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'CH';
		const mockVatEndpoint = mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );

		// Wait for the cart to load
		await screen.findByLabelText( 'Continue with the entered contact details' );

		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add GST details' ) );
		await user.type( await screen.findByLabelText( 'GST ID' ), 'CHE-' + vatId );
		await user.type( await screen.findByLabelText( 'Organization for GST' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for GST' ), vatAddress );
		await user.click( screen.getByText( 'Continue to payment' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint ).toHaveBeenCalledWith( {
			id: vatId,
			name: vatName,
			country: countryCode,
			address: vatAddress,
		} );
	} );

	it( 'sends ID to the VAT endpoint without prefixed Swiss country code when completing the step', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'CH';
		const mockVatEndpoint = mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );

		// Wait for the cart to load
		await screen.findByLabelText( 'Continue with the entered contact details' );

		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add GST details' ) );
		await user.type( await screen.findByLabelText( 'GST ID' ), 'CHE' + vatId );
		await user.type( await screen.findByLabelText( 'Organization for GST' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for GST' ), vatAddress );
		await user.click( screen.getByText( 'Continue to payment' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint ).toHaveBeenCalledWith( {
			id: vatId,
			name: vatName,
			country: countryCode,
			address: vatAddress,
		} );
	} );

	it( 'sends ID to the VAT endpoint without prefixed lowercase Swiss country code when completing the step', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'CH';
		const mockVatEndpoint = mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );

		// Wait for the cart to load
		await screen.findByLabelText( 'Continue with the entered contact details' );

		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add GST details' ) );
		await user.type( await screen.findByLabelText( 'GST ID' ), 'che' + vatId );
		await user.type( await screen.findByLabelText( 'Organization for GST' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for GST' ), vatAddress );
		await user.click( screen.getByText( 'Continue to payment' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint ).toHaveBeenCalledWith( {
			id: vatId,
			name: vatName,
			country: countryCode,
			address: vatAddress,
		} );
	} );

	it( 'when there is a cached contact country that differs from the cached VAT country, the contact country is sent to the VAT endpoint', async () => {
		nock.cleanAll();
		mockGetSupportedCountriesEndpoint( countryList );
		mockGetPaymentMethodsEndpoint( [] );
		const cachedContactCountry = 'ES';
		mockCachedContactDetailsEndpoint( {
			country_code: cachedContactCountry,
			postal_code: '',
		} );
		mockContactDetailsValidationEndpoint( 'tax', { success: false, messages: [ 'Invalid' ] } );
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		mockGetVatInfoEndpoint( {
			id: vatId,
			name: vatName,
			address: vatAddress,
			country: countryCode,
		} );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );

		// Wait for the cart to load
		await screen.findByLabelText( 'Continue with the entered contact details' );
		const countryField = await screen.findByLabelText( 'Country' );

		// Make sure the form has the autocompleted data.
		await waitFor( () => {
			expect( countryField.selectedOptions[ 0 ].value ).toBe( cachedContactCountry );
		} );
		expect( await screen.findByLabelText( 'Add VAT details' ) ).toBeChecked();
		expect( await screen.findByLabelText( 'VAT ID' ) ).toHaveValue( vatId );
		expect( await screen.findByLabelText( 'Organization for VAT' ) ).toHaveValue( vatName );
		expect( await screen.findByLabelText( 'Address for VAT' ) ).toHaveValue( vatAddress );

		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		mockSetCachedContactDetailsEndpoint();
		const mockVatEndpoint = mockSetVatInfoEndpoint();

		// Submit the form.
		await user.click( screen.getByText( 'Continue to payment' ) );

		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint ).toHaveBeenCalledWith( {
			id: vatId,
			name: vatName,
			address: vatAddress,
			country: cachedContactCountry,
		} );
	} );

	it( 'sends data to the VAT endpoint with Northern Ireland country code when completing the step if the XI box is checked', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		const mockVatEndpoint = mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		await user.click( await screen.findByLabelText( 'Is VAT for Northern Ireland?' ) );
		await user.type( await screen.findByLabelText( 'VAT ID' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );
		await user.click( screen.getByText( 'Continue to payment' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint ).toHaveBeenCalledWith( {
			id: vatId,
			name: vatName,
			address: vatAddress,
			country: 'XI',
		} );
	} );

	it( 'does not send data to the VAT endpoint when completing the step if the box is not checked', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		const mockVatEndpoint = mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		// Check the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		// Fill in the details
		await user.type( await screen.findByLabelText( 'VAT ID' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );

		// Uncheck the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		await user.click( screen.getByText( 'Continue to payment' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( mockVatEndpoint ).not.toHaveBeenCalled();
	} );

	it( 'sends VAT data to the shopping-cart endpoint when completing the step if the box is checked', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		const postalCode = 'NW1 4NP';
		mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };

		const setCart = jest.fn().mockImplementation( mockSetCartEndpoint );

		render(
			<MockCheckout
				{ ...defaultPropsForMockCheckout }
				cartChanges={ cartChanges }
				setCart={ setCart }
			/>
		);
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.type( await screen.findByLabelText( 'Postal code' ), postalCode );
		// Check the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		// Fill in the details
		await user.type( await screen.findByLabelText( 'VAT ID' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );

		await user.click( screen.getByText( 'Continue to payment' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( setCart ).toHaveBeenCalledWith(
			mainCartKey,
			convertResponseCartToRequestCart( {
				...initialCart,
				...cartChanges,
				tax: {
					display_taxes: true,
					location: {
						country_code: countryCode,
						postal_code: postalCode,
						subdivision_code: undefined,
						vat_id: vatId,
						organization: vatName,
						address: vatAddress,
					},
				},
			} )
		);
	} );

	it( 'does not send VAT data to the shopping-cart endpoint when completing the step if the box is not checked', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		const postalCode = 'NW1 4NP';
		mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };

		const setCart = jest.fn().mockImplementation( mockSetCartEndpoint );

		render(
			<MockCheckout
				{ ...defaultPropsForMockCheckout }
				cartChanges={ cartChanges }
				setCart={ setCart }
			/>
		);
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.type( await screen.findByLabelText( 'Postal code' ), postalCode );
		// Check the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		// Fill in the details
		await user.type( await screen.findByLabelText( 'VAT ID' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );

		// Uncheck the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		await user.click( screen.getByText( 'Continue to payment' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( setCart ).toHaveBeenCalledWith(
			mainCartKey,
			convertResponseCartToRequestCart( {
				...initialCart,
				...cartChanges,
				tax: {
					display_taxes: true,
					location: { country_code: countryCode, postal_code: postalCode },
				},
			} )
		);
	} );

	it( 'does not send VAT data to the shopping-cart endpoint when completing the step if the box is checked but the country no longer supports VAT', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		const nonVatCountryCode = 'US';
		const postalCode = 'NW1 4NP';
		mockSetVatInfoEndpoint();
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };

		const setCart = jest.fn().mockImplementation( mockSetCartEndpoint );

		render(
			<MockCheckout
				{ ...defaultPropsForMockCheckout }
				cartChanges={ cartChanges }
				setCart={ setCart }
			/>,
			{
				legacyRoot: true,
			}
		);
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.type( await screen.findByLabelText( 'Postal code' ), postalCode );
		// Check the box
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );

		// Fill in the details
		await user.type( await screen.findByLabelText( 'VAT ID' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );

		// Change the country to one that does not support VAT
		await user.selectOptions( await screen.findByLabelText( 'Country' ), nonVatCountryCode );

		await user.click( screen.getByText( 'Continue to payment' ) );
		expect( await screen.findByTestId( 'payment-method-step--visible' ) ).toBeInTheDocument();
		expect( setCart ).toHaveBeenCalledWith(
			mainCartKey,
			convertResponseCartToRequestCart( {
				...initialCart,
				...cartChanges,
				tax: {
					display_taxes: true,
					location: { country_code: nonVatCountryCode, postal_code: postalCode },
				},
			} )
		);
	} );

	it( 'does not complete the step if the VAT endpoint returns an error', async () => {
		const vatId = '12345';
		const vatName = 'Test company';
		const vatAddress = '123 Main Street';
		const countryCode = 'GB';
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/me/vat-info' ).reply( 400 );
		mockContactDetailsValidationEndpoint( 'tax', { success: true } );
		const user = userEvent.setup();
		const cartChanges = { products: [ planWithoutDomain ] };
		render( <MockCheckout { ...defaultPropsForMockCheckout } cartChanges={ cartChanges } />, {
			legacyRoot: true,
		} );
		await user.selectOptions( await screen.findByLabelText( 'Country' ), countryCode );
		await user.click( await screen.findByLabelText( 'Add VAT details' ) );
		await user.type( await screen.findByLabelText( 'VAT ID' ), vatId );
		await user.type( await screen.findByLabelText( 'Organization for VAT' ), vatName );
		await user.type( await screen.findByLabelText( 'Address for VAT' ), vatAddress );
		await user.click( screen.getByText( 'Continue to payment' ) );
		await expect( screen.findByTestId( 'payment-method-step--visible' ) ).toNeverAppear();
	} );
} );
