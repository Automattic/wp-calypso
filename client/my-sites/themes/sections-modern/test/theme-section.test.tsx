/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ThemeSection from '../theme-section';

const mockThemes = [
	{ id: 'theme-1', name: 'Theme One', stylesheet: 'pub/theme-1' },
	{ id: 'theme-2', name: 'Theme Two', stylesheet: 'pub/theme-2' },
];

jest.mock( 'calypso/components/data/query-themes', () => ( {
	useQueryThemes: jest.fn(),
} ) );

jest.mock( 'calypso/my-sites/themes/collections/use-theme-collection', () => ( {
	useThemeCollection: jest.fn( () => ( {
		themes: mockThemes,
		getPrice: jest.fn(),
		isActive: jest.fn(),
		isInstalling: jest.fn(),
		isLivePreviewStarted: jest.fn(),
		siteId: null,
		getThemeType: jest.fn(),
		getThemeTierForTheme: jest.fn(),
		filterString: '',
		getThemeDetailsUrl: jest.fn(),
	} ) ),
} ) );

jest.mock( 'calypso/my-sites/themes/events/theme-showcase-tracks', () => ( {
	getThemeShowcaseEventRecorder: jest.fn( () => ( {
		recordThemeClick: jest.fn(),
		recordThemeStyleVariationClick: jest.fn(),
		recordThemesStyleVariationMoreClick: jest.fn(),
	} ) ),
} ) );

jest.mock( 'calypso/components/themes-list', () => ( {
	ThemeBlock: ( { theme }: { theme: { id: string; name: string } } ) => (
		<div data-testid={ `theme-block-${ theme.id }` }>{ theme.name }</div>
	),
} ) );

jest.mock( 'calypso/my-sites/themes/helpers', () => ( {
	trackClick: jest.fn(),
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
	getActionLabel: jest.fn(),
	getOptions: jest.fn(),
	getScreenshotUrl: jest.fn(),
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

	test( 'renders "See all" button', () => {
		render( <ThemeSection { ...defaultProps } /> );
		expect( screen.getByRole( 'button', { name: 'See all' } ) ).toBeVisible();
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
		const { useThemeCollection } = jest.requireMock(
			'calypso/my-sites/themes/collections/use-theme-collection'
		);
		useThemeCollection.mockReturnValueOnce( {
			themes: [],
			getPrice: jest.fn(),
			isActive: jest.fn(),
			isInstalling: jest.fn(),
			isLivePreviewStarted: jest.fn(),
			siteId: null,
			getThemeType: jest.fn(),
			getThemeTierForTheme: jest.fn(),
			filterString: '',
			getThemeDetailsUrl: jest.fn(),
		} );

		const { container } = render( <ThemeSection { ...defaultProps } /> );
		expect( container.querySelector( '.theme-section-modern__grid' )?.children ).toHaveLength( 0 );
	} );
} );
