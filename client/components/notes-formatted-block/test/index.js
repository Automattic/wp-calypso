/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import FormattedBlock from '..';

describe( 'FormattedBlock', () => {
	beforeEach( () => jest.resetAllMocks() );

	test( 'renders string content as-is', () => {
		const content = 'my content';

		render( <FormattedBlock content={ content } /> );

		const block = screen.getByText( content );

		expect( block ).toBeInTheDocument();

		// Test it's rendered as a raw string
		expect( block.innerHTML ).toEqual( content );
	} );
} );
