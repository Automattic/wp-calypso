/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { useThemeCollection } from 'calypso/my-sites/themes/collections/use-theme-collection';
import ThemeSection from '../theme-section';

const mockThemes = [
	{ id: 'theme-1', name: 'Theme One', stylesheet: 'pub/theme-1' },
	{ id: 'theme-2', name: 'Theme Two', stylesheet: 'pub/theme-2' },
];

vi.mock( 'calypso/components/data/query-themes', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useQueryThemes: vi.fn(),
	} )
);

vi.mock( 'calypso/my-sites/themes/collections/use-theme-collection', () => ( {
	useThemeCollection: vi.fn( () => ( {
		themes: mockThemes,
		getPrice: vi.fn(),
		isActive: vi.fn(),
		isInstalling: vi.fn(),
		isLivePreviewStarted: vi.fn(),
		siteId: null,
		getThemeType: vi.fn(),
		getThemeTierForTheme: vi.fn(),
		filterString: '',
		getThemeDetailsUrl: vi.fn(),
	} ) ),
} ) );

vi.mock( 'calypso/my-sites/themes/events/theme-showcase-tracks', () => ( {
	getThemeShowcaseEventRecorder: vi.fn( () => ( {
		recordThemeClick: vi.fn(),
		recordThemeStyleVariationClick: vi.fn(),
		recordThemesStyleVariationMoreClick: vi.fn(),
	} ) ),
} ) );

vi.mock( 'calypso/components/themes-list', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		ThemeBlock: ( { theme }: { theme: { id: string; name: string } } ) => (
			<div data-testid={ `theme-block-${ theme.id }` }>{ theme.name }</div>
		),
	} )
);

vi.mock( 'calypso/my-sites/themes/helpers', () => ( {
	trackClick: vi.fn(),
} ) );

const defaultProps = {
	title: 'Our favorites',
	subtitle: 'Exceptional themes selected by the WordPress.com design team.',
	buttonLabel: 'See all',
	seeAllUrl: '/themes/recommended/collection',
	query: {
		collection: 'recommended',
		number: 6,
		tier: '',
		filter: '',
		search: '',
		page: 1,
	},
	sectionSlug: 'favorites',
	sectionIndex: 0,
	getActionLabel: vi.fn(),
	getOptions: vi.fn(),
	getScreenshotUrl: vi.fn(),
};

describe( 'ThemeSection', () => {
	test( 'renders section title and subtitle', () => {
		render( <ThemeSection { ...defaultProps } /> );
		expect( screen.getByText( 'Our favorites' ) ).toBeVisible();
		expect(
			screen.getByText( 'Exceptional themes selected by the WordPress.com design team.' )
		).toBeVisible();
	} );

	test( 'renders a theme block for each theme', () => {
		render( <ThemeSection { ...defaultProps } /> );
		expect( screen.getByTestId( 'theme-block-theme-1' ) ).toBeVisible();
		expect( screen.getByTestId( 'theme-block-theme-2' ) ).toBeVisible();
	} );

	test( 'places the redesign entry before the themes', () => {
		const { container } = render(
			<ThemeSection
				{ ...defaultProps }
				leadingCard={ <a href="/site-redesign/example">Redesign</a> }
			/>
		);
		expect( container.querySelector( '.theme-section-modern__grid' )?.firstElementChild ).toBe(
			screen.getByRole( 'link', { name: 'Redesign' } )
		);
	} );

	test( 'renders "See all" button', () => {
		render( <ThemeSection { ...defaultProps } /> );
		expect( screen.getByRole( 'link', { name: 'See all' } ) ).toBeVisible();
	} );

	test( 'applies light variant by default', () => {
		const { container } = render( <ThemeSection { ...defaultProps } /> );
		expect( container.querySelector( '.theme-section-modern' ) ).not.toHaveClass( 'is-dark' );
	} );

	test( 'applies dark variant class when variant is "dark"', () => {
		const { container } = render( <ThemeSection { ...defaultProps } variant="dark" /> );
		expect( container.querySelector( '.theme-section-modern' ) ).toHaveClass( 'is-dark' );
	} );

	test( 'renders empty grid when there are no themes', () => {
		vi.mocked( useThemeCollection ).mockReturnValueOnce( {
			themes: [],
			getPrice: vi.fn(),
			isActive: vi.fn(),
			isInstalling: vi.fn(),
			isLivePreviewStarted: vi.fn(),
			siteId: null,
			getThemeType: vi.fn(),
			getThemeTierForTheme: vi.fn(),
			filterString: '',
			getThemeDetailsUrl: vi.fn(),
		} );

		const { container } = render( <ThemeSection { ...defaultProps } /> );
		expect( container.querySelector( '.theme-section-modern__grid' )?.children ).toHaveLength( 0 );
	} );
} );
