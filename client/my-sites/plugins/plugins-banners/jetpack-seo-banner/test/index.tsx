/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { navigate } from 'calypso/lib/navigate';
import JetpackSeoBanner, { isSeoSearch } from '..';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/navigate', () => ( {
	navigate: jest.fn(),
} ) );

const baseProps = {
	siteId: 123,
	siteSlug: 'example.wordpress.com',
	searchTerm: 'seo',
	isSeoModuleActive: false,
	hasAdvancedSeo: true,
	seoAdminUrl: 'https://example.wordpress.com/wp-admin/admin.php?page=jetpack-seo',
	onEnableSeo: jest.fn(),
};

describe( 'isSeoSearch', () => {
	it( 'matches generic and feature SEO terms', () => {
		[ 'seo', 'SEO', 'xml sitemap', 'meta description', 'open graph', 'schema markup' ].forEach(
			( term ) => expect( isSeoSearch( term ) ).toBe( true )
		);
	} );

	it( 'matches common third-party SEO plugin names', () => {
		[ 'yoast', 'Yoast SEO', 'rank math', 'all in one seo', 'aioseo', 'the seo framework' ].forEach(
			( term ) => expect( isSeoSearch( term ) ).toBe( true )
		);
	} );

	it( 'does not match unrelated searches', () => {
		[ 'contact form', 'backup', 'woocommerce', 'gallery', 'security' ].forEach( ( term ) =>
			expect( isSeoSearch( term ) ).toBe( false )
		);
	} );

	it( 'handles empty or nullish input', () => {
		expect( isSeoSearch( '' ) ).toBe( false );
		expect( isSeoSearch( null ) ).toBe( false );
		expect( isSeoSearch( undefined ) ).toBe( false );
	} );
} );

describe( 'JetpackSeoBanner', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders the heading and description', () => {
		render( <JetpackSeoBanner { ...baseProps } /> );
		expect( screen.getByText( 'Jetpack already includes SEO tools' ) ).toBeVisible();
		expect( screen.getByText( /Optimize titles, meta descriptions, sitemaps/ ) ).toBeVisible();
	} );

	it( 'links the CTA to the Jetpack SEO admin page', () => {
		render( <JetpackSeoBanner { ...baseProps } /> );
		expect( screen.getByRole( 'link' ) ).toHaveAttribute(
			'href',
			'https://example.wordpress.com/wp-admin/admin.php?page=jetpack-seo'
		);
	} );

	it( 'shows "Manage SEO settings" when the module is active', () => {
		render( <JetpackSeoBanner { ...baseProps } isSeoModuleActive /> );
		expect( screen.getByRole( 'link', { name: 'Manage SEO settings' } ) ).toBeVisible();
	} );

	it( 'shows "Enable Jetpack SEO" when off but the plan supports it', () => {
		render( <JetpackSeoBanner { ...baseProps } isSeoModuleActive={ false } hasAdvancedSeo /> );
		expect( screen.getByRole( 'link', { name: 'Enable Jetpack SEO' } ) ).toBeVisible();
	} );

	it( 'shows "Set up Jetpack SEO" when the plan does not include SEO', () => {
		render(
			<JetpackSeoBanner { ...baseProps } isSeoModuleActive={ false } hasAdvancedSeo={ false } />
		);
		expect( screen.getByRole( 'link', { name: 'Set up Jetpack SEO' } ) ).toBeVisible();
	} );

	it( 'records an impression event on mount', () => {
		render( <JetpackSeoBanner { ...baseProps } /> );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_plugins_jetpack_seo_hint_impression',
			expect.objectContaining( { blog_id: 123, search_term: 'seo', seo_active: false } )
		);
	} );

	it( 'renders nothing and records no impression without a site slug', () => {
		const { container } = render( <JetpackSeoBanner { ...baseProps } siteSlug={ null } /> );
		expect( container ).toBeEmptyDOMElement();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'enables SEO and records the click in the enable state', async () => {
		const onEnableSeo = jest.fn();
		const user = userEvent.setup();
		render(
			<JetpackSeoBanner
				{ ...baseProps }
				isSeoModuleActive={ false }
				hasAdvancedSeo
				onEnableSeo={ onEnableSeo }
			/>
		);
		await user.click( screen.getByRole( 'link', { name: 'Enable Jetpack SEO' } ) );
		expect( onEnableSeo ).toHaveBeenCalledTimes( 1 );
		expect( navigate ).toHaveBeenCalledWith( baseProps.seoAdminUrl );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_plugins_jetpack_seo_hint_click',
			expect.objectContaining( { cta: 'enable_seo' } )
		);
	} );

	it( 'does not enable SEO when the module is already active', async () => {
		const onEnableSeo = jest.fn();
		const user = userEvent.setup();
		render( <JetpackSeoBanner { ...baseProps } isSeoModuleActive onEnableSeo={ onEnableSeo } /> );
		await user.click( screen.getByRole( 'link', { name: 'Manage SEO settings' } ) );
		expect( onEnableSeo ).not.toHaveBeenCalled();
		expect( navigate ).toHaveBeenCalledWith( baseProps.seoAdminUrl );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_plugins_jetpack_seo_hint_click',
			expect.objectContaining( { cta: 'manage_seo' } )
		);
	} );

	it( 'enables SEO before navigating in the upsell state too', async () => {
		const onEnableSeo = jest.fn();
		const user = userEvent.setup();
		render(
			<JetpackSeoBanner
				{ ...baseProps }
				isSeoModuleActive={ false }
				hasAdvancedSeo={ false }
				onEnableSeo={ onEnableSeo }
			/>
		);
		await user.click( screen.getByRole( 'link', { name: 'Set up Jetpack SEO' } ) );
		expect( onEnableSeo ).toHaveBeenCalledTimes( 1 );
		expect( navigate ).toHaveBeenCalledWith( baseProps.seoAdminUrl );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_plugins_jetpack_seo_hint_click',
			expect.objectContaining( { cta: 'upsell' } )
		);
	} );

	it( 'waits for the module to finish activating before navigating', async () => {
		let resolveEnable: () => void = () => {};
		const onEnableSeo = jest.fn(
			() => new Promise< void >( ( resolve ) => ( resolveEnable = resolve ) )
		);
		const user = userEvent.setup();
		render(
			<JetpackSeoBanner
				{ ...baseProps }
				isSeoModuleActive={ false }
				hasAdvancedSeo
				onEnableSeo={ onEnableSeo }
			/>
		);
		await user.click( screen.getByRole( 'link', { name: 'Enable Jetpack SEO' } ) );
		expect( onEnableSeo ).toHaveBeenCalledTimes( 1 );
		// Navigation is held back until activation resolves, so the user never lands
		// on the SEO page while the module is still off.
		expect( navigate ).not.toHaveBeenCalled();
		resolveEnable();
		await waitFor( () => expect( navigate ).toHaveBeenCalledWith( baseProps.seoAdminUrl ) );
	} );
} );
