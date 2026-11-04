/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import DifmOfferModal from '../index';
import type { Site } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const BUILD_REQUEST_PATH = '/wpcom/v2/sites/123/difm-offer/build-request';

const mockAddProductsToCart = jest.fn();

jest.mock( '../../../app/shopping-cart', () => ( {
	shoppingCartManagerClient: {
		forCartKey: ( cartKey: number ) => ( {
			actions: {
				addProductsToCart: ( ...args: unknown[] ) => mockAddProductsToCart( cartKey, ...args ),
			},
		} ),
	},
} ) );

const site = { ID: 123, slug: 'example.wordpress.com' } as Site;

const expectedTracksProps = {
	source: 'site-overview',
	variation: 'no_time_to_build',
	upsell_id: 'difm-offer-modal',
	upsell_feature_id: 'difm-offer',
};

const originalLocation = window.location;

function renderModal( onClose = jest.fn() ) {
	return render(
		<DifmOfferModal
			site={ site }
			userEmail="test@example.com"
			variation="no_time_to_build"
			source="site-overview"
			onClose={ onClose }
		/>
	);
}

async function goToRequestStep( user: ReturnType< typeof userEvent.setup > ) {
	await user.click( await screen.findByRole( 'button', { name: 'Tell us about your site' } ) );
	return screen.getByRole( 'textbox', { name: /Site details/ } );
}

function mockDifmProduct( product: { cost_smallest_unit: number; currency_code: string } ) {
	nock( API )
		.get( '/rest/v1.1/products/' )
		.query( true )
		.reply( 200, {
			wp_difm_lite: {
				product_slug: 'wp_difm_lite',
				cost: product.cost_smallest_unit / 100,
				price_tier_list: [],
				...product,
			},
		} );
}

async function expectModalNotToClose(
	user: ReturnType< typeof userEvent.setup >,
	description: HTMLElement,
	onClose: jest.Mock
) {
	expect( screen.queryByRole( 'button', { name: 'Close' } ) ).not.toBeInTheDocument();
	// Escape from the busy submit button does not reach the modal, so focus a field first.
	await user.click( description );
	await user.keyboard( '{Escape}' );
	// The modal calls onRequestClose only after its exit animation, which runs for about 240ms.
	await act( () => new Promise( ( resolve ) => setTimeout( resolve, 500 ) ) );
	expect( onClose ).not.toHaveBeenCalled();
}

beforeEach( () => {
	mockAddProductsToCart.mockReset();
	mockAddProductsToCart.mockResolvedValue( undefined );
	Object.defineProperty( window, 'location', {
		value: {
			href: 'https://wordpress.com/sites/example.wordpress.com',
			origin: 'https://wordpress.com',
			hostname: 'wordpress.com',
			search: '',
		},
		writable: true,
	} );
} );

afterEach( () => {
	Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
} );

describe( '<DifmOfferModal>', () => {
	test( 'shows the offer and records an impression', async () => {
		mockDifmProduct( { cost_smallest_unit: 49900, currency_code: 'USD' } );
		const { recordTracksEvent } = renderModal();

		expect(
			await screen.findByRole( 'heading', { name: 'We’ll build your site for free' } )
		).toBeVisible();
		expect( await screen.findByText( 'Save $499 · Limited-time offer' ) ).toBeVisible();
		expect( screen.getByText( /money-back guarantee/ ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /How it works/ } ) ).toHaveAttribute(
			'href',
			'https://difmrequest.com/faq/'
		);
		expect( screen.getByRole( 'link', { name: /How it works/ } ) ).toHaveAttribute(
			'target',
			'_blank'
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_upsell_impression',
			expectedTracksProps
		);
	} );

	test( 'shows the saving in the currency the user pays in', async () => {
		mockDifmProduct( { cost_smallest_unit: 39900, currency_code: 'GBP' } );
		renderModal();

		expect( await screen.findByText( 'Save £399 · Limited-time offer' ) ).toBeVisible();
	} );

	test( 'leaves the amount out of the badge until the price loads', async () => {
		renderModal();

		expect( await screen.findByText( 'Limited-time offer' ) ).toBeVisible();
	} );

	test( 'records a click on the How it works link as its own event', async () => {
		const user = userEvent.setup();
		const { recordTracksEvent } = renderModal();

		await user.click( await screen.findByRole( 'link', { name: /How it works/ } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_difm_offer_how_it_works_click',
			expectedTracksProps
		);
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_dashboard_upsell_click',
			expect.anything()
		);
	} );

	test( 'records a click on continue and shows the request form', async () => {
		const user = userEvent.setup();
		const { recordTracksEvent } = renderModal();

		await goToRequestStep( user );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_upsell_click', {
			...expectedTracksProps,
			step: 'offer',
		} );
		expect( screen.getByRole( 'heading', { name: 'Tell us about your site' } ) ).toBeVisible();
		expect( screen.getByText( 'example.wordpress.com', { exact: false } ) ).toBeVisible();
		expect( screen.getByText( 'test@example.com', { exact: false } ) ).toBeVisible();
		expect( screen.queryByRole( 'textbox', { name: /Name/ } ) ).not.toBeInTheDocument();
	} );

	test( 'shows the customer reviews on the request step only', async () => {
		const user = userEvent.setup();
		renderModal();

		await screen.findByRole( 'button', { name: 'Tell us about your site' } );
		expect( screen.queryByRole( 'region', { name: 'Customer reviews' } ) ).not.toBeInTheDocument();

		await goToRequestStep( user );

		expect( screen.getByRole( 'region', { name: 'Customer reviews' } ) ).toBeVisible();
	} );

	test( 'keeps the submit button disabled until the description has non-blank text', async () => {
		const user = userEvent.setup();
		renderModal();

		const description = await goToRequestStep( user );
		const submit = screen.getByRole( 'button', { name: 'Submit request' } );

		expect( submit ).toBeDisabled();
		await user.type( description, '   ' );
		expect( submit ).toBeDisabled();
		await user.type( description, 'A bakery site' );
		expect( submit ).toBeEnabled();
	} );

	test( 'sends the build request, adds the annual Business plan to the cart and redirects to checkout', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		const request = nock( API )
			.post( BUILD_REQUEST_PATH, {
				description: 'A bakery site with an online menu.',
				source: 'site-overview',
				variation: 'no_time_to_build',
			} )
			.reply( 200, { success: true } );
		const { recordTracksEvent } = renderModal( onClose );

		const description = await goToRequestStep( user );
		await user.type( description, ' A bakery site with an online menu. ' );
		await user.click( screen.getByRole( 'button', { name: 'Submit request' } ) );

		await waitFor( () =>
			expect( window.location.href ).toContain( '/checkout/example.wordpress.com' )
		);
		const checkoutUrl = new URL( window.location.href );
		expect( checkoutUrl.searchParams.get( 'cancel_to' ) ).toContain(
			'/sites/example.wordpress.com'
		);
		const redirectTo = new URL( checkoutUrl.searchParams.get( 'redirect_to' ) ?? '' );
		expect( redirectTo.pathname ).toBe( '/sites/example.wordpress.com' );
		expect( redirectTo.searchParams.get( 'difmOffer' ) ).toBe( 'purchased' );
		expect( checkoutUrl.searchParams.get( 'dashboard' ) ).toBe( 'dotcom' );
		expect( request.isDone() ).toBe( true );
		expect( mockAddProductsToCart ).toHaveBeenCalledWith( 123, [
			{ product_slug: 'business-bundle', extra: { difm_offer: true } },
		] );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_upsell_click', {
			...expectedTracksProps,
			step: 'request',
		} );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_dashboard_upsell_dismiss',
			expect.anything()
		);
	} );

	test.each( [
		[
			400,
			'rest_invalid_param',
			'Some of the details you entered are not valid. Check them and try again.',
		],
		[
			400,
			'difm_offer_invalid_email',
			'The email address on your account is not valid. Update it in your account settings and try again.',
		],
		[ 403, 'rest_forbidden', 'Only an administrator of this site can request a site build.' ],
		[ 403, 'difm_offer_ineligible', 'This site is not eligible for this offer.' ],
		[
			429,
			'rate_limit_exceeded',
			'You have sent too many requests. Wait a few minutes and try again.',
		],
		[ 500, 'difm_offer_email_failed', 'We could not send your request. Try again.' ],
		[ 500, 'unknown_error', 'Something went wrong. Try again.' ],
	] )( 'shows a %d %s error inline and keeps the modal open', async ( status, code, message ) => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		nock( API )
			.post( BUILD_REQUEST_PATH )
			.reply( status, { code, message: 'Server message', data: { status } } );
		renderModal( onClose );

		const description = await goToRequestStep( user );
		await user.type( description, 'A bakery site' );
		await user.click( screen.getByRole( 'button', { name: 'Submit request' } ) );

		expect( await screen.findByText( message ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Submit request' } ) ).toBeEnabled();
		expect( onClose ).not.toHaveBeenCalled();
		expect( mockAddProductsToCart ).not.toHaveBeenCalled();
	} );

	test( 'shows a cart error inline and retries only the cart', async () => {
		const user = userEvent.setup();
		const request = nock( API ).post( BUILD_REQUEST_PATH ).once().reply( 200, { success: true } );
		mockAddProductsToCart.mockRejectedValueOnce( new Error( 'The cart is unavailable.' ) );
		renderModal();

		const description = await goToRequestStep( user );
		await user.type( description, 'A bakery site' );
		await user.click( screen.getByRole( 'button', { name: 'Submit request' } ) );

		expect(
			await screen.findByText(
				'Your request was sent, but we could not add the plan to your cart. The cart is unavailable.'
			)
		).toBeVisible();
		expect( request.isDone() ).toBe( true );
		expect( description ).toHaveAttribute( 'readonly' );

		await user.click( screen.getByRole( 'button', { name: 'Submit request' } ) );

		await waitFor( () =>
			expect( window.location.href ).toContain( '/checkout/example.wordpress.com' )
		);
		expect( mockAddProductsToCart ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'does not record a dismiss when the modal closes after the build request succeeds', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		nock( API ).post( BUILD_REQUEST_PATH ).reply( 200, { success: true } );
		mockAddProductsToCart.mockRejectedValueOnce( new Error( 'The cart is unavailable.' ) );
		const { recordTracksEvent } = renderModal( onClose );

		const description = await goToRequestStep( user );
		await user.type( description, 'A bakery site' );
		await user.click( screen.getByRole( 'button', { name: 'Submit request' } ) );
		await screen.findByText( /we could not add the plan to your cart/ );
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

		expect( onClose ).toHaveBeenCalled();
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_dashboard_upsell_dismiss',
			expect.anything()
		);
	} );

	test( 'does not close while the plan is added to the cart', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		nock( API ).post( BUILD_REQUEST_PATH ).reply( 200, { success: true } );
		mockAddProductsToCart.mockReturnValueOnce( new Promise( () => {} ) );
		renderModal( onClose );

		const description = await goToRequestStep( user );
		await user.type( description, 'A bakery site' );
		await user.click( screen.getByRole( 'button', { name: 'Submit request' } ) );

		await waitFor( () => expect( mockAddProductsToCart ).toHaveBeenCalled() );
		await expectModalNotToClose( user, description, onClose );
	} );

	test( 'does not close while the build request is pending', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		nock( API )
			.post( BUILD_REQUEST_PATH )
			.reply( () => new Promise( () => {} ) );
		renderModal( onClose );

		const description = await goToRequestStep( user );
		await user.type( description, 'A bakery site' );
		await user.click( screen.getByRole( 'button', { name: 'Submit request' } ) );

		await expectModalNotToClose( user, description, onClose );
		expect( mockAddProductsToCart ).not.toHaveBeenCalled();
	} );

	test( 'records a dismiss with the offer step when the modal closes on the offer step', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		const { recordTracksEvent } = renderModal( onClose );

		await screen.findByRole( 'button', { name: 'Tell us about your site' } );
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

		expect( onClose ).toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_upsell_dismiss', {
			...expectedTracksProps,
			step: 'offer',
		} );
	} );

	test( 'records a dismiss with the request step when the modal closes without a submit', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		const { recordTracksEvent } = renderModal( onClose );

		await goToRequestStep( user );
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

		expect( onClose ).toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_upsell_dismiss', {
			...expectedTracksProps,
			step: 'request',
		} );
	} );
} );
