/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useContext, useEffect } from 'react';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import DashboardHiddenContext from '../dashboard-hidden-context';
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
	const isHidden = useContext( DashboardHiddenContext );
	useEffect( () => mounts(), [] );
	return <div>{ isHidden ? 'hidden dashboard' : 'dashboard' }</div>;
};

const decide = ( {
	isLoading = false,
	isLoadingVisibility = false,
	isEligible = false,
	isVisible = false,
} ) => {
	( useIsPricingGridEligible as jest.Mock ).mockReturnValue( {
		isApplicable: true,
		isEligible,
		isLoading,
	} );
	( useNoticeVisibilityQuery as jest.Mock ).mockReturnValue( {
		data: isVisible,
		isLoading: isLoadingVisibility,
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

	it.each( [ { isLoading: true }, { isLoadingVisibility: true } ] )(
		'mounts the dashboard hidden while deciding (%o), then reveals it without remounting',
		( deciding ) => {
			decide( deciding );
			const { rerender } = renderGate();

			expect( screen.getByText( 'hidden dashboard' ).parentElement ).toHaveAttribute( 'inert' );

			decide( { isEligible: false } );
			rerender(
				<PricingGridGate>
					<Dashboard />
				</PricingGridGate>
			);

			expect( screen.getByText( 'dashboard' ).parentElement ).not.toHaveAttribute( 'inert' );
			expect( mounts ).toHaveBeenCalledTimes( 1 );
		}
	);

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
