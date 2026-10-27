import { act, cleanup, renderHook } from '@testing-library/react';
import { useDemoCredits } from './useDemoCredits';
import type { TaskUpdate } from '@automattic/agenttic-client';

const update = (
	state: TaskUpdate[ 'status' ][ 'state' ],
	final = true,
	id = 'task'
): TaskUpdate => ( {
	id,
	status: { state },
	final,
	text: '',
} );

beforeEach( () => window.history.replaceState( {}, '', '/?plan=free&credits=55' ) );
afterEach( cleanup );

it( 'only spends after completed tasks, never from submit checks or intermediate/error updates', () => {
	const { result } = renderHook( useDemoCredits );
	act( () => {
		expect( result.current.beforeSubmit() ).toBe( true );
		expect( result.current.beforeSubmit() ).toBe( true );
		result.current.onTaskUpdate( update( 'working', false ) );
		result.current.onTaskUpdate( update( 'completed', false ) );
		result.current.onTaskUpdate( update( 'failed' ) );
		result.current.onTaskUpdate( update( 'canceled' ) );
	} );
	expect( result.current.percent ).toBe( 55 );
	act( () => result.current.onTaskUpdate( update( 'completed' ) ) );
	expect( result.current.percent ).toBe( 50 );
	act( () => result.current.onTaskUpdate( update( 'completed' ) ) );
	expect( result.current.percent ).toBe( 50 );
	act( () => result.current.onTaskUpdate( update( 'completed', true, 'next-task' ) ) );
	expect( result.current.percent ).toBe( 45 );
} );

it.each( [ 'free', 'paid', 'none' ] as const )(
	'gates only metered zero balances for %s',
	( plan ) => {
		window.history.replaceState( {}, '', `/?plan=${ plan }&credits=0` );
		const { result } = renderHook( useDemoCredits );
		expect( result.current.beforeSubmit() ).toBe( plan === 'none' );
		expect( !! result.current.notice ).toBe( plan === 'free' );
		act( () => result.current.changePercent( 1 ) );
		expect( result.current.beforeSubmit() ).toBe( true );
		act( () => result.current.onTaskUpdate( update( 'completed' ) ) );
		expect( result.current.percent ).toBe( plan === 'none' ? 1 : 0 );
	}
);

it( 'preserves playground plan, balance and notice controls', () => {
	const { result } = renderHook( useDemoCredits );
	act( () => result.current.changePercent( 15 ) );
	expect( result.current.notice?.message ).toBe( '15% of free credits left.' );
	act( () => result.current.notice?.onDismiss?.() );
	expect( result.current.notice ).toBeUndefined();
	act( () => result.current.changePlan( 'paid' ) );
	expect( result.current.tone ).toBe( 'muted' );
	expect( result.current.notice ).toBeUndefined();
	act( () => result.current.changePlan( 'free' ) );
	expect( result.current.notice ).toBeDefined();
	act( () => result.current.changePercent( 1000 ) );
	expect( result.current.percent ).toBe( 100 );
} );
