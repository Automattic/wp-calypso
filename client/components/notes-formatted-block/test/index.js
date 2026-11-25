/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import FormattedBlock from '..';

describe( 'FormattedBlock', () => {
	beforeEach( () => vi.resetAllMocks() );

	test( 'renders string content as-is', () => {
		const content = 'my content';

		render( <FormattedBlock content={ content } /> );

		const block = screen.getByText( content );

		expect( block ).toBeInTheDocument();

		// Test it's rendered as a raw string
		expect( block.innerHTML ).toEqual( content );
	} );
} );
