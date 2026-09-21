/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useCredits } from '../use-credits';

jest.mock( '@wordpress/element', () => jest.requireActual( 'react' ) );
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	sprintf: ( format: string, ...args: unknown[] ) => {
		let index = 0;
		return format
			.replace( /%(\d+\$)?[sd]/g, () => String( args[ index++ ] ) )
			.replace( /%%/g, '%' );
	},
} ) );
jest.mock( '../../components/credits-meter', () => () => null );

// The seed is read when the hook mounts, so each case sets the URL first.
function seed( search: string ) {
	window.history.replaceState( {}, '', `/${ search }` );
}

describe( 'useCredits', () => {
	it( 'yields nothing without a seed or when disabled', () => {
		seed( '' );
		const { result } = renderHook( () => useCredits( { enabled: true } ) );
		expect( result.current.trailingActions ).toBeUndefined();
		expect( result.current.notice ).toBeUndefined();
		expect( result.current.beforeSubmit() ).toBe( true );

		seed( '?am_credits=55&am_plan=free' );
		const disabled = renderHook( () => useCredits( { enabled: false } ) );
		expect( disabled.result.current.trailingActions ).toBeUndefined();
	} );

	it( 'spends on each submit and surfaces the low notice once', () => {
		seed( '?am_credits=25&am_plan=free' );
		const { result } = renderHook( () => useCredits( { enabled: true } ) );
		expect( result.current.trailingActions ).toBeDefined();
		expect( result.current.notice ).toBeUndefined();

		act( () => {
			expect( result.current.beforeSubmit() ).toBe( true );
		} );
		expect( result.current.notice?.message ).toBe( '20% of free credits left.' );
		expect( result.current.notice?.dismissible ).toBe( true );

		act( () => {
			result.current.notice?.onDismiss?.();
		} );
		expect( result.current.notice ).toBeUndefined();
	} );

	it( 'blocks submits with a persistent notice once free credits run out', () => {
		seed( '?am_credits=0&am_plan=free' );
		const { result } = renderHook( () => useCredits( { enabled: true } ) );
		expect( result.current.notice?.message ).toBe( 'You’re out of free credits.' );
		expect( result.current.notice?.dismissible ).toBe( false );
		let allowed: boolean | undefined;
		act( () => {
			allowed = result.current.beforeSubmit();
		} );
		expect( allowed ).toBe( false );
	} );

	it( 'never shows a notice on paid plans', () => {
		seed( '?am_credits=5&am_plan=paid' );
		const { result } = renderHook( () => useCredits( { enabled: true } ) );
		expect( result.current.trailingActions ).toBeDefined();
		expect( result.current.notice ).toBeUndefined();
		expect( result.current.beforeSubmit() ).toBe( true );
	} );

	it( 'blocks submits at zero on paid plans too, still without a notice', () => {
		seed( '?am_credits=0&am_plan=paid' );
		const { result } = renderHook( () => useCredits( { enabled: true } ) );
		expect( result.current.notice ).toBeUndefined();
		let allowed: boolean | undefined;
		act( () => {
			allowed = result.current.beforeSubmit();
		} );
		expect( allowed ).toBe( false );
	} );

	it( 'drains the mocked paid pools plan-first, consistently with the aggregate', () => {
		const pools = ( search: string ) => {
			seed( search );
			const { result } = renderHook( () => useCredits( { enabled: true } ) );
			const meter = result.current.trailingActions as React.ReactElement< {
				status: { pools: Array< { id: string; remaining?: number; percent: number } > };
			} >;
			return Object.fromEntries( meter.props.status.pools.map( ( pool ) => [ pool.id, pool ] ) );
		};

		const full = pools( '?am_credits=100&am_plan=paid' );
		expect( full.plan.remaining ).toBe( 15000 );
		expect( full.topups.remaining ).toBe( 1000 );

		const half = pools( '?am_credits=50&am_plan=paid' );
		expect( half.plan.remaining ).toBe( 7000 );
		expect( half.topups.remaining ).toBe( 1000 );

		const low = pools( '?am_credits=5&am_plan=paid' );
		expect( low.plan.remaining ).toBe( 0 );
		expect( low.topups.remaining ).toBe( 800 );

		const out = pools( '?am_credits=0&am_plan=paid' );
		expect( out.plan.percent ).toBe( 0 );
		expect( out.topups.percent ).toBe( 0 );
	} );
} );
