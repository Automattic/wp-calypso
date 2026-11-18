import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useViewportMatch } from '@wordpress/compose';
import { vi } from 'vitest';
import { TestDomainSearch } from '../../test-helpers/renderer';
import { InitialState } from '../initial-state';

vi.mock( '@wordpress/compose', async () => ( {
	...( await vi.importActual< typeof import( '@wordpress/compose' ) >( '@wordpress/compose' ) ),
	useViewportMatch: vi.fn(),
} ) );

describe( 'InitialState', () => {
	beforeEach( () => {
		vi.mocked( useViewportMatch ).mockReturnValue( false );
	} );

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
				events={ { onExternalDomainClick: vi.fn() } }
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
		const onExternalDomainClick = vi.fn();

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

	it( 'does not render the already have a site CTA without onMigrateSiteClick', () => {
		render(
			<TestDomainSearch>
				<InitialState />
			</TestDomainSearch>
		);

		expect( screen.queryByText( /already have a site/i ) ).not.toBeInTheDocument();
	} );

	it( 'renders both CTAs and calls onMigrateSiteClick when the site CTA is clicked', async () => {
		const onMigrateSiteClick = vi.fn();

		render(
			<TestDomainSearch
				config={ { allowsUsingOwnDomain: true } }
				events={ { onExternalDomainClick: vi.fn(), onMigrateSiteClick } }
			>
				<InitialState />
			</TestDomainSearch>
		);

		expect( screen.getByText( /already have a domain/i ) ).toBeInTheDocument();

		await userEvent.click( screen.getByText( /already have a site/i ) );
		expect( onMigrateSiteClick ).toHaveBeenCalled();
	} );

	it( 'renders the already have a site CTA when using your own domain is not allowed', () => {
		render(
			<TestDomainSearch
				config={ { allowsUsingOwnDomain: false } }
				events={ { onMigrateSiteClick: vi.fn() } }
			>
				<InitialState />
			</TestDomainSearch>
		);

		expect( screen.getByText( /already have a site/i ) ).toBeInTheDocument();
		expect( screen.queryByText( /already have a domain/i ) ).not.toBeInTheDocument();
	} );

	describe( 'with Name Pulse on', () => {
		beforeEach( () => {
			vi.useFakeTimers();
		} );

		afterEach( () => {
			vi.useRealTimers();
		} );

		it( 'searches as the user types, without submitting', async () => {
			const onQueryChange = vi.fn();
			const user = userEvent.setup( { advanceTimers: vi.advanceTimersByTime } );

			render(
				<TestDomainSearch events={ { onQueryChange } } config={ { showNamePulseSearch: true } }>
					<InitialState />
				</TestDomainSearch>
			);

			await user.type( screen.getByRole( 'searchbox' ), 'coffee' );
			act( () => {
				vi.advanceTimersByTime( 300 );
			} );

			expect( onQueryChange ).toHaveBeenCalledWith( 'coffee' );
		} );

		it( 'keeps submit-only search when Name Pulse is off', async () => {
			const onQueryChange = vi.fn();
			const user = userEvent.setup( { advanceTimers: vi.advanceTimersByTime } );

			render(
				<TestDomainSearch events={ { onQueryChange } }>
					<InitialState />
				</TestDomainSearch>
			);

			await user.type( screen.getByRole( 'searchbox' ), 'coffee' );
			act( () => {
				vi.advanceTimersByTime( 300 );
			} );

			expect( onQueryChange ).not.toHaveBeenCalled();
		} );
	} );
} );
