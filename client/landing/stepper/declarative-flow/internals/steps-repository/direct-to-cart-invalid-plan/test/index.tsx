/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DirectToCartInvalidPlan from '..';

jest.mock( 'calypso/components/data/document-head', () => () => null );

function setup() {
	const navigation = {
		submit: jest.fn(),
		goBack: undefined,
		goNext: jest.fn(),
		goToStep: jest.fn(),
	};

	render(
		<MemoryRouter>
			{ /* @ts-expect-error -- stepper Step props are intentionally loose for tests */ }
			<DirectToCartInvalidPlan navigation={ navigation } flow="direct-to-cart" />
		</MemoryRouter>
	);

	return { navigation };
}

describe( 'DirectToCartInvalidPlan', () => {
	it( 'renders the headline and body copy', () => {
		setup();
		expect(
			screen.getByRole( 'heading', { name: /this link doesn.?t offer that plan/i } )
		).toBeVisible();
		expect( screen.getByText( /choose a plan that works for you/i ) ).toBeVisible();
	} );

	it( 'renders a CTA that links to /plans', async () => {
		setup();
		const cta = screen.getByRole( 'link', { name: /pick a plan/i } );
		expect( cta ).toBeVisible();
		expect( cta ).toHaveAttribute( 'href', '/plans' );
	} );

	it( 'CTA is keyboard-focusable', async () => {
		setup();
		const user = userEvent.setup();
		await user.tab();
		expect( screen.getByRole( 'link', { name: /pick a plan/i } ) ).toHaveFocus();
	} );
} );
