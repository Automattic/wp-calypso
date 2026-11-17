import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useViewportMatch } from '@wordpress/compose';
import { vi } from 'vitest';
import { SearchForm } from '..';
import { TestDomainSearch } from '../../../test-helpers/renderer';

vi.mock( '@wordpress/compose', async () => ( {
	...( await vi.importActual< typeof import( '@wordpress/compose' ) >( '@wordpress/compose' ) ),
	useViewportMatch: vi.fn(),
} ) );

const mockUseViewportMatch = vi.mocked( useViewportMatch );

beforeEach( () => {
	mockUseViewportMatch.mockReturnValue( false );
} );

const expectPlaceholderPhrase = ( phrase: string ) => {
	// Initial state
	expect( screen.getByRole( 'searchbox' ) ).toHaveAttribute( 'placeholder', '' );

	let i = 1;

	while ( screen.getByRole( 'searchbox' ).getAttribute( 'placeholder' ) !== phrase ) {
		act( () => {
			vi.advanceTimersByTime( 60 );
		} );

		expect( screen.getByRole( 'searchbox' ) ).toHaveAttribute(
			'placeholder',
			phrase.substring( 0, i )
		);

		i++;
	}

	return true;
};

describe( 'SearchForm', () => {
	it( 'allows searching for a term', async () => {
		const user = userEvent.setup();

		const onQueryChange = vi.fn();
		const onSearchStart = vi.fn();

		render(
			<TestDomainSearch events={ { onQueryChange, onSearchStart } }>
				<SearchForm />
			</TestDomainSearch>
		);

		await user.type( screen.getByRole( 'searchbox' ), 'test' );
		await user.click( screen.getByRole( 'button', { name: 'Search domains' } ) );

		expect( onQueryChange ).toHaveBeenCalledWith( 'test' );
		expect( onSearchStart ).toHaveBeenCalledWith( 'test', 'submit' );
	} );

	it( 'shows the search hint on empty search', async () => {
		const user = userEvent.setup();

		const onQueryChange = vi.fn();
		const onSearchStart = vi.fn();

		render(
			<TestDomainSearch events={ { onQueryChange, onSearchStart } }>
				<SearchForm />
			</TestDomainSearch>
		);

		await user.click( screen.getByRole( 'button', { name: 'Search domains' } ) );

		expect( screen.getByText( /Try searching for a word like/i ) ).toBeInTheDocument();
		expect( onSearchStart ).not.toHaveBeenCalled();

		await user.click( screen.getByRole( 'button', { name: 'studio' } ) );

		expect( onQueryChange ).toHaveBeenCalledWith( 'studio' );
		expect( onSearchStart ).toHaveBeenCalledWith( 'studio', 'hint_link' );
	} );

	it( 'submits via the Enter key', async () => {
		const user = userEvent.setup();

		const onQueryChange = vi.fn();
		const onSearchStart = vi.fn();

		render(
			<TestDomainSearch events={ { onQueryChange, onSearchStart } }>
				<SearchForm />
			</TestDomainSearch>
		);

		expect( screen.getByRole( 'button', { name: 'Search domains' } ) ).toBeInTheDocument();

		await user.type( screen.getByRole( 'searchbox' ), 'test' );
		await user.type( screen.getByRole( 'searchbox' ), '{enter}' );

		expect( onQueryChange ).toHaveBeenCalledWith( 'test' );
		expect( onSearchStart ).toHaveBeenCalledWith( 'test', 'submit' );
	} );

	it( 'renders the icon-only submit inside a field wrapper on mobile', async () => {
		mockUseViewportMatch.mockReturnValue( true );
		const user = userEvent.setup();
		const onQueryChange = vi.fn();

		const { container } = render(
			<TestDomainSearch events={ { onQueryChange } }>
				<SearchForm />
			</TestDomainSearch>
		);

		expect( container.querySelector( '.domain-search__search-form-field' ) ).toBeInTheDocument();
		expect(
			container.querySelector( '.domain-search-controls__submit.is-icon-only' )
		).toBeInTheDocument();

		await user.type( screen.getByRole( 'searchbox' ), 'test' );
		await user.click( screen.getByRole( 'button', { name: 'Search domains' } ) );

		expect( onQueryChange ).toHaveBeenCalledWith( 'test' );
	} );

	it( 'cycles through placeholder phrases', async () => {
		vi.useFakeTimers();

		render(
			<TestDomainSearch>
				<SearchForm />
			</TestDomainSearch>
		);

		expect( expectPlaceholderPhrase( 'dailywine.blog' ) ).toBe( true );
		act( () => vi.advanceTimersByTime( 3000 ) );

		expect( expectPlaceholderPhrase( 'creatortools.shop' ) ).toBe( true );
		act( () => vi.advanceTimersByTime( 3000 ) );

		expect( expectPlaceholderPhrase( 'literatiagency.com' ) ).toBe( true );
		act( () => vi.advanceTimersByTime( 3000 ) );

		expect( expectPlaceholderPhrase( 'democratizework.org' ) ).toBe( true );
		act( () => vi.advanceTimersByTime( 3000 ) );

		expect( expectPlaceholderPhrase( 'discardedobject.art' ) ).toBe( true );
		act( () => vi.advanceTimersByTime( 3000 ) );

		expect( expectPlaceholderPhrase( 'dailywine.blog' ) ).toBe( true );

		vi.useRealTimers();
	} );
} );
