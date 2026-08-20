/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { registerSite } from '../../lib/jetpack-connection';
import PreConnection from '../index';

jest.mock( '../../lib/jetpack-connection', () => ( {
	...jest.requireActual( '../../lib/jetpack-connection' ),
	registerSite: jest.fn(),
	isOfflineMode: () => false,
	getSiteSuffix: () => 'example.com',
} ) );
jest.mock( '../../lib/selectors/get-wp-admin-url', () => () => 'https://example.com/wp-admin/' );
jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn( ( selector ) => selector( {} ) ),
} ) );
jest.mock( 'calypso/state/products-list/selectors', () => ( {
	getProductBySlug: () => null,
} ) );
jest.mock( 'calypso/components/data/query-products-list', () => () => null );
jest.mock( 'calypso/my-sites/stats/stats-page-view-tracker', () => () => null );
jest.mock( 'calypso/my-sites/stats/utils', () => ( {
	trackStatsAnalyticsEvent: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/stats/components/stats-main', () => ( {
	__esModule: true,
	default: ( { children } ) => <div>{ children }</div>,
} ) );
// The paid step's commercial pitch, which reaches wpcom-checkout and its untransformed ESM deps.
jest.mock( 'calypso/my-sites/stats/stats-purchase/stats-purchase-shared', () => ( {
	StatsSingleItemPagePurchaseFrame: ( { children } ) => <div>{ children }</div>,
} ) );
jest.mock( 'calypso/my-sites/stats/stats-purchase/stats-purchase-single-item', () => ( {
	StatsCommercialPurchase: () => null,
} ) );
// Stands in for the plan choice, exposing each CTA the screen wires up.
jest.mock( 'calypso/my-sites/stats/pricing-grid/pricing-grid', () => ( {
	__esModule: true,
	default: ( { onSelectFree, onSelectPaid, onSelectExistingPlan } ) => (
		<>
			<button onClick={ onSelectFree }>free</button>
			<button onClick={ onSelectPaid }>paid</button>
			<button onClick={ onSelectExistingPlan }>existing</button>
		</>
	),
} ) );

const AUTHORIZE_URL = 'https://wordpress.com/jetpack/connect/authorize';

const clickCta = async ( name ) => {
	render( <PreConnection /> );
	await userEvent.click( screen.getByRole( 'button', { name } ) );
	return registerSite.mock.calls[ 0 ]?.[ 0 ];
};

describe( 'PreConnection', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		registerSite.mockResolvedValue( { authorizeUrl: AUTHORIZE_URL, blogId: 123 } );
		// Every path here ends in a navigation, which jsdom can only warn about.
		Object.defineProperty( window, 'location', { value: { href: '' }, writable: true } );
	} );

	it( 'names the free plan for the dashboard when the visitor picks it here', async () => {
		expect( await clickCta( 'free' ) ).toBe(
			'admin.php?page=stats&stats_plan_chosen=free&force_refresh=1'
		);
	} );

	it( 'names the paid plan before checking out, so an abandoned checkout is not asked twice', async () => {
		expect( await clickCta( 'paid' ) ).toBe(
			'admin.php?page=stats&stats_plan_chosen=paid&force_refresh=1'
		);
	} );

	it( 'leaves the plan question open for a visitor who says they already have one', async () => {
		// No marker: the gate has to ask again, against the purchases the linked account holds.
		expect( await clickCta( 'existing' ) ).toBe( 'admin.php?page=stats&force_refresh=1' );
	} );
} );
