/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import HeroModern from '../index';

vi.mock( 'calypso/components/search-themes', () => ( {
	SearchThemes: ( { query }: { query: string } ) => (
		<input placeholder="Search themes…" defaultValue={ query } />
	),
} ) );

vi.mock( '../../use-theme-showcase-logged-out-seo-content', () => ( {
	__esModule: true,
	default: () => ( {
		title: 'WordPress Themes | 1000s of Options for All WordPress Sites',
		header: 'Beautiful themes for every idea',
		description:
			'Choose from thousands of free and premium themes to launch your blog, portfolio, store, or business—and customize every detail to make it your own.',
		metaDescription:
			'Choose from thousands of free and premium themes to launch your blog, portfolio, store, or business—and customize every detail to make it your own.',
	} ),
} ) );

describe( 'HeroModern', () => {
	const defaultProps = {
		filter: '',
		searchQuery: '',
		tier: '',
		onSearch: vi.fn(),
		onSearchTracksEvent: vi.fn(),
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
