/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SearchResultsModern from '../index';

let mockWpcomThemes: Array< { id: string; name: string } > = [];
let mockWporgThemes: Array< { id: string; name: string } > = [];
let mockIsRequesting = false;

vi.mock( 'calypso/components/data/query-themes', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useQueryThemes: vi.fn(),
	} )
);

vi.mock( 'calypso/my-sites/themes/collections/use-theme-collection', () => ( {
	useThemeCollection: () => ( {
		getPrice: vi.fn(),
		themes: mockWpcomThemes,
		isActive: vi.fn(),
		isInstalling: vi.fn(),
		isLivePreviewStarted: vi.fn(),
		siteId: null,
		getThemeType: vi.fn(),
		getThemeTierForTheme: vi.fn(),
		filterString: '',
		getThemeDetailsUrl: vi.fn(),
	} ),
} ) );

vi.mock( 'calypso/state/themes/selectors', () => ( {
	getThemesForQueryIgnoringPage: () => mockWporgThemes,
	isRequestingThemesForQuery: () => mockIsRequesting,
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

vi.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
	useDispatch: () => vi.fn(),
} ) );

vi.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: vi.fn(),
} ) );

vi.mock( 'calypso/lib/build-url', () => ( {
	buildRelativeSearchUrl: ( url: string, search: string ) =>
		search ? `${ url }?s=${ search }` : url,
} ) );

const defaultProps = {
	search: 'portfolio',
	filter: '',
	tier: '',
	getActionLabel: () => 'Activate',
	getOptions: () => ( {} ),
	getScreenshotUrl: () => 'https://example.com/screenshot.png',
};

describe( 'SearchResultsModern', () => {
	beforeEach( () => {
		mockWpcomThemes = [];
		mockWporgThemes = [];
		mockIsRequesting = false;
	} );

	test( 'renders "No themes found" when there are no results', () => {
		render( <SearchResultsModern { ...defaultProps } /> );
		expect( screen.getByRole( 'heading', { name: 'No themes found' } ) ).toBeVisible();
		expect( screen.getByText( /Try building your site another way/ ) ).toBeVisible();
	} );

	test( 'renders nothing while loading with no themes yet', () => {
		mockIsRequesting = true;
		const { container } = render( <SearchResultsModern { ...defaultProps } /> );
		expect( container.innerHTML ).toBe( '' );
	} );

	test( 'renders wpcom section when there are wpcom themes', () => {
		mockWpcomThemes = [ { id: 'theme-1', name: 'Theme One' } ];
		render( <SearchResultsModern { ...defaultProps } /> );
		expect( screen.getByRole( 'heading', { name: /Results for.*portfolio/ } ) ).toBeVisible();
		expect( screen.getByTestId( 'theme-block-theme-1' ) ).toBeVisible();
	} );

	test( 'renders community section when there are wporg themes', () => {
		mockWporgThemes = [ { id: 'theme-2', name: 'Theme Two' } ];
		render( <SearchResultsModern { ...defaultProps } /> );
		expect( screen.getByRole( 'heading', { name: 'Community themes' } ) ).toBeVisible();
		expect( screen.getByText( /Explore.*themes from the WordPress community/ ) ).toBeVisible();
		expect( screen.getByTestId( 'theme-block-theme-2' ) ).toBeVisible();
	} );

	test( 'renders both sections when there are wpcom and wporg themes', () => {
		mockWpcomThemes = [ { id: 'theme-1', name: 'Theme One' } ];
		mockWporgThemes = [ { id: 'theme-2', name: 'Theme Two' } ];
		render( <SearchResultsModern { ...defaultProps } /> );
		expect( screen.getByRole( 'heading', { name: /Results for.*portfolio/ } ) ).toBeVisible();
		expect( screen.getByRole( 'heading', { name: 'Community themes' } ) ).toBeVisible();
	} );

	test( 'renders "More options" section when there are some results', () => {
		mockWpcomThemes = [ { id: 'theme-1', name: 'Theme One' } ];
		render( <SearchResultsModern { ...defaultProps } /> );
		expect(
			screen.getByRole( 'heading', { name: 'More options to create your site' } )
		).toBeVisible();
	} );

	test( 'does not render "More options" subtitle when there are results', () => {
		mockWpcomThemes = [ { id: 'theme-1', name: 'Theme One' } ];
		render( <SearchResultsModern { ...defaultProps } /> );
		expect( screen.queryByText( /Try building your site another way/ ) ).not.toBeInTheDocument();
	} );

	test( 'hides wpcom section when there are no wpcom themes', () => {
		mockWporgThemes = [ { id: 'theme-2', name: 'Theme Two' } ];
		render( <SearchResultsModern { ...defaultProps } /> );
		expect( screen.queryByText( /Results for/ ) ).not.toBeInTheDocument();
	} );

	test( 'hides wporg section when there are no wporg themes', () => {
		mockWpcomThemes = [ { id: 'theme-1', name: 'Theme One' } ];
		render( <SearchResultsModern { ...defaultProps } /> );
		expect( screen.queryByText( 'Community themes' ) ).not.toBeInTheDocument();
	} );

	test( 'limits community themes to 6 and shows "See all" button', () => {
		mockWporgThemes = Array.from( { length: 8 }, ( _, i ) => ( {
			id: `theme-${ i + 1 }`,
			name: `Theme ${ i + 1 }`,
		} ) );
		render( <SearchResultsModern { ...defaultProps } /> );
		// Only 6 themes should be rendered.
		for ( let i = 1; i <= 6; i++ ) {
			expect( screen.getByTestId( `theme-block-theme-${ i }` ) ).toBeVisible();
		}
		expect( screen.queryByTestId( 'theme-block-theme-7' ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'theme-block-theme-8' ) ).not.toBeInTheDocument();
		// "See all" button should be visible.
		expect( screen.getByRole( 'button', { name: 'See all' } ) ).toBeVisible();
	} );

	test( 'does not show "See all" button when 6 or fewer community themes', () => {
		mockWporgThemes = Array.from( { length: 6 }, ( _, i ) => ( {
			id: `theme-${ i + 1 }`,
			name: `Theme ${ i + 1 }`,
		} ) );
		render( <SearchResultsModern { ...defaultProps } /> );
		// All 6 themes should be rendered.
		for ( let i = 1; i <= 6; i++ ) {
			expect( screen.getByTestId( `theme-block-theme-${ i }` ) ).toBeVisible();
		}
		expect( screen.queryByRole( 'button', { name: 'See all' } ) ).not.toBeInTheDocument();
	} );
} );
