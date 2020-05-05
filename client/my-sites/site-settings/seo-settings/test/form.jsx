/** @jest-environment jsdom */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'blocks/upsell-nudge', () => 'UpsellNudge' );
jest.mock( 'components/notice', () => 'Notice' );
jest.mock( 'components/notice/notice-action', () => 'NoticeAction' );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import {
	PLAN_FREE,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { SeoForm } from '../form';

const props = {
	refreshSiteData: ( x ) => x,
	site: {
		plan: PLAN_FREE,
	},
	selectedSite: {},
	translate: ( x ) => x,
};

describe( 'SeoForm basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <SeoForm { ...props } /> );
		expect( comp.find( '.seo-settings__seo-form' ) ).toHaveLength( 1 );
	} );

	test( 'should render conflicted SEO notice when conflictedSeoPlugin is set', () => {
		const comp = shallow( <SeoForm { ...props } conflictedSeoPlugin={ { name: 'test' } } /> );
		expect( comp.find( 'Notice' ) ).toHaveLength( 1 );
		expect( comp.find( 'Notice' ).props().text ).toContain( 'Your SEO settings' );
	} );

	test( 'should not render conflicted SEO notice when conflictedSeoPlugin is not set', () => {
		const comp = shallow( <SeoForm { ...props } /> );
		expect( comp.find( 'Notice' ) ).toHaveLength( 0 );
	} );

	test( 'should not render Jetpack unsupported notice when is not jetpack site or supports seo', () => {
		const comp = shallow( <SeoForm { ...props } /> );
		expect( comp.find( 'Notice' ) ).toHaveLength( 0 );
	} );

	test( 'should render optimize SEO nudge when has no SEO features', () => {
		const comp = shallow(
			<SeoForm
				{ ...props }
				hasSeoPreviewFeature={ false }
				hasAdvancedSEOFeature={ false }
				selectedSite={ { plan: { product_slug: 'free' } } }
			/>
		);
		expect( comp.find( 'UpsellNudge' ) ).toHaveLength( 1 );
		expect( comp.find( 'UpsellNudge' ).props().event ).toContain(
			'calypso_seo_settings_upgrade_nudge'
		);
	} );

	test( 'should not render Jetpack unsupported notice when has any SEO features', () => {
		const comp = shallow( <SeoForm { ...props } hasSeoPreviewFeature={ true } /> );
		expect( comp.find( 'UpsellNudge' ) ).toHaveLength( 0 );

		comp.setProps( {
			...props,
			hasSeoPreviewFeature: false,
			hasAdvancedSEOFeature: true,
		} );
		expect( comp.find( 'UpsellNudge' ) ).toHaveLength( 0 );

		comp.setProps( {
			...props,
			hasSeoPreviewFeature: true,
			hasAdvancedSEOFeature: true,
		} );
		expect( comp.find( 'UpsellNudge' ) ).toHaveLength( 0 );
	} );

	test( 'should not render Jetpack unsupported notice when has no site', () => {
		const comp = shallow(
			<SeoForm
				{ ...props }
				selectedSite={ { plan: null } }
				hasSeoPreviewFeature={ false }
				hasAdvancedSEOFeature={ false }
			/>
		);
		expect( comp.find( 'UpsellNudge' ) ).toHaveLength( 0 );
	} );

	test( 'should render SEO editor when has advanced seo and there is no conflicted SEO plugin', () => {
		const comp = shallow( <SeoForm { ...props } showAdvancedSeo={ true } /> );
		expect( comp.find( '.seo-settings__page-title-header' ) ).toHaveLength( 1 );
	} );

	test( 'should not render SEO editor when doesnt have advanced seo or there is a conflicted SEO plugin', () => {
		let comp;

		comp = shallow( <SeoForm { ...props } hasAdvancedSEOFeature={ false } /> );
		expect( comp.find( '.seo-settings__page-title-header' ) ).toHaveLength( 0 );

		comp = shallow(
			<SeoForm
				{ ...props }
				hasAdvancedSEOFeature={ true }
				conflictedSeoPlugin={ { name: 'test' } }
			/>
		);
		expect( comp.find( '.seo-settings__page-title-header' ) ).toHaveLength( 0 );
	} );

	test( 'should render website meta editor when appropriate', () => {
		let comp;

		comp = shallow( <SeoForm { ...props } showAdvancedSeo={ true } /> );
		expect( comp.find( '[name="advanced_seo_front_page_description"]' ) ).toHaveLength( 1 );

		comp = shallow( <SeoForm { ...props } showWebsiteMeta={ true } /> );
		expect( comp.find( '[name="advanced_seo_front_page_description"]' ) ).toHaveLength( 1 );
	} );

	test( 'should not render SEO editor when appropriate', () => {
		let comp;

		comp = shallow( <SeoForm { ...props } conflictedSeoPlugin={ { name: 'test' } } /> );
		expect( comp.find( '[name="advanced_seo_front_page_description"]' ) ).toHaveLength( 0 );

		comp = shallow(
			<SeoForm { ...props } conflictedSeoPlugin={ { name: 'test' } } showAdvancedSeo={ true } />
		);
		expect( comp.find( '[name="advanced_seo_front_page_description"]' ) ).toHaveLength( 0 );

		comp = shallow(
			<SeoForm
				{ ...props }
				conflictedSeoPlugin={ { name: 'test' } }
				siteIsJetpack={ true }
				showWebsiteMeta={ true }
			/>
		);
		expect( comp.find( '[name="advanced_seo_front_page_description"]' ) ).toHaveLength( 0 );
	} );
} );

describe( 'UpsellNudge should get appropriate plan constant', () => {
	[ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( ( product_slug ) => {
		test( `Business 1 year for (${ product_slug })`, () => {
			const comp = shallow(
				<SeoForm { ...props } siteIsJetpack={ false } selectedSite={ { plan: { product_slug } } } />
			);
			expect( comp.find( 'UpsellNudge' ) ).toHaveLength( 1 );
			expect( comp.find( 'UpsellNudge' ).props().plan ).toBe( PLAN_BUSINESS );
		} );
	} );

	[ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ].forEach(
		( product_slug ) => {
			test( `Business 2 year for (${ product_slug })`, () => {
				const comp = shallow(
					<SeoForm
						{ ...props }
						siteIsJetpack={ false }
						selectedSite={ { plan: { product_slug } } }
					/>
				);
				expect( comp.find( 'UpsellNudge' ) ).toHaveLength( 1 );
				expect( comp.find( 'UpsellNudge' ).props().plan ).toBe( PLAN_BUSINESS_2_YEARS );
			} );
		}
	);

	[ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ].forEach(
		( product_slug ) => {
			test( `Jetpack Premium for (${ product_slug })`, () => {
				const comp = shallow(
					<SeoForm
						{ ...props }
						siteIsJetpack={ true }
						selectedSite={ { plan: { product_slug } } }
					/>
				);
				expect( comp.find( 'UpsellNudge' ) ).toHaveLength( 1 );
				expect( comp.find( 'UpsellNudge' ).props().plan ).toBe( PLAN_JETPACK_PREMIUM );
			} );
		}
	);
} );
