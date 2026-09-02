/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { navigate } from 'calypso/lib/navigate';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { onClickInstallPlugin } from '../CTA-button';

// The module is a callable config function carrying isEnabled; keep it callable.
jest.mock( '@automattic/calypso-config', () => {
	const actual = jest.requireActual( '@automattic/calypso-config' );
	const config = ( key ) => actual( key );
	config.isEnabled = jest.fn();
	return config;
} );
jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( 'calypso/lib/navigate', () => ( { navigate: jest.fn() } ) );

const selectedSite = { slug: 'example.wordpress.com' };
const paidPlugin = {
	slug: 'sensei-pro',
	tags: {},
	variations: { monthly: { product_slug: 'sensei_pro_monthly' } },
};
const freePlugin = { slug: 'givewp', tags: {} };

const clickUpgradeAndActivate = ( plugin, isMarketplaceProduct = false ) =>
	onClickInstallPlugin( {
		dispatch: jest.fn(),
		selectedSite,
		plugin,
		upgradeAndInstall: true,
		isMarketplaceProduct,
		billingPeriod: IntervalLength.MONTHLY,
		productsList: {},
	} );

const upgradeFlowArgs = () =>
	Object.fromEntries(
		new URL( navigate.mock.calls[ 0 ][ 0 ], 'https://example.com' ).searchParams
	);

describe( 'onClickInstallPlugin', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.history.replaceState( {}, '', '/plugins/sensei-pro/example.wordpress.com' );
	} );

	describe( 'with the plan upgrade flow', () => {
		beforeEach( () => isEnabled.mockReturnValue( true ) );

		it( 'takes a paid plugin to the flow, leaving the destination to checkout', () => {
			clickUpgradeAndActivate( paidPlugin, true );

			expect( navigate ).toHaveBeenCalledWith(
				expect.stringContaining( '/setup/plan-upgrade?' ),
				false,
				true
			);
			expect( upgradeFlowArgs() ).toEqual( {
				siteSlug: 'example.wordpress.com',
				products: 'sensei_pro_monthly',
				intervalType: 'monthly',
				cancel_to: '/plugins/sensei-pro/example.wordpress.com',
			} );
			expect( page ).not.toHaveBeenCalled();
		} );

		it( 'sends a free plugin back to an installation that can run without the queued state', () => {
			clickUpgradeAndActivate( freePlugin );

			expect( upgradeFlowArgs() ).toMatchObject( {
				intervalType: 'yearly',
				redirect_to: '/marketplace/plugin/givewp/install/example.wordpress.com?directInstall=1',
			} );
			expect( upgradeFlowArgs() ).not.toHaveProperty( 'products' );
		} );
	} );

	describe( 'with the flag off', () => {
		beforeEach( () => isEnabled.mockReturnValue( false ) );

		it( 'takes a paid plugin to the site plans page', () => {
			clickUpgradeAndActivate( paidPlugin, true );

			expect( page ).toHaveBeenCalledWith(
				expect.stringContaining(
					'/plans/example.wordpress.com?plan=personal-bundle&plugin=sensei_pro_monthly'
				)
			);
			expect( navigate ).not.toHaveBeenCalled();
		} );

		it( 'takes a free plugin to the site plans page', () => {
			clickUpgradeAndActivate( freePlugin );

			expect( page ).toHaveBeenCalledWith(
				expect.stringContaining( '/plans/example.wordpress.com?plan=personal-bundle&redirect_to=' )
			);
			expect( navigate ).not.toHaveBeenCalled();
		} );
	} );
} );
