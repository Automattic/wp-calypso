/**
 * @jest-environment jsdom
 */
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => 'PageViewTracker' );
jest.mock( 'calypso/blocks/upsell-nudge', () =>
	jest.fn( () => <div data-testid="UpsellNudge" /> )
);
jest.mock( 'calypso/components/notice', () => () => 'Notice' );
jest.mock( 'calypso/components/notice/notice-action', () => () => 'NoticeAction' );
jest.mock( 'calypso/components/data/query-jetpack-modules', () => () => 'QueryJetpackModules' );
jest.mock(
	'calypso/my-sites/site-settings/jetpack-module-toggle',
	() => () => 'JetpackModuleToggle'
);

import {
	PLAN_FREE,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
} from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { GoogleAnalyticsForm } from '../analytics/form-google-analytics';
import GoogleAnalyticsJetpackForm from '../analytics/form-google-analytics-jetpack';
import GoogleAnalyticsSimpleForm from '../analytics/form-google-analytics-simple';

const props = {
	site: {
		plan: PLAN_FREE,
	},
	selectedSite: {},
	translate: ( x ) => x,
	onChangeField: ( x ) => x,
	eventTracker: ( x ) => x,
	uniqueEventTracker: ( x ) => x,
	fields: {},
	setDisplayForm: () => {},
};

const store = createStore( ( state ) => state );

describe( 'GoogleAnalyticsForm basic tests', () => {
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

	test( 'base form should return null when ga module not available in a jetpack site', () => {
		const gaFormProps = {
			...props,
			site: {
				...props.site,
				slug: 'test-site',
			},
			siteIsJetpack: true,
			isAtomic: true,
			isGoogleAnalyticsEligible: true,
			isJetpackModuleAvailable: false,
		};
		render( <GoogleAnalyticsForm { ...gaFormProps } /> );
		expect( screen.queryByRole( 'form', { name: /analytics/i } ) ).toBeNull();
	} );
	test( 'simple form should not blow up and have proper CSS class', () => {
		render( <GoogleAnalyticsSimpleForm { ...props } /> );
		expect( screen.queryByRole( 'form', { name: /analytics/i } ) ).toBeVisible();
	} );
	test( 'jetpack form should not blow up and have proper CSS class', () => {
		render(
			<Provider store={ store }>
				<GoogleAnalyticsJetpackForm { ...props } />
			</Provider>
		);
		expect( screen.queryByRole( 'form', { name: /analytics/i } ) ).toBeVisible();
	} );
	test( 'simple form should not show upgrade nudge if disabled', () => {
		render( <GoogleAnalyticsSimpleForm { ...props } showUpgradeNudge={ false } /> );
		expect( screen.queryByTestId( 'UpsellNudge' ) ).not.toBeInTheDocument();
	} );
	test( 'jetpack form should not show upgrade nudge if disabled', () => {
		render(
			<Provider store={ store }>
				<GoogleAnalyticsJetpackForm { ...props } showUpgradeNudge={ false } />
			</Provider>
		);
		expect( screen.queryByTestId( 'UpsellNudge' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'UpsellNudge should get appropriate plan constant for both forms', () => {
	const myProps = {
		...props,
		showUpgradeNudge: true,
	};

	test.each( [ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL ] )(
		`Business 1 year for (%s)`,
		( product_slug ) => {
			render( <GoogleAnalyticsSimpleForm { ...myProps } site={ { plan: { product_slug } } } /> );
			const nudge = screen.queryByTestId( 'UpsellNudge' );
			expect( nudge ).toBeVisible();
			expect( UpsellNudge ).toHaveBeenCalledWith(
				expect.objectContaining( { plan: PLAN_PREMIUM } ),
				expect.anything()
			);
		}
	);

	test.each( [ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS ] )(
		`Business 2 year for (%s)`,
		( product_slug ) => {
			render( <GoogleAnalyticsSimpleForm { ...myProps } site={ { plan: { product_slug } } } /> );
			expect( screen.queryByTestId( 'UpsellNudge' ) ).toBeVisible();
			expect( UpsellNudge ).toHaveBeenCalledWith(
				expect.objectContaining( { plan: PLAN_PREMIUM_2_YEARS } ),
				expect.anything()
			);
		}
	);

	test.each( [ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ] )(
		`Jetpack Security for (%s)`,
		( product_slug ) => {
			render(
				<Provider store={ store }>
					<GoogleAnalyticsJetpackForm { ...myProps } site={ { plan: { product_slug } } } />
				</Provider>
			);
			expect( screen.queryByTestId( 'UpsellNudge' ) ).toBeVisible();
			expect( UpsellNudge ).toHaveBeenCalledWith(
				expect.objectContaining( { plan: PLAN_JETPACK_SECURITY_DAILY } ),
				expect.anything()
			);
		}
	);
} );
