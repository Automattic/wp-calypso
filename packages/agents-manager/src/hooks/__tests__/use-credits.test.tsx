/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useCredits } from '../use-credits';

let mockIsProcessing = false;
jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		useAgentChat: () => ( { isProcessing: mockIsProcessing } ),
	} ),
	{ virtual: true }
);

jest.mock( '@wordpress/element', () => jest.requireActual( 'react' ) );
jest.mock( 'i18n-calypso', () => ( { getBrowserSafeLocale: () => 'en' } ) );
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

function renderCredits( enabled = true ) {
	return renderHook(
		( { isProcessing }: { isProcessing: boolean } ) => {
			mockIsProcessing = isProcessing;
			return useCredits( {
				enabled,
				agentConfig: { agentId: 'mock', agentUrl: '', sessionId: '' },
				siteKey: 'no-site',
				isOpen: true,
			} );
		},
		{
			initialProps: { isProcessing: false },
		}
	);
}

// A request runs and finishes: the falling edge of `isProcessing` is the spend.
function completeRequest( rerender: ( props: { isProcessing: boolean } ) => void ) {
	act( () => rerender( { isProcessing: true } ) );
	act( () => rerender( { isProcessing: false } ) );
}

describe( 'useCredits', () => {
	it( 'yields nothing without a seed or when disabled', () => {
		seed( '' );
		const { result } = renderCredits();
		expect( result.current.trailingActions ).toBeUndefined();
		expect( result.current.notice ).toBeUndefined();
		expect( result.current.beforeSubmit() ).toBe( true );

		seed( '?am_credits=55&am_plan=free' );
		const disabled = renderCredits( false );
		expect( disabled.result.current.trailingActions ).toBeUndefined();
	} );

	it( 'spends when a request finishes, not on the submit attempt', () => {
		seed( '?am_credits=25&am_plan=free' );
		const { result, rerender } = renderCredits();
		expect( result.current.trailingActions ).toBeDefined();
		expect( result.current.notice ).toBeUndefined();

		act( () => {
			expect( result.current.beforeSubmit() ).toBe( true );
		} );
		expect( result.current.notice ).toBeUndefined();

		completeRequest( rerender );
		expect( result.current.notice?.message ).toBe( '20% of free credits left.' );
		expect( result.current.notice?.dismissible ).toBe( true );

		act( () => {
			result.current.notice?.onDismiss?.();
		} );
		expect( result.current.notice ).toBeUndefined();
	} );

	it( 'opens the upsell once when a reply drains the free balance to zero', () => {
		seed( '?am_credits=5&am_plan=free' );
		const { result, rerender } = renderCredits();
		const meter = () =>
			result.current.trailingActions as React.ReactElement< {
				isOpen: boolean;
				onToggle: ( open: boolean ) => void;
			} >;
		expect( meter().props.isOpen ).toBe( false );

		completeRequest( rerender );
		expect( result.current.notice?.message ).toBe( 'You’re out of free credits.' );
		expect( meter().props.isOpen ).toBe( true );

		act( () => meter().props.onToggle( false ) );
		completeRequest( rerender );
		expect( meter().props.isOpen ).toBe( false );
	} );

	it( 'does not open the upsell on its own when the chat mounts already exhausted', () => {
		seed( '?am_credits=0&am_plan=free' );
		const { result } = renderCredits();
		const meter = result.current.trailingActions as React.ReactElement< { isOpen: boolean } >;
		expect( meter.props.isOpen ).toBe( false );
	} );

	it( 'blocks submits with a persistent notice once free credits run out', () => {
		seed( '?am_credits=0&am_plan=free' );
		const { result } = renderCredits();
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
		const { result } = renderCredits();
		expect( result.current.trailingActions ).toBeDefined();
		expect( result.current.notice ).toBeUndefined();
		expect( result.current.beforeSubmit() ).toBe( true );
	} );

	it( 'blocks submits at zero on paid plans too, still without a notice', () => {
		seed( '?am_credits=0&am_plan=paid' );
		const { result } = renderCredits();
		expect( result.current.notice ).toBeUndefined();
		let allowed: boolean | undefined;
		act( () => {
			allowed = result.current.beforeSubmit();
		} );
		expect( allowed ).toBe( false );
	} );

	it( 'opens the popover on its own when a reply drains a paid balance to zero', () => {
		seed( '?am_credits=5&am_plan=paid' );
		const { result, rerender } = renderCredits();
		const meter = () => result.current.trailingActions as React.ReactElement< { isOpen: boolean } >;
		expect( meter().props.isOpen ).toBe( false );

		completeRequest( rerender );
		expect( result.current.notice ).toBeUndefined();
		expect( meter().props.isOpen ).toBe( true );
	} );

	it( 'drains the mocked paid pools plan-first, consistently with the aggregate', () => {
		const pools = ( search: string ) => {
			seed( search );
			const { result } = renderCredits();
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
