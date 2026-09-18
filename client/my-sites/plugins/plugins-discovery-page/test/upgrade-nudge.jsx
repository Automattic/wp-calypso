/** @jest-environment jsdom */

jest.mock( 'calypso/blocks/upsell-nudge', () => ( { plan, title, feature } ) => (
	<div data-testid="upsell-nudge" data-plan={ plan } data-feature={ feature }>
		{ title }
	</div>
) );

import {
	FEATURE_INSTALL_PLUGINS,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_BUSINESS,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
} from '@automattic/calypso-products';
import { merge } from '@automattic/js-utils';
import { screen } from '@testing-library/react';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UpgradeNudge from '../upgrade-nudge';

const siteId = 1;

// State where paid plugins are on a cheaper plan than free plugin installs,
// so paidPluginsOnLowerPlan = true and the general upsell nudge renders.
const baseState = {
	ui: { selectedSiteId: siteId },
	sites: {
		items: {
			[ siteId ]: {
				ID: siteId,
				slug: 'example.wordpress.com',
				plan: { product_slug: PLAN_FREE },
			},
		},
		features: {
			[ siteId ]: {
				data: {
					active: [],
					available: {
						[ FEATURE_INSTALL_PLUGINS ]: [ PLAN_PERSONAL ],
						[ WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS ]: [ PLAN_FREE ],
					},
				},
			},
		},
	},
	currentUser: {
		capabilities: { [ siteId ]: { manage_options: true } },
	},
};

const render = ( props = {}, stateOverrides = {} ) =>
	renderWithProvider( <UpgradeNudge siteSlug="example.wordpress.com" { ...props } />, {
		initialState: merge( {}, baseState, stateOverrides ),
		reducers: { ui },
	} );

describe( 'UpgradeNudge', () => {
	test( 'should use the cheapest plan from plansForInstallPlugins', () => {
		render();
		const nudge = screen.getByTestId( 'upsell-nudge' );
		expect( nudge ).toBeVisible();
		expect( nudge ).toHaveAttribute( 'data-plan', PLAN_PERSONAL );
	} );

	test( 'should show the plan name in the title', () => {
		render();
		const nudge = screen.getByTestId( 'upsell-nudge' );
		expect( nudge.textContent ).toContain( 'Personal' );
	} );

	test( 'should use the correct plan when business is the cheapest', () => {
		render(
			{},
			{
				sites: {
					features: {
						[ siteId ]: {
							data: {
								active: [],
								available: {
									[ FEATURE_INSTALL_PLUGINS ]: [ PLAN_BUSINESS ],
									[ WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS ]: [ PLAN_FREE ],
								},
							},
						},
					},
				},
			}
		);
		const nudge = screen.getByTestId( 'upsell-nudge' );
		expect( nudge ).toHaveAttribute( 'data-plan', PLAN_BUSINESS );
	} );

	test( 'should pass FEATURE_INSTALL_PLUGINS as the feature', () => {
		render();
		const nudge = screen.getByTestId( 'upsell-nudge' );
		expect( nudge ).toHaveAttribute( 'data-feature', FEATURE_INSTALL_PLUGINS );
	} );

	test( 'should not render when site already has FEATURE_INSTALL_PLUGINS', () => {
		render(
			{},
			{
				sites: {
					features: {
						[ siteId ]: {
							data: {
								active: [ FEATURE_INSTALL_PLUGINS ],
								available: {
									[ FEATURE_INSTALL_PLUGINS ]: [ PLAN_PERSONAL ],
									[ WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS ]: [ PLAN_FREE ],
								},
							},
						},
					},
				},
			}
		);
		expect( screen.queryByTestId( 'upsell-nudge' ) ).not.toBeInTheDocument();
	} );

	test( 'should not render for jetpack non-atomic sites', () => {
		render(
			{},
			{
				sites: {
					items: {
						[ siteId ]: {
							jetpack: true,
							options: { is_automated_transfer: false },
						},
					},
				},
			}
		);
		expect( screen.queryByTestId( 'upsell-nudge' ) ).not.toBeInTheDocument();
	} );

	test( 'should not render when no site is selected', () => {
		render(
			{},
			{
				ui: { selectedSiteId: null },
			}
		);
		expect( screen.queryByTestId( 'upsell-nudge' ) ).not.toBeInTheDocument();
	} );
} );
