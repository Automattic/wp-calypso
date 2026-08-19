// @vitest-environment jsdom
import { act } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAgentsApiChat } from './useAgentsApiChat';
import type { AgentsApiChatAdapter, AgentsApiChatState } from './types';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

function deferred< T >() {
	let resolve!: ( value: T ) => void;
	const promise = new Promise< T >( ( nextResolve ) => {
		resolve = nextResolve;
	} );
	return { promise, resolve };
}

let adapter: AgentsApiChatAdapter;
let latestHookValue: AgentsApiChatState | null = null;

function HookHarness(): null {
	latestHookValue = useAgentsApiChat( { adapter } );
	return null;
}

describe( 'useAgentsApiChat session hydration', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach( () => {
		adapter = {
			sendMessage: vi.fn(),
			listSessions: vi.fn().mockResolvedValue( [] ),
			loadSession: vi.fn(),
			markSessionRead: vi.fn().mockResolvedValue( {} ),
			deleteSession: vi.fn(),
		};
		latestHookValue = null;
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( async () => {
		await act( async () => root.unmount() );
		container.remove();
	} );

	it( 'exposes session discovery and transcript hydration independently', async () => {
		const sessions = deferred< unknown >();
		const transcript = deferred< unknown >();
		vi.mocked( adapter.listSessions ).mockReturnValueOnce( sessions.promise );
		vi.mocked( adapter.loadSession ).mockReturnValue( transcript.promise );

		await act( async () => root.render( <HookHarness /> ) );
		expect( latestHookValue?.isLoadingSessions ).toBe( true );
		expect( latestHookValue?.hasLoadedSessions ).toBe( false );
		expect( latestHookValue?.isProcessing ).toBe( false );

		await act( async () => sessions.resolve( [ { id: 'session-1' } ] ) );
		expect( latestHookValue?.isLoadingSessions ).toBe( false );
		expect( latestHookValue?.hasLoadedSessions ).toBe( true );

		let loadPromise!: Promise< void >;
		await act( async () => {
			loadPromise = latestHookValue!.loadSession( 'session-1' );
		} );
		expect( latestHookValue?.isLoadingSession ).toBe( true );
		expect( latestHookValue?.isProcessing ).toBe( true );
		expect( latestHookValue?.messages ).toEqual( [] );

		await act( async () => {
			transcript.resolve( {
				session_id: 'session-1',
				messages: [ { id: 'old-user', role: 'user', content: 'Old' } ],
			} );
			await loadPromise;
		} );
		expect( latestHookValue?.isLoadingSession ).toBe( false );
		expect( latestHookValue?.sessionId ).toBe( 'session-1' );
		expect( latestHookValue?.messages[ 0 ]?.id ).toBe( 'old-user' );
	} );

	it( 'keeps New blank when an older transcript resolves late', async () => {
		const transcript = deferred< unknown >();
		vi.mocked( adapter.loadSession ).mockReturnValue( transcript.promise );
		await act( async () => root.render( <HookHarness /> ) );

		let loadPromise!: Promise< void >;
		await act( async () => {
			loadPromise = latestHookValue!.loadSession( 'session-1' );
		} );
		await act( async () => latestHookValue!.newSession() );
		expect( latestHookValue?.isLoadingSession ).toBe( false );

		await act( async () => {
			transcript.resolve( {
				session_id: 'session-1',
				messages: [ { id: 'old-user', role: 'user', content: 'Old' } ],
			} );
			await loadPromise;
		} );
		expect( latestHookValue?.sessionId ).toBeNull();
		expect( latestHookValue?.messages ).toEqual( [] );
		expect( adapter.markSessionRead ).not.toHaveBeenCalled();
	} );

	it( 'keeps the newest selection when session loads resolve out of order', async () => {
		const firstTranscript = deferred< unknown >();
		const secondTranscript = deferred< unknown >();
		vi.mocked( adapter.loadSession )
			.mockReturnValueOnce( firstTranscript.promise )
			.mockReturnValueOnce( secondTranscript.promise );
		await act( async () => root.render( <HookHarness /> ) );

		let firstLoad!: Promise< void >;
		let secondLoad!: Promise< void >;
		await act( async () => {
			firstLoad = latestHookValue!.loadSession( 'session-1' );
			secondLoad = latestHookValue!.loadSession( 'session-2' );
		} );
		await act( async () => {
			secondTranscript.resolve( {
				session_id: 'session-2',
				messages: [ { id: 'second', role: 'user', content: 'Second' } ],
			} );
			await secondLoad;
		} );
		await act( async () => {
			firstTranscript.resolve( {
				session_id: 'session-1',
				messages: [ { id: 'first', role: 'user', content: 'First' } ],
			} );
			await firstLoad;
		} );

		expect( latestHookValue?.sessionId ).toBe( 'session-2' );
		expect( latestHookValue?.messages[ 0 ]?.id ).toBe( 'second' );
	} );
} );
