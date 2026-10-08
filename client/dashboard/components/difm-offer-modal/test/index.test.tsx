/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
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
	variation: 'expert_help',
	upsell_id: 'difm-offer-modal',
	upsell_feature_id: 'difm-offer',
};

const originalLocation = window.location;

function renderModal( onClose = jest.fn() ) {
	return render(
		<DifmOfferModal
			site={ site }
			variation="expert_help"
			source="site-overview"
			onClose={ onClose }
		/>
	);
}

async function goToRequestStep( user: ReturnType< typeof userEvent.setup > ) {
	await user.click( await screen.findByRole( 'button', { name: 'Continue' } ) );
	return screen.getByRole( 'textbox', { name: /Describe the site you want/ } );
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
	nock.cleanAll();
	Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
} );

describe( '<DifmOfferModal>', () => {
	test( 'shows the offer and records an impression', async () => {
		const { recordTracksEvent } = renderModal();

		expect( await screen.findByText( 'Save $499' ) ).toBeVisible();
		expect( screen.getByText( '14-day money-back guarantee.' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Learn more/ } ) ).toHaveAttribute(
			'href',
			'https://difmrequest.com/faq/'
		);
		expect( screen.getByRole( 'link', { name: /Learn more/ } ) ).toHaveAttribute(
			'target',
			'_blank'
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_upsell_impression',
			expectedTracksProps
		);
	} );

	test( 'selects the 1 year term by default and has no monthly term', async () => {
		const user = userEvent.setup();
		renderModal();

		expect( await screen.findByRole( 'radio', { name: '1 year' } ) ).toBeChecked();
		expect( screen.getAllByRole( 'radio' ) ).toHaveLength( 3 );

		await user.click( screen.getByRole( 'radio', { name: '3 years' } ) );

		expect( screen.getByRole( 'radio', { name: '3 years' } ) ).toBeChecked();
		expect( screen.getByRole( 'radio', { name: '1 year' } ) ).not.toBeChecked();
	} );

	test( 'records a click on continue and shows the request form', async () => {
		const user = userEvent.setup();
		const { recordTracksEvent } = renderModal();

		await goToRequestStep( user );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_upsell_click', {
			...expectedTracksProps,
			step: 'offer',
		} );
		expect( screen.getByRole( 'textbox', { name: 'Email' } ) ).toHaveValue( 'test@example.com' );
		expect( screen.getByRole( 'textbox', { name: 'Email' } ) ).toHaveAttribute( 'readonly' );
		expect( screen.getByRole( 'textbox', { name: 'Site address' } ) ).toHaveValue(
			'example.wordpress.com'
		);
		expect( screen.getByRole( 'textbox', { name: 'Site address' } ) ).toHaveAttribute( 'readonly' );
		expect( screen.getByText( "We'll be in touch within one business day." ) ).toBeVisible();
	} );

	test( 'keeps the submit button disabled until the description has non-blank text', async () => {
		const user = userEvent.setup();
		renderModal();

		const description = await goToRequestStep( user );
		const submit = screen.getByRole( 'button', { name: 'Send request' } );

		expect( submit ).toBeDisabled();
		await user.type( description, '   ' );
		expect( submit ).toBeDisabled();
		await user.type( description, 'A bakery site' );
		expect( submit ).toBeEnabled();
	} );

	test( 'sends the build request, adds the chosen term to the cart and redirects to checkout', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		const request = nock( API )
			.post( BUILD_REQUEST_PATH, {
				description: 'A bakery site with an online menu.',
				name: 'Ada',
				source: 'site-overview',
				variation: 'expert_help',
			} )
			.reply( 200, { success: true } );
		const { recordTracksEvent } = renderModal( onClose );

		await user.click( await screen.findByRole( 'radio', { name: '2 years' } ) );
		const description = await goToRequestStep( user );
		await user.type( screen.getByRole( 'textbox', { name: 'Name (optional)' } ), ' Ada ' );
		await user.type( description, ' A bakery site with an online menu. ' );
		await user.click( screen.getByRole( 'button', { name: 'Send request' } ) );

		await waitFor( () =>
			expect( window.location.href ).toContain( '/checkout/example.wordpress.com' )
		);
		expect( request.isDone() ).toBe( true );
		expect( mockAddProductsToCart ).toHaveBeenCalledWith( 123, [
			{ product_slug: 'business-bundle-2y', extra: { difm_offer: true } },
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
		[ 403, 'difm_offer_ineligible', 'This site is not eligible for this offer.' ],
		[
			429,
			'rate_limit_exceeded',
			'You have sent too many requests. Wait a few minutes and try again.',
		],
	] )( 'shows a %d %s error inline and keeps the modal open', async ( status, code, message ) => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		nock( API )
			.post( BUILD_REQUEST_PATH )
			.reply( status, { code, message: 'Server message', data: { status } } );
		renderModal( onClose );

		const description = await goToRequestStep( user );
		await user.type( description, 'A bakery site' );
		await user.click( screen.getByRole( 'button', { name: 'Send request' } ) );

		expect( await screen.findByText( message ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Send request' } ) ).toBeEnabled();
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
		await user.click( screen.getByRole( 'button', { name: 'Send request' } ) );

		expect(
			await screen.findByText(
				'Your request was sent, but we could not add the plan to your cart. The cart is unavailable.'
			)
		).toBeVisible();
		expect( request.isDone() ).toBe( true );
		expect( description ).toHaveAttribute( 'readonly' );

		await user.click( screen.getByRole( 'button', { name: 'Send request' } ) );

		await waitFor( () =>
			expect( window.location.href ).toContain( '/checkout/example.wordpress.com' )
		);
		expect( mockAddProductsToCart ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'records a dismiss when the modal closes without a submit', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		const { recordTracksEvent } = renderModal( onClose );

		await goToRequestStep( user );
		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect( onClose ).toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_upsell_dismiss',
			expectedTracksProps
		);
	} );
} );
