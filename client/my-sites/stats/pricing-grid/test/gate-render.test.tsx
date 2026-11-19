/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import PricingGridGate from '../gate';
import useIsPricingGridEligible from '../hooks/use-eligibility';

jest.mock( 'calypso/state', () => ( { useSelector: () => 1 } ) );
jest.mock( 'calypso/components/data/query-site-purchases', () => () => null );
jest.mock( 'calypso/components/data/query-products-list', () => () => null );
jest.mock( 'calypso/components/async-load', () => () => <div>pricing grid</div> );
jest.mock( 'calypso/my-sites/stats/hooks/use-notice-visibility-query' );
jest.mock( '../hooks/use-eligibility' );
jest.mock( '../hooks/use-dismiss-pricing-grid', () => ( {
	__esModule: true,
	default: () => jest.fn(),
	PLAN_CHOSEN_QUERY_ARG: 'stats_plan_chosen',
} ) );

const mounts = jest.fn();
const Dashboard = () => {
	useEffect( () => mounts(), [] );
	return <div>dashboard</div>;
};

const decide = ( { isLoading = false, isEligible = false, isVisible = false } ) => {
	( useIsPricingGridEligible as jest.Mock ).mockReturnValue( {
		isApplicable: true,
		isEligible,
		isLoading,
	} );
	( useNoticeVisibilityQuery as jest.Mock ).mockReturnValue( {
		data: isVisible,
		isLoading: false,
	} );
};

const renderGate = () =>
	render(
		<PricingGridGate>
			<Dashboard />
		</PricingGridGate>
	);

describe( 'PricingGridGate while purchases load', () => {
	beforeEach( () => mounts.mockClear() );

	it( 'mounts the dashboard hidden, then reveals it without remounting', () => {
		decide( { isLoading: true } );
		const { rerender } = renderGate();

		expect( screen.getByText( 'dashboard' ).parentElement ).toHaveAttribute( 'inert' );

		decide( { isEligible: false } );
		rerender(
			<PricingGridGate>
				<Dashboard />
			</PricingGridGate>
		);

		expect( screen.getByText( 'dashboard' ).parentElement ).not.toHaveAttribute( 'inert' );
		expect( mounts ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'drops the hidden dashboard when the site turns out to need the grid', () => {
		decide( { isLoading: true } );
		const { rerender } = renderGate();

		decide( { isEligible: true, isVisible: true } );
		rerender(
			<PricingGridGate>
				<Dashboard />
			</PricingGridGate>
		);

		expect( screen.getByText( 'pricing grid' ) ).toBeVisible();
		expect( screen.queryByText( 'dashboard' ) ).not.toBeInTheDocument();
	} );
} );
