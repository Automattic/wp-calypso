/** @jest-environment jsdom */
jest.mock( 'calypso/blocks/upsell-nudge', () =>
	jest.fn( () => <div data-testid="UpsellNudge" /> )
);
jest.mock( 'calypso/components/data/query-site-settings', () => () => 'QuerySiteSettings' );
jest.mock( 'calypso/components/data/query-jetpack-modules', () => () => 'QueryJetpackModules' );
jest.mock( 'calypso/components/seo/meta-title-editor', () => () => (
	<div data-testid="MetaTitleEditor" />
) );

import {
	PLAN_FREE,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BUSINESS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
} from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { SiteSettingsFormSEO as SeoForm } from '../form';

const props = {
	refreshSiteData: ( x ) => x,
	site: {
		plan: PLAN_FREE,
	},
	selectedSite: {},
	translate: ( x ) => x,
};

describe( 'SeoForm basic tests', () => {
	afterEach( () => {
		UpsellNudge.mockClear();
	} );

	test( 'should not blow up and have proper CSS class', () => {
		render( <SeoForm { ...props } /> );
		expect( screen.queryByRole( 'form', { name: /seo site settings/i } ) ).toBeVisible();
	} );

	test( 'should render conflicted SEO notice when conflictedSeoPlugin is set', () => {
		render( <SeoForm { ...props } conflictedSeoPlugin={ { name: 'test' } } /> );
		const notice = screen.queryByRole( 'status', { name: 'Notice' } );
		expect( notice ).toBeVisible();
		expect( notice ).toHaveTextContent( 'Your SEO settings' );
	} );

	test( 'should not render conflicted SEO notice when conflictedSeoPlugin is not set', () => {
		render( <SeoForm { ...props } /> );
		expect( screen.queryByRole( 'status', { name: 'Notice' } ) ).not.toBeInTheDocument();
	} );

	test( 'should not render Jetpack unsupported notice when is not jetpack site or supports seo', () => {
		render( <SeoForm { ...props } /> );
		expect( screen.queryByRole( 'status', { name: 'Notice' } ) ).not.toBeInTheDocument();
	} );

	test( 'should render optimize SEO nudge when has no SEO features', () => {
		render(
			<SeoForm
				{ ...props }
				hasSeoPreviewFeature={ false }
				hasAdvancedSEOFeature={ false }
				selectedSite={ { plan: { product_slug: 'free' } } }
			/>
		);
		expect( screen.queryByTestId( 'UpsellNudge' ) ).toBeVisible();
		expect( UpsellNudge ).toHaveBeenCalledWith(
			expect.objectContaining( { event: 'calypso_seo_settings_upgrade_nudge' } ),
			expect.anything()
		);
	} );

	test( 'should not render Jetpack unsupported notice when has any SEO features', () => {
		const { rerender } = render( <SeoForm { ...props } hasSeoPreviewFeature /> );
		expect( screen.queryByTestId( 'UpsellNudge' ) ).not.toBeInTheDocument();

		rerender( <SeoForm { ...props } hasSeoPreviewFeature={ false } hasAdvancedSEOFeature /> );
		expect( screen.queryByTestId( 'UpsellNudge' ) ).not.toBeInTheDocument();

		rerender( <SeoForm { ...props } hasSeoPreviewFeature hasAdvancedSEOFeature /> );
		expect( screen.queryByTestId( 'UpsellNudge' ) ).not.toBeInTheDocument();
	} );

	test( 'should not render Jetpack unsupported notice when has no site', () => {
		render(
			<SeoForm
				{ ...props }
				selectedSite={ { plan: null } }
				hasSeoPreviewFeature={ false }
				hasAdvancedSEOFeature={ false }
			/>
		);
		expect( screen.queryByTestId( 'UpsellNudge' ) ).not.toBeInTheDocument();
	} );

	test( 'should render SEO editor when has advanced seo and there is no conflicted SEO plugin', () => {
		render( <SeoForm { ...props } showAdvancedSeo /> );
		expect( screen.queryByTestId( 'MetaTitleEditor' ) ).toBeVisible();
	} );

	test( 'should not render SEO editor when doesnt have advanced seo or there is a conflicted SEO plugin', () => {
		const { rerender } = render( <SeoForm { ...props } showAdvancedSeo={ false } /> );
		expect( screen.queryByTestId( 'MetaTitleEditor' ) ).not.toBeInTheDocument();

		rerender( <SeoForm { ...props } showAdvanedSeo conflictedSeoPlugin={ { name: 'test' } } /> );
		expect( screen.queryByTestId( 'MetaTitleEditor' ) ).not.toBeInTheDocument();
	} );

	test( 'should render website meta editor when appropriate', () => {
		const editorName = /Front Page Meta Description/i;
		const { rerender } = render( <SeoForm { ...props } showAdvancedSeo /> );
		expect( screen.queryByRole( 'textbox', { name: editorName } ) ).toBeVisible();

		rerender( <SeoForm { ...props } showWebsiteMeta /> );
		expect( screen.queryByRole( 'textbox', { name: editorName } ) ).toBeVisible();
	} );

	test( 'should not render SEO editor when appropriate', () => {
		const editorName = /Front Page Meta Description/i;
		const { rerender } = render(
			<SeoForm { ...props } conflictedSeoPlugin={ { name: 'test' } } />
		);
		expect( screen.queryByRole( 'textbox', { name: editorName } ) ).not.toBeInTheDocument();

		rerender( <SeoForm { ...props } conflictedSeoPlugin={ { name: 'test' } } showAdvancedSeo /> );
		expect( screen.queryByRole( 'textbox', { name: editorName } ) ).not.toBeInTheDocument();

		rerender(
			<SeoForm
				{ ...props }
				conflictedSeoPlugin={ { name: 'test' } }
				siteIsJetpack
				showWebsiteMeta
			/>
		);
		expect( screen.queryByRole( 'textbox', { name: editorName } ) ).not.toBeInTheDocument();
	} );
} );

describe( 'UpsellNudge should get appropriate plan constant', () => {
	test.each( [ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ] )(
		`Business 1 year for (%s)`,
		( product_slug ) => {
			render(
				<SeoForm { ...props } siteIsJetpack={ false } selectedSite={ { plan: { product_slug } } } />
			);
			const nudge = screen.getByTestId( 'UpsellNudge' );
			expect( nudge ).toBeVisible();
			expect( UpsellNudge ).toHaveBeenCalledWith(
				expect.objectContaining( { plan: PLAN_BUSINESS } ),
				expect.anything()
			);
		}
	);

	test.each( [ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ] )(
		`Business 2 year for (%s)`,
		( product_slug ) => {
			render(
				<SeoForm { ...props } siteIsJetpack={ false } selectedSite={ { plan: { product_slug } } } />
			);
			expect( screen.getByTestId( 'UpsellNudge' ) ).toBeVisible();
			expect( UpsellNudge ).toHaveBeenCalledWith(
				expect.objectContaining( { plan: PLAN_BUSINESS_2_YEARS } ),
				expect.anything()
			);
		}
	);

	test.each( [ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ] )(
		`Jetpack Security Daily for (%s)`,
		( product_slug ) => {
			render( <SeoForm { ...props } siteIsJetpack selectedSite={ { plan: { product_slug } } } /> );
			expect( screen.getByTestId( 'UpsellNudge' ) ).toBeVisible();
			expect( UpsellNudge ).toHaveBeenCalledWith(
				expect.objectContaining( { href: expect.stringContaining( PLAN_JETPACK_SECURITY_DAILY ) } ),
				expect.anything()
			);
		}
	);
} );
