/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { trackStatsAnalyticsEvent } from 'calypso/my-sites/stats/utils';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import PricingGrid from '../pricing-grid';

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn( ( selector ) => selector( {} ) ),
} ) );
jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/ui/selectors' );
jest.mock( 'calypso/state/products-list/selectors' );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/my-sites/stats/utils', () => ( {
	trackStatsAnalyticsEvent: jest.fn(),
} ) );
jest.mock( '../hooks/use-dismiss-pricing-grid', () => ( {
	__esModule: true,
	default: () => jest.fn(),
	PRICING_GRID_REFERRER: 'jetpack-stats-pricing-grid',
} ) );
// The page frame, stubbed down to the header slot the action under test renders into.
jest.mock( 'calypso/my-sites/stats/components/stats-main', () => ( {
	__esModule: true,
	default: ( {
		children,
		pageActions,
	}: {
		children: React.ReactNode;
		pageActions: React.ReactNode;
	} ) => (
		<div>
			<header>{ pageActions }</header>
			{ children }
		</div>
	),
} ) );

const ADMIN_URL = 'https://example.com/wp-admin/';
const LICENSE_ACTIVATION_URL = `${ ADMIN_URL }admin.php?page=my-jetpack#/add-license`;

const propsOfEvent = ( name: string ) =>
	( trackStatsAnalyticsEvent as jest.Mock ).mock.calls.find(
		( [ event ] ) => event === name
	)?.[ 1 ];

describe( 'PricingGrid secondary action', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( getSiteAdminUrl as jest.Mock ).mockReturnValue( ADMIN_URL );
	} );

	it( 'sends a connected site to My Jetpack to redeem a license key', () => {
		render( <PricingGrid /> );

		expect( screen.getByRole( 'link', { name: 'Use license key' } ) ).toHaveAttribute(
			'href',
			LICENSE_ACTIVATION_URL
		);
	} );

	it( 'offers nothing when the site has no wp-admin to redeem a key in', () => {
		( getSiteAdminUrl as jest.Mock ).mockReturnValue( null );

		render( <PricingGrid /> );

		expect( screen.queryByRole( 'link', { name: 'Use license key' } ) ).not.toBeInTheDocument();
	} );

	it( 'asks a host that can connect the site to do so, rather than for a key', async () => {
		const onSelectExistingPlan = jest.fn();

		render( <PricingGrid onSelectExistingPlan={ onSelectExistingPlan } /> );

		expect( screen.queryByRole( 'link', { name: 'Use license key' } ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'I already have a plan' } ) );

		expect( onSelectExistingPlan ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'labels both actions with what the host knows the site by', async () => {
		const eventProps = { site_suffix: 'example.com', is_pre_connection: 1 };

		render( <PricingGrid onSelectExistingPlan={ jest.fn() } eventProps={ eventProps } /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'I already have a plan' } ) );

		expect( propsOfEvent( 'stats_pricing_grid_existing_plan_cta_clicked' ) ).toMatchObject(
			eventProps
		);

		render( <PricingGrid eventProps={ { site_suffix: 'example.com' } } /> );
		await userEvent.click( screen.getByRole( 'link', { name: 'Use license key' } ) );

		expect( propsOfEvent( 'stats_pricing_grid_license_key_cta_clicked' ) ).toMatchObject( {
			site_suffix: 'example.com',
		} );
	} );

	it( 'holds the license key page back until the click has been recorded', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );

		render( <PricingGrid /> );
		await user.click( screen.getByRole( 'link', { name: 'Use license key' } ) );

		// Tracks has only queued the event at this point; leaving now would cancel it.
		expect( window.location.href ).toBe( '' );

		jest.runAllTimers();

		expect( window.location.href ).toBe( LICENSE_ACTIVATION_URL );
		jest.useRealTimers();
	} );
} );
