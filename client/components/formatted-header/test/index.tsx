/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import FormattedHeader from '../index';

jest.mock( 'calypso/components/info-popover', () => () => null );

describe( 'FormattedHeader', () => {
	it( 'renders a header by default', () => {
		const { container } = render( <FormattedHeader headerText="Recent" /> );

		expect( container.firstChild?.nodeName ).toBe( 'HEADER' );
		expect( screen.getByRole( 'heading', { level: 1, name: 'Recent' } ) ).toBeVisible();
	} );

	it( 'can render inside another header without nesting header elements', () => {
		const { container } = render(
			<header>
				<FormattedHeader as="div" headerText="Recent" subHeaderText="Your subscriptions" />
			</header>
		);

		expect( container.querySelectorAll( 'header' ) ).toHaveLength( 1 );
		expect( screen.getByRole( 'heading', { level: 1, name: 'Recent' } ) ).toBeVisible();
		expect( screen.getByText( 'Your subscriptions' ) ).toBeVisible();
	} );
} );
