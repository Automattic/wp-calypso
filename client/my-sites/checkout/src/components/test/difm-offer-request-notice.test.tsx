/**
 * @jest-environment jsdom
 */

import { PLAN_BUSINESS, PLAN_PREMIUM } from '@automattic/calypso-products';
import { getEmptyResponseCart, getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DIFMOfferRequestNotice from '../difm-offer-request-notice';
import type { ResponseCart, ResponseCartProductExtra } from '@automattic/shopping-cart';

const NOTICE_COPY =
	"Thank you for submitting your request. After you complete checkout, we'll be in touch within 24 hours to discuss your project.";

function cartWith( product_slug: string, extra: ResponseCartProductExtra = {} ): ResponseCart {
	const cart = getEmptyResponseCart();
	cart.products.push( { ...getEmptyResponseCartProduct(), product_slug, extra } );
	return cart;
}

describe( 'DIFMOfferRequestNotice', () => {
	it( 'renders the request-received copy for a Business plan flagged with difm_offer', () => {
		const { container } = render(
			<DIFMOfferRequestNotice responseCart={ cartWith( PLAN_BUSINESS, { difm_offer: true } ) } />
		);

		// Scope to the container: the notice also announces its copy in an a11y-speak region.
		expect( within( container ).getByText( NOTICE_COPY ) ).toBeInTheDocument();
	} );

	it( 'renders nothing for an unflagged Business plan', () => {
		const { container } = render(
			<DIFMOfferRequestNotice responseCart={ cartWith( PLAN_BUSINESS ) } />
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing for a flagged product that is not a Business plan', () => {
		const { container } = render(
			<DIFMOfferRequestNotice responseCart={ cartWith( PLAN_PREMIUM, { difm_offer: true } ) } />
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'disappears when dismissed', async () => {
		const { container } = render(
			<DIFMOfferRequestNotice responseCart={ cartWith( PLAN_BUSINESS, { difm_offer: true } ) } />
		);

		await userEvent.click( screen.getByRole( 'button', { name: /close/i } ) );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
