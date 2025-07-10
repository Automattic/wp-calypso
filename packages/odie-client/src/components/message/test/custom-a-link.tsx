import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import CustomALink from '../custom-a-link';

describe( 'custom-a-link', () => {
	it( 'should add help-center search param to internal URLs', () => {
		render(
			<MemoryRouter>
				<CustomALink href="https://wordpress.com/support/make-a-screenshot/">Test Link</CustomALink>
			</MemoryRouter>
		);

		expect( screen.getByRole( 'link', { name: /test link/i } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( 'help-center=wapuu' )
		);
	} );

	it( 'should not add help-center search param to external URLs', () => {
		render(
			<MemoryRouter>
				<CustomALink href="https://example.com/">Test Link</CustomALink>
			</MemoryRouter>
		);

		expect( screen.getByRole( 'link', { name: /test link/i } ) ).toHaveAttribute(
			'href',
			'https://example.com/'
		);
	} );
} );
