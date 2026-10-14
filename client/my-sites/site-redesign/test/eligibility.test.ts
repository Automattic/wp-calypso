/** @jest-environment jsdom */
import { queryClient } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { renderHook, waitFor } from '@testing-library/react';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';
import { fetchRedesign, fetchRedesignEligibility } from '../api';
import { useRedesignAccess, useRedesignEligibility, useRedesignRouteAccess } from '../eligibility';

let mockSite = { ID: 1, slug: 'example.wordpress.com', plan: { product_slug: 'free_plan' } };
jest.mock( '@automattic/api-queries', () => ( {
	queryClient: new ( jest.requireActual( '@tanstack/react-query' ).QueryClient )( {
		defaultOptions: { queries: { retry: false } },
	} ),
} ) );
jest.mock( '@automattic/calypso-config', () => ( { isEnabled: jest.fn( () => true ) } ) );
jest.mock( 'react-redux', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( { getSelectedSite: () => mockSite } ) );
jest.mock( 'calypso/state/selectors/can-current-user', () => ( { canCurrentUser: () => true } ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	isJetpackSite: jest.fn( () => false ),
	isCurrentPlanPaid: jest.fn( () => false ),
} ) );
jest.mock( '../api', () => ( {
	fetchRedesign: jest.fn(),
	fetchRedesignEligibility: jest.fn(),
	startRedesign: jest.fn(),
} ) );
beforeEach( () => {
	queryClient.clear();
	jest.clearAllMocks();
	jest.mocked( isEnabled ).mockReturnValue( true );
	jest.mocked( isCurrentPlanPaid ).mockReturnValue( false );
	mockSite = { ID: 1, slug: 'example.wordpress.com', plan: { product_slug: 'free_plan' } };
} );

test( 'allows eligible free sites and treats WordPress.com Atomic as hosted', async () => {
	jest.mocked( fetchRedesignEligibility ).mockResolvedValue( {
		can_preview: true,
		can_apply: false,
		reason: 'upgrade_required',
		required_plan: 'personal',
	} );
	const { result } = renderHook( () => useRedesignAccess() );
	await waitFor( () => expect( result.current.site?.ID ).toBe( 1 ) );
	expect( isJetpackSite ).toHaveBeenCalledWith( {}, 1, { treatAtomicAsJetpackSite: false } );
} );

test( 'removes the old site offer while the next site eligibility is loading', async () => {
	jest
		.mocked( fetchRedesignEligibility )
		.mockResolvedValueOnce( {
			can_preview: true,
			can_apply: true,
			reason: null,
			required_plan: 'personal',
		} )
		.mockResolvedValueOnce( {
			can_preview: false,
			can_apply: false,
			reason: 'unsupported_site',
			required_plan: 'personal',
		} );
	const { result, rerender } = renderHook( () => useRedesignAccess() );
	await waitFor( () => expect( result.current.site?.ID ).toBe( 1 ) );
	mockSite = { ...mockSite, ID: 2 };
	rerender();
	expect( result.current.site ).toBeNull();
	await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
	expect( result.current.site ).toBeNull();
} );

test( 'makes no eligibility request with the default-off flag', () => {
	jest.mocked( isEnabled ).mockReturnValue( false );
	const { result } = renderHook( () => useRedesignAccess() );
	expect( result.current.site ).toBeNull();
	expect( fetchRedesignEligibility ).not.toHaveBeenCalled();
} );

const eligible = {
	can_preview: true,
	can_apply: false,
	reason: 'upgrade_required',
	required_plan: 'personal',
};

test( 'offers the card on a Free plan', async () => {
	jest.mocked( fetchRedesignEligibility ).mockResolvedValue( eligible );
	const { result } = renderHook( () => useRedesignEligibility() );
	await waitFor( () => expect( result.current?.ID ).toBe( 1 ) );
	expect( isCurrentPlanPaid ).toHaveBeenCalledWith( {}, 1 );
} );

test( 'hides the card on a paid plan while redesign access stays available', async () => {
	jest.mocked( isCurrentPlanPaid ).mockReturnValue( true );
	jest
		.mocked( fetchRedesignEligibility )
		.mockResolvedValue( { ...eligible, can_apply: true, reason: null } );
	const { result } = renderHook( () => ( {
		card: useRedesignEligibility(),
		access: useRedesignAccess(),
	} ) );
	await waitFor( () => expect( result.current.access.site?.ID ).toBe( 1 ) );
	expect( result.current.card ).toBeNull();
} );

test( 'hides the card while the site plan is unknown', async () => {
	jest.mocked( isCurrentPlanPaid ).mockReturnValue( null );
	jest.mocked( fetchRedesignEligibility ).mockResolvedValue( eligible );
	const { result } = renderHook( () => ( {
		card: useRedesignEligibility(),
		access: useRedesignAccess(),
	} ) );
	await waitFor( () => expect( result.current.access.site?.ID ).toBe( 1 ) );
	expect( result.current.card ).toBeNull();
} );

const RUN_ID = 'rd_' + '0'.repeat( 32 );
const resumable = {
	id: RUN_ID,
	site_id: 1,
	status: 'preview_ready',
	successor_id: null,
	generation: { status: 'succeeded' },
	eligibility: { can_preview: true, can_apply: true, reason: null, required_plan: 'personal' },
};
const checkoutReturn = `?redesign=${ RUN_ID }&resume=apply`;

describe( 'useRedesignRouteAccess', () => {
	beforeEach( () => {
		jest.mocked( fetchRedesignEligibility ).mockResolvedValue( eligible );
	} );

	test( 'opens the full redesign on a Free plan without checking any run', async () => {
		const { result } = renderHook( () => useRedesignRouteAccess( '' ) );
		await waitFor( () => expect( result.current.state ).toBe( 'allowed' ) );
		expect( result.current ).toMatchObject( { applyOnly: false } );
		expect( fetchRedesign ).not.toHaveBeenCalled();
	} );

	test.each( [
		[ 'no query', '' ],
		[ 'no resume flag', `?redesign=${ RUN_ID }` ],
		[ 'malformed id', '?redesign=rd_x&resume=apply' ],
	] )( 'sends a paid site back to Themes: %s', async ( _label, search ) => {
		jest.mocked( isCurrentPlanPaid ).mockReturnValue( true );
		const { result } = renderHook( () => useRedesignRouteAccess( search ) );
		await waitFor( () =>
			expect( result.current ).toEqual( { state: 'redirect', to: '/themes/example.wordpress.com' } )
		);
		expect( fetchRedesign ).not.toHaveBeenCalled();
	} );

	test( 'redirects a paid direct visit even when the eligibility check fails', async () => {
		jest.mocked( isCurrentPlanPaid ).mockReturnValue( true );
		jest.mocked( fetchRedesignEligibility ).mockRejectedValue( new Error( 'down' ) );
		const { result } = renderHook( () => useRedesignRouteAccess( '' ) );
		expect( result.current ).toEqual( { state: 'redirect', to: '/themes/example.wordpress.com' } );
		await waitFor( () => expect( fetchRedesignEligibility ).toHaveBeenCalled() );
		expect( result.current.state ).toBe( 'redirect' );
	} );

	test( 'sends an unknown plan back to Themes', async () => {
		jest.mocked( isCurrentPlanPaid ).mockReturnValue( null );
		const { result } = renderHook( () => useRedesignRouteAccess( checkoutReturn ) );
		await waitFor( () => expect( result.current.state ).toBe( 'redirect' ) );
		expect( fetchRedesign ).not.toHaveBeenCalled();
	} );

	test( 'lets a paid site return from checkout to use its generated design', async () => {
		jest.mocked( isCurrentPlanPaid ).mockReturnValue( true );
		jest.mocked( fetchRedesign ).mockResolvedValue( resumable as never );
		const { result } = renderHook( () => useRedesignRouteAccess( checkoutReturn ) );
		await waitFor( () => expect( result.current.state ).toBe( 'allowed' ) );
		expect( result.current ).toMatchObject( { applyOnly: true } );
		expect( fetchRedesign ).toHaveBeenCalledWith( 1, RUN_ID );
	} );

	test.each( [
		[ 'no generated design', { status: 'interview', generation: null } ],
		[ 'failed generation', { status: 'failed', generation: { status: 'failed' } } ],
		[ 'replaced run', { successor_id: 'rd_' + '1'.repeat( 32 ) } ],
		[ 'another site', { site_id: 2 } ],
		[ 'cannot apply', { eligibility: { ...resumable.eligibility, can_apply: false } } ],
	] )( 'sends a paid checkout return back to Themes: %s', async ( _label, change ) => {
		jest.mocked( isCurrentPlanPaid ).mockReturnValue( true );
		jest.mocked( fetchRedesign ).mockResolvedValue( { ...resumable, ...change } as never );
		const { result } = renderHook( () => useRedesignRouteAccess( checkoutReturn ) );
		await waitFor( () => expect( result.current.state ).toBe( 'redirect' ) );
	} );

	test( 'sends a paid checkout return for a run the server refuses back to Themes', async () => {
		jest.mocked( isCurrentPlanPaid ).mockReturnValue( true );
		jest.mocked( fetchRedesign ).mockRejectedValue( { error: 'site_redesign_not_found' } );
		const { result } = renderHook( () => useRedesignRouteAccess( checkoutReturn ) );
		await waitFor( () => expect( result.current.state ).toBe( 'redirect' ) );
	} );

	test( 'reports an ineligible site as denied, not redirected', async () => {
		jest.mocked( fetchRedesignEligibility ).mockResolvedValue( {
			...eligible,
			can_preview: false,
			reason: 'unsupported_site',
		} );
		const { result } = renderHook( () => useRedesignRouteAccess( '' ) );
		await waitFor( () => expect( result.current.state ).toBe( 'denied' ) );
	} );
} );
