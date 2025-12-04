/**
 * @jest-environment jsdom
 */
import { render } from '../../../test-utils';
import { canViewSiteVisibilitySettings } from '../../features';
import SiteVisibilitySettingsSummary from '../summary';
import type { Site, SiteSettings } from '@automattic/api-core';

jest.mock( '../../features', () => ( {
	canViewSiteVisibilitySettings: jest.fn(),
} ) );

const mockCanViewSiteVisibilitySettings = canViewSiteVisibilitySettings as jest.MockedFunction<
	typeof canViewSiteVisibilitySettings
>;

function createSite( overrides: Partial< Site > = {} ) {
	return {
		ID: 123,
		slug: 'example-site.wordpress.com',
		is_wpcom_flex: false,
		...overrides,
	} as Site;
}

function createSettings(
	overrides: Partial< Pick< SiteSettings, 'blog_public' | 'wpcom_public_coming_soon' > > = {}
) {
	return {
		blog_public: 1,
		wpcom_public_coming_soon: 0,
		...overrides,
	} as SiteSettings;
}

function renderSummary( {
	site = createSite(),
	settings,
}: {
	site?: Site;
	settings?: SiteSettings;
} = {} ) {
	return render( <SiteVisibilitySettingsSummary site={ site } settings={ settings } /> );
}

beforeEach( () => {
	mockCanViewSiteVisibilitySettings.mockReturnValue( true );
} );

afterEach( () => {
	jest.clearAllMocks();
} );

test( 'renders a navigation link to the site visibility settings page', () => {
	const site = createSite( { slug: 'my-site.com' } );
	const { getByRole } = renderSummary( {
		site,
		settings: createSettings(),
	} );

	const link = getByRole( 'link', { name: 'Site visibility Public' } );

	expect( link ).toHaveAttribute( 'href', '/sites/my-site.com/settings/site-visibility' );
} );

test( 'displays a coming soon badge when the site is in coming soon mode', () => {
	const { getByText } = renderSummary( {
		settings: createSettings( {
			wpcom_public_coming_soon: 1,
			blog_public: 0,
		} ),
	} );

	expect( getByText( 'Coming soon' ) ).toBeVisible();
} );

test( 'displays a private badge when the site is private', () => {
	const { getByText } = renderSummary( {
		settings: createSettings( { blog_public: -1 } ),
	} );

	expect( getByText( 'Private' ) ).toBeVisible();
} );

test( 'defaults to a public badge when no specific site visibility is provided', () => {
	const { getByText } = renderSummary();

	expect( getByText( 'Public' ) ).toBeVisible();
} );

test( 'returns null when the user cannot view site visibility settings', () => {
	mockCanViewSiteVisibilitySettings.mockReturnValue( false );
	const { container } = renderSummary();

	expect( container ).toBeEmptyDOMElement();
} );
