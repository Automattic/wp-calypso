/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'calypso/blocks/upsell-nudge', () => 'UpsellNudge' );
jest.mock( 'calypso/components/notice', () => 'Notice' );
jest.mock( 'calypso/components/notice/notice-action', () => 'NoticeAction' );

import { PLAN_FREE } from '@automattic/calypso-products';
import { shallow } from 'enzyme';
import { CloudflareAnalyticsSettings } from '../analytics/form-cloudflare-analytics';

const props = {
	site: {
		plan: PLAN_FREE,
	},
	translate: ( x ) => x,
	eventTracker: ( x ) => x,
	uniqueEventTracker: ( x ) => x,
	fields: {},
};

describe( 'CloudflareAnalyticsSettings basic tests', () => {
	test( 'Cloudflare form should not show upgrade nudge if disabled', () => {
		const comp = shallow( <CloudflareAnalyticsSettings { ...props } showUpgradeNudge={ false } /> );
		expect(
			comp.find( 'UpsellNudge[event="jetpack_cloudflare_analytics_settings"]' )
		).toHaveLength( 0 );
	} );

	test( 'Cloudflare form should show upgrade nudge if enabled', () => {
		const comp = shallow( <CloudflareAnalyticsSettings { ...props } showUpgradeNudge={ true } /> );
		expect(
			comp.find( 'UpsellNudge[event="jetpack_cloudflare_analytics_settings"]' )
		).toHaveLength( 1 );
	} );
} );
