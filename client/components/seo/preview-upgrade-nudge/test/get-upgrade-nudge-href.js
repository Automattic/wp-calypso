/**
 * @vitest-environment jsdom
 */
import { FEATURE_SEO_PREVIEW_TOOLS, PLAN_BUSINESS } from '@automattic/calypso-products';
import { vi } from 'vitest';
import { getUpgradeNudgeHref } from '../index';

vi.mock( 'calypso/components/data/query-products-list', () => ( { default: () => null } ) );
vi.mock( 'calypso/blocks/upsell-nudge', () => ( { default: () => null } ) );

describe( 'getUpgradeNudgeHref', () => {
	test( 'builds an absolute wordpress.com /plans URL in wp-admin (Odyssey)', () => {
		expect(
			getUpgradeNudgeHref( { isOdyssey: true, siteSlug: 'example.com', plan: PLAN_BUSINESS } )
		).toBe(
			`https://wordpress.com/plans/example.com?feature=${ FEATURE_SEO_PREVIEW_TOOLS }&plan=${ PLAN_BUSINESS }`
		);
	} );

	test( 'returns undefined outside wp-admin so UpsellNudge keeps its default relative link', () => {
		expect(
			getUpgradeNudgeHref( { isOdyssey: false, siteSlug: 'example.com', plan: PLAN_BUSINESS } )
		).toBeUndefined();
	} );

	test( 'returns undefined without a site slug', () => {
		expect(
			getUpgradeNudgeHref( { isOdyssey: true, siteSlug: null, plan: PLAN_BUSINESS } )
		).toBeUndefined();
	} );
} );
