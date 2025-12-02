import { render, screen } from '@testing-library/react';
import { TestDomainSearch } from '../../test-helpers/renderer';
import { InitialState } from '../initial-state';

describe( 'InitialState', () => {
	it( 'renders the search form', () => {
		render(
			<TestDomainSearch>
				<InitialState />
			</TestDomainSearch>
		);

		expect( screen.getByRole( 'searchbox' ) ).toBeInTheDocument();
	} );

	it( 'renders the already own domain CTA when config allows it', () => {
		render(
			<TestDomainSearch
				events={ { onExternalDomainClick: jest.fn() } }
				config={ { allowsUsingOwnDomain: true } }
			>
				<InitialState />
			</TestDomainSearch>
		);

		expect( screen.getByText( /already have a domain/i ) ).toBeInTheDocument();
	} );

	it( 'does not render the already own domain CTA when config disallows it', () => {
		render(
			<TestDomainSearch config={ { allowsUsingOwnDomain: false } }>
				<InitialState />
			</TestDomainSearch>
		);

		expect( screen.queryByText( /already have a domain/i ) ).not.toBeInTheDocument();
	} );

	it( 'calls onExternalDomainClick when CTA is clicked', () => {
		const onExternalDomainClick = jest.fn();

		render(
			<TestDomainSearch
				config={ { allowsUsingOwnDomain: true } }
				events={ { onExternalDomainClick } }
			>
				<InitialState />
			</TestDomainSearch>
		);

		screen.getByText( /already have a domain/i ).click();
		expect( onExternalDomainClick ).toHaveBeenCalled();
	} );
} );
