/** @jest-environment jsdom */
import { act, render, screen } from '@testing-library/react';
import { createRedesignProvider } from '../agent-provider';
import { useAgentTurnActivity, useRedesignAgent } from '../use-redesign-agent';
import type { Redesign } from '../api';

type PresentationWindow = Window & {
	__agentsManagerConfig?: { chatPresentation?: { embeddedContainer?: string } };
};
const hostWindow = window as PresentationWindow;
const run = {
	id: 'rd_1',
	site_id: 1,
	status: 'preview_ready',
	eligibility: { can_preview: true },
} as Redesign;
function Host() {
	const { ready } = useRedesignAgent( run );
	return (
		<>
			<div id="site-redesign-agent" />
			{ ready && <LoaderProbe /> }
		</>
	);
}
function LoaderProbe() {
	expect( document.querySelector( '#site-redesign-agent' ) ).not.toBeNull();
	expect( hostWindow.__agentsManagerConfig?.chatPresentation?.embeddedContainer ).toBe(
		'#site-redesign-agent'
	);
	return <span>Manager mounted</span>;
}
test.each( [ false, true ] )(
	'mounts the host before loading on SPA=%s and restores presentation on exit',
	( isSpa ) => {
		const previous = { chatPresentation: {} };
		hostWindow.__agentsManagerConfig = previous;
		const { rerender, unmount } = render( isSpa ? <span>Themes</span> : <Host /> );
		if ( isSpa ) {
			act( () => rerender( <Host /> ) );
		}
		expect( screen.getByText( 'Manager mounted' ) ).toBeVisible();
		unmount();
		expect( hostWindow.__agentsManagerConfig ).toBe( previous );
		expect( document.querySelector( '#site-redesign-agent' ) ).toBeNull();
	}
);

test( 'waits for the native portal and actions without automatically sending a chat message', async () => {
	const previousActions = window.__agentsManagerActions;
	const submitChatMessage = jest.fn();
	window.__agentsManagerActions = { submitChatMessage };
	function NativeHost() {
		const { connected } = useRedesignAgent( run );
		return (
			<>
				<div id="site-redesign-agent" />
				<span>{ connected ? 'Connected' : 'Loading' }</span>
			</>
		);
	}
	const { unmount } = render( <NativeHost /> );
	expect( screen.getByText( 'Loading' ) ).toBeVisible();
	act( () => {
		window.dispatchEvent( new Event( 'agents-manager-ready' ) );
	} );
	expect( screen.getByText( 'Loading' ) ).toBeVisible();
	await act( async () => {
		const portal = document.createElement( 'div' );
		portal.className = 'agents-manager-chat--embedded';
		const chat = document.createElement( 'div' );
		chat.className = 'agenttic';
		portal.append( chat );
		document.getElementById( 'site-redesign-agent' )!.append( portal );
	} );
	expect( screen.getByText( 'Connected' ) ).toBeVisible();
	expect( submitChatMessage ).not.toHaveBeenCalled();
	unmount();
	window.__agentsManagerActions = previousActions;
} );

describe( 'starting over', () => {
	const fresh = { ...run, id: 'rd_2', status: 'interview' } as Redesign;
	let resolveNewChat: () => void;
	let startNewChat: jest.Mock;
	let previousActions: typeof window.__agentsManagerActions;
	function ResetHost( { current, from }: { current: Redesign; from?: string } ) {
		const { conversationKey, agentUnavailable } = useRedesignAgent(
			current,
			from ? { from, to: current.id } : null
		);
		return (
			<>
				<div id="site-redesign-agent" />
				<span>key:{ conversationKey }</span>
				{ agentUnavailable && <span>Unavailable</span> }
			</>
		);
	}
	beforeEach( () => {
		jest.useFakeTimers();
		previousActions = window.__agentsManagerActions;
		startNewChat = jest.fn(
			() =>
				new Promise< void >( ( resolve ) => {
					resolveNewChat = resolve;
				} )
		);
		window.__agentsManagerActions = { startNewChat } as typeof window.__agentsManagerActions;
	} );
	// What a provider created now, as the remounted chat would create one, is given.
	const freshContext = () =>
		createRedesignProvider( () => 1 ).contextProvider.getClientContext().site_redesign
			?.redesign_id ?? 'none';
	afterEach( () => {
		jest.useRealTimers();
		window.__agentsManagerActions = previousActions;
	} );

	test( 'keeps the old conversation without the fresh run until the native chat confirms a new one', async () => {
		const { rerender } = render( <ResetHost current={ run } /> );
		expect( screen.getByText( 'key:rd_1' ) ).toBeVisible();
		rerender( <ResetHost current={ fresh } from="rd_1" /> );
		expect( startNewChat ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByText( 'key:rd_1' ) ).toBeVisible();
		// Nothing created during the reset may receive the fresh run.
		expect( freshContext() ).toBe( 'none' );
		await act( async () => resolveNewChat() );
		expect( screen.getByText( 'key:rd_2' ) ).toBeVisible();
		expect( freshContext() ).toBe( 'rd_2' );
	} );

	test( 'shows the agent as unavailable when the new chat never confirms, even if it does later', async () => {
		const { rerender } = render( <ResetHost current={ run } /> );
		rerender( <ResetHost current={ fresh } from="rd_1" /> );
		await act( async () => {
			await jest.advanceTimersByTimeAsync( 10000 );
		} );
		expect( screen.getByText( 'Unavailable' ) ).toBeVisible();
		await act( async () => resolveNewChat() );
		expect( screen.getByText( 'key:rd_1' ) ).toBeVisible();
		expect( freshContext() ).toBe( 'none' );
	} );
} );

test( 'reads a turn already running when the workspace loads mid-stream', () => {
	const previousActions = window.__agentsManagerActions;
	window.__agentsManagerActions = {
		isTurnInFlight: () => true,
	} as typeof window.__agentsManagerActions;
	function Probe() {
		return <span>{ useAgentTurnActivity() ? 'Answering' : 'Idle' }</span>;
	}
	const { unmount } = render( <Probe /> );
	expect( screen.getByText( 'Answering' ) ).toBeVisible();
	act( () => {
		window.dispatchEvent( new Event( 'agents-manager-turn-ended' ) );
	} );
	expect( screen.getByText( 'Idle' ) ).toBeVisible();
	unmount();
	window.__agentsManagerActions = previousActions;
} );
