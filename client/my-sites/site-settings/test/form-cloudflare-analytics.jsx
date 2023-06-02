/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => 'PageViewTracker' );
jest.mock( 'calypso/blocks/upsell-nudge', () => () => <div data-testid="UpsellNudge" /> );
jest.mock( 'calypso/components/notice', () => () => 'Notice' );
jest.mock( 'calypso/components/notice/notice-action', () => () => 'NoticeAction' );

import { PLAN_FREE } from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
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
	beforeAll( () => {
		window.matchMedia = jest.fn().mockImplementation( ( query ) => {
			return {
				matches: true,
				media: query,
				onchange: null,
				addListener: jest.fn(),
				removeListener: jest.fn(),
			};
		} );
	} );

	test( 'Cloudflare form should not show upgrade nudge if disabled', () => {
		render( <CloudflareAnalyticsSettings { ...props } showUpgradeNudge={ false } /> );
		expect( screen.queryByTestId( 'UpsellNudge' ) ).not.toBeInTheDocument();
	} );

	test( 'Cloudflare form should show upgrade nudge if enabled', () => {
		render( <CloudflareAnalyticsSettings { ...props } showUpgradeNudge /> );
		expect( screen.queryByTestId( 'UpsellNudge' ) ).toBeVisible();
	} );
} );
