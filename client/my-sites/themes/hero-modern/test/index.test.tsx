/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import HeroModern from '../index';

jest.mock( 'calypso/components/search-themes', () => ( {
	SearchThemes: ( { query }: { query: string } ) => (
		<input placeholder="Search themes…" defaultValue={ query } />
	),
} ) );

describe( 'HeroModern', () => {
	const defaultProps = {
		searchQuery: '',
		onSearch: jest.fn(),
		onSearchTracksEvent: jest.fn(),
	};

	test( 'renders title and description', () => {
		render( <HeroModern { ...defaultProps } /> );
		expect( screen.getByText( /Beautiful themes for every idea/i ) ).toBeVisible();
		expect( screen.getByText( /Choose from thousands of free and premium/i ) ).toBeVisible();
	} );

	test( 'renders search input', () => {
		render( <HeroModern { ...defaultProps } /> );
		expect( screen.getByPlaceholderText( 'Search themes…' ) ).toBeVisible();
	} );

	test( 'renders inside a full-width section', () => {
		const { container } = render( <HeroModern { ...defaultProps } /> );
		expect( container.querySelector( '.full-width-section' ) ).toBeInTheDocument();
	} );
} );
