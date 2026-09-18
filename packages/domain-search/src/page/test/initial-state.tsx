import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useViewportMatch } from '@wordpress/compose';
import { TestDomainSearch } from '../../test-helpers/renderer';
import { InitialState } from '../initial-state';

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

describe( 'InitialState', () => {
	beforeEach( () => {
		jest.mocked( useViewportMatch ).mockReturnValue( false );
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

	describe( 'with Name Pulse on', () => {
		beforeEach( () => {
			jest.useFakeTimers();
		} );

		afterEach( () => {
			jest.useRealTimers();
		} );

		it( 'searches as the user types, without submitting', async () => {
			const onQueryChange = jest.fn();
			const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

			render(
				<TestDomainSearch events={ { onQueryChange } } config={ { showNamePulseSearch: true } }>
					<InitialState />
				</TestDomainSearch>
			);

			await user.type( screen.getByRole( 'searchbox' ), 'coffee' );
			act( () => {
				jest.advanceTimersByTime( 300 );
			} );

			expect( onQueryChange ).toHaveBeenCalledWith( 'coffee' );
		} );

		it( 'keeps submit-only search when Name Pulse is off', async () => {
			const onQueryChange = jest.fn();
			const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

			render(
				<TestDomainSearch events={ { onQueryChange } }>
					<InitialState />
				</TestDomainSearch>
			);

			await user.type( screen.getByRole( 'searchbox' ), 'coffee' );
			act( () => {
				jest.advanceTimersByTime( 300 );
			} );

			expect( onQueryChange ).not.toHaveBeenCalled();
		} );
	} );
} );
