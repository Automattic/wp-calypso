/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import DifmOfferThankYou from '../thank-you';

const originalUrl = window.location.href;

afterEach( () => {
	window.history.replaceState( null, '', originalUrl );
} );

describe( 'DifmOfferThankYou', () => {
	test( 'thanks the user after a purchase through the offer, and clears the param on close', async () => {
		window.history.replaceState( null, '', '/?difmOffer=purchased' );
		render( <DifmOfferThankYou /> );

		expect(
			await screen.findByRole( 'dialog', { name: 'Thank you for trusting us!' } )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: /examples of our work/ } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/support/website-design-service/#what-will-my-completed-website-look-like'
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing without the param', () => {
		render( <DifmOfferThankYou /> );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );
} );
