/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe( 'PricingGrid secondary action', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( getSiteAdminUrl as jest.Mock ).mockReturnValue( ADMIN_URL );
	} );

	it( 'sends a connected site to My Jetpack to redeem a license key', () => {
		render( <PricingGrid /> );

		expect( screen.getByRole( 'link', { name: 'Use license key' } ) ).toHaveAttribute(
			'href',
			`${ ADMIN_URL }admin.php?page=my-jetpack#/add-license`
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
} );
