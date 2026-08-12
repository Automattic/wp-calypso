/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import {
	JETPACK_AI_QUOTA_EXHAUSTED_CODE,
	getJetpackAiQuotaFromError,
	getJetpackAiQuotaFromMessages,
	jetpackAiClientStateDataPartAdapter,
	normalizeJetpackAiFeatureQuota,
	normalizeJetpackAiQuota,
	useSubmissionAdmission,
} from './metering';
import type { UIMessage } from '@automattic/agenttic-client';

jest.mock( '@wordpress/api-fetch', () => jest.fn() );

const mockApiFetch = jest.mocked( apiFetch );

function setAgentsManagerData( value: unknown ): void {
	Object.defineProperty( globalThis, 'agentsManagerData', {
		configurable: true,
		writable: true,
		value,
	} );
}

const canonicalQuota = {
	product: 'jetpack-ai' as const,
	plan: 'free' as const,
	metered: true,
	limit: 20,
	used: 20,
	remaining: 0,
	exhausted: true,
	upgrade: {
		kind: 'jetpack-ai' as const,
		url: 'https://wordpress.com/jetpack/ai/upgrade',
	},
};

describe( 'Jetpack AI quota normalization', () => {
	beforeEach( () => {
		Reflect.deleteProperty( globalThis, 'agentsManagerData' );
		mockApiFetch.mockReset();
	} );

	it( 'treats metered:false as authoritative even if exhausted is also true', () => {
		expect( normalizeJetpackAiQuota( { ...canonicalQuota, metered: false } ) ).toMatchObject( {
			metered: false,
			exhausted: true,
		} );
	} );

	it( 'normalizes the backend exhausted terminal DataPart and approved Jetpack route', () => {
		expect(
			normalizeJetpackAiQuota( {
				code: JETPACK_AI_QUOTA_EXHAUSTED_CODE,
				product: 'jetpack-ai',
				plan: 'free',
				state: 'exhausted',
				usage: { limit: 20, used: 20, remaining: 0 },
				jetpack_ai_upgrade_url: '/jetpack-ai-upgrade',
			} )
		).toEqual( {
			...canonicalQuota,
			upgrade: { kind: 'jetpack-ai', url: '/jetpack-ai-upgrade' },
		} );
	} );

	it( 'reads the latest terminal quota DataPart from UI messages', () => {
		const messages = [
			{
				content: [ { type: 'data', data: { name: 'jetpackAiQuota', ...canonicalQuota } } ],
			},
		] as Pick< UIMessage, 'content' >[];

		expect( getJetpackAiQuotaFromMessages( messages ) ).toEqual( canonicalQuota );
	} );

	it( 'reads canonical quota nested in Agenttic client state', () => {
		const messages = [
			{
				content: [
					{
						type: 'data',
						data: { clientState: { jetpackAiQuota: canonicalQuota } },
					},
				],
			},
		] as Pick< UIMessage, 'content' >[];

		expect( getJetpackAiQuotaFromMessages( messages ) ).toEqual( canonicalQuota );
	} );

	it( 'adapts rollout quota parts into Agenttic client state', () => {
		expect( jetpackAiClientStateDataPartAdapter( { jetpackAiQuota: canonicalQuota } ) ).toEqual( {
			jetpackAiQuota: canonicalQuota,
		} );
		expect( jetpackAiClientStateDataPartAdapter( { unrelated: true } ) ).toBeUndefined();
	} );

	it( 'requires the stable quota code and ignores generic JSON-RPC codes', () => {
		expect(
			getJetpackAiQuotaFromError( {
				code: -32000,
				data: { jetpackAiQuota: canonicalQuota },
			} )
		).toBeUndefined();
		expect(
			getJetpackAiQuotaFromError( {
				code: JETPACK_AI_QUOTA_EXHAUSTED_CODE,
				data: { jetpackAiQuota: canonicalQuota },
			} )
		).toEqual( canonicalQuota );
	} );

	it( 'reads a structured Agenttic protocol error without keying on its JSON-RPC code', () => {
		expect(
			getJetpackAiQuotaFromError( {
				code: -32000,
				data: {
					code: JETPACK_AI_QUOTA_EXHAUSTED_CODE,
					clientState: { jetpackAiQuota: canonicalQuota },
				},
			} )
		).toEqual( canonicalQuota );
	} );

	it( 'requires the server-owned plan discriminator instead of inferring a free tier', () => {
		const { plan, ...quotaWithoutPlan } = canonicalQuota;
		void plan;

		expect(
			normalizeJetpackAiQuota( {
				...quotaWithoutPlan,
				'current-tier': { value: 0 },
			} )
		).toBeUndefined();
	} );

	it( 'accepts canonical quota nested in the feature response', () => {
		expect( normalizeJetpackAiFeatureQuota( { jetpackAiQuota: canonicalQuota } ) ).toEqual(
			canonicalQuota
		);
	} );

	it( 'rejects upgrade URLs outside the site and trusted product hosts', () => {
		expect(
			normalizeJetpackAiQuota( {
				...canonicalQuota,
				upgrade: { kind: 'jetpack-ai', url: 'https://example.com/phishing' },
			} )
		).toBeUndefined();
		expect(
			normalizeJetpackAiQuota( {
				...canonicalQuota,
				upgrade: { kind: 'wpcom-plan', url: 'https://wordpress.com.evil.test/plans' },
			} )
		).toBeUndefined();
	} );
} );

describe( 'useSubmissionAdmission', () => {
	beforeEach( () => {
		Reflect.deleteProperty( globalThis, 'agentsManagerData' );
		mockApiFetch.mockReset();
	} );

	it( 'does not block an explicitly unmetered WordPress.com plan', () => {
		setAgentsManagerData( {
			jetpackAiMeteringEnabled: true,
			jetpackAiQuota: {
				...canonicalQuota,
				product: 'wordpress-com-agent',
				plan: 'included',
				metered: false,
				upgrade: null,
			},
		} );
		const { result } = renderHook( () => useSubmissionAdmission( { messages: [], error: null } ) );

		expect( result.current.submitBlocked ).toBe( false );
		expect( result.current.notice ).toBeUndefined();
	} );

	it( 'ignores stale Jetpack quota when the server selects the full WordPress Agent', () => {
		setAgentsManagerData( { jetpackAiMeteringEnabled: false } );
		const staleMessage = {
			content: [ { type: 'data', data: { name: 'jetpackAiQuota', ...canonicalQuota } } ],
		} as UIMessage;
		const staleError = {
			code: JETPACK_AI_QUOTA_EXHAUSTED_CODE,
			data: { jetpackAiQuota: canonicalQuota },
		};

		const { result } = renderHook( () =>
			useSubmissionAdmission( { messages: [ staleMessage ], error: staleError } )
		);

		expect( result.current.submitBlocked ).toBe( false );
		expect( result.current.notice ).toBeUndefined();
		expect( mockApiFetch ).not.toHaveBeenCalled();
	} );

	it( 'keeps the exact exhausted notice visible and routes blocked intent to its upgrade action', () => {
		setAgentsManagerData( {
			jetpackAiMeteringEnabled: true,
			jetpackAiQuota: canonicalQuota,
		} );
		const { result } = renderHook( () => useSubmissionAdmission( { messages: [], error: null } ) );

		expect( result.current.submitBlocked ).toBe( true );
		expect( result.current.notice ).toMatchObject( {
			message: 'You’re out of free credits.',
			status: 'error',
			dismissible: false,
			action: { label: 'Upgrade' },
		} );
		expect( result.current.notice?.action?.onClick ).toBe( result.current.onBlockedSubmit );
	} );

	it( 'shows remaining free credits and Upgrade from the server-provided initial state', () => {
		setAgentsManagerData( {
			jetpackAiMeteringEnabled: true,
			jetpackAiQuota: {
				...canonicalQuota,
				used: 0,
				remaining: 20,
				exhausted: false,
			},
		} );

		const { result } = renderHook( () => useSubmissionAdmission( { messages: [], error: null } ) );

		expect( result.current.submitBlocked ).toBe( false );
		expect( result.current.notice ).toMatchObject( {
			message: '20 free credits left',
			dismissible: false,
			action: { label: 'Upgrade' },
		} );
		expect( result.current.notice?.status ).toBeUndefined();
	} );

	it( 'does not show the free-plan notice for a paid Jetpack AI plan', () => {
		setAgentsManagerData( {
			jetpackAiMeteringEnabled: true,
			jetpackAiQuota: {
				...canonicalQuota,
				plan: 'paid',
				used: 5,
				remaining: 15,
				exhausted: false,
			},
		} );
		const { result } = renderHook( () => useSubmissionAdmission( { messages: [], error: null } ) );

		expect( result.current.submitBlocked ).toBe( false );
		expect( result.current.notice ).toBeUndefined();
	} );

	it( 'keeps a paid-plan upgrade path visible when its quota is exhausted', () => {
		setAgentsManagerData( {
			jetpackAiMeteringEnabled: true,
			jetpackAiQuota: { ...canonicalQuota, plan: 'paid' },
		} );
		const { result } = renderHook( () => useSubmissionAdmission( { messages: [], error: null } ) );

		expect( result.current.submitBlocked ).toBe( true );
		expect( result.current.notice ).toMatchObject( {
			message: 'No AI requests remaining',
			status: 'error',
			action: { label: 'Upgrade' },
		} );
	} );

	it( 'preloads canonical server quota for self-hosted Jetpack sites', async () => {
		setAgentsManagerData( { jetpackAiMeteringEnabled: true } );
		mockApiFetch.mockResolvedValue( {
			jetpackAiQuota: {
				...canonicalQuota,
				used: 5,
				remaining: 15,
				exhausted: false,
			},
		} );

		const { result } = renderHook( () => useSubmissionAdmission( { messages: [], error: null } ) );

		await waitFor( () => expect( result.current.notice?.message ).toBe( '15 free credits left' ) );
		expect( mockApiFetch ).toHaveBeenCalledWith( {
			path: '/wpcom/v2/jetpack-ai/ai-assistant-feature?skip_cache=true',
		} );
	} );

	it( 'replaces inline quota with a fresh canonical snapshot after a turn settles', async () => {
		setAgentsManagerData( {
			jetpackAiMeteringEnabled: true,
			jetpackAiQuota: {
				...canonicalQuota,
				used: 19,
				remaining: 1,
				exhausted: false,
			},
		} );
		mockApiFetch.mockResolvedValue( { jetpackAiQuota: canonicalQuota } );

		const { result } = renderHook( () => useSubmissionAdmission( { messages: [], error: null } ) );
		expect( result.current.notice?.message ).toBe( '1 free credit left' );

		await act( async () => {
			await result.current.refreshAfterTurn?.();
		} );

		await waitFor( () => expect( result.current.submitBlocked ).toBe( true ) );
		expect( result.current.notice?.message ).toBe( 'You’re out of free credits.' );
		expect( mockApiFetch ).toHaveBeenCalledWith( {
			path: '/wpcom/v2/jetpack-ai/ai-assistant-feature?skip_cache=true',
		} );
	} );

	it( 'does not let asynchronously hydrated history override the initial server snapshot', () => {
		setAgentsManagerData( {
			jetpackAiMeteringEnabled: true,
			jetpackAiQuota: {
				...canonicalQuota,
				used: 10,
				remaining: 10,
				exhausted: false,
			},
		} );
		const staleMessage = {
			id: 'persisted-terminal',
			content: [ { type: 'data', data: { name: 'jetpackAiQuota', ...canonicalQuota } } ],
		} as UIMessage;

		const { result, rerender } = renderHook(
			( { messages, historyRevision } ) =>
				useSubmissionAdmission( { messages, error: null, historyRevision } ),
			{ initialProps: { messages: [] as UIMessage[], historyRevision: 0 } }
		);
		expect( result.current.notice?.message ).toBe( '10 free credits left' );

		rerender( { messages: [ staleMessage ], historyRevision: 1 } );

		expect( result.current.submitBlocked ).toBe( false );
		expect( result.current.notice?.message ).toBe( '10 free credits left' );
	} );

	it( 'does not let asynchronously hydrated history override a completed REST refresh', async () => {
		setAgentsManagerData( { jetpackAiMeteringEnabled: true } );
		const freshQuota = {
			...canonicalQuota,
			used: 10,
			remaining: 10,
			exhausted: false,
		};
		mockApiFetch.mockResolvedValue( { jetpackAiQuota: freshQuota } );
		const staleMessage = {
			id: 'persisted-terminal',
			content: [ { type: 'data', data: { name: 'jetpackAiQuota', ...canonicalQuota } } ],
		} as UIMessage;

		const { result, rerender } = renderHook(
			( { messages, historyRevision } ) =>
				useSubmissionAdmission( { messages, error: null, historyRevision } ),
			{ initialProps: { messages: [] as UIMessage[], historyRevision: 0 } }
		);
		await waitFor( () => expect( result.current.notice?.message ).toBe( '10 free credits left' ) );

		rerender( { messages: [ staleMessage ], historyRevision: 1 } );

		expect( result.current.submitBlocked ).toBe( false );
		expect( result.current.notice?.message ).toBe( '10 free credits left' );
	} );

	it( 'uses a terminal quota only when it follows a live dispatch', () => {
		setAgentsManagerData( {
			jetpackAiMeteringEnabled: true,
			jetpackAiQuota: {
				...canonicalQuota,
				used: 19,
				remaining: 1,
				exhausted: false,
			},
		} );
		const terminalMessage = {
			id: 'live-terminal',
			content: [ { type: 'data', data: { name: 'jetpackAiQuota', ...canonicalQuota } } ],
		} as UIMessage;
		const { result, rerender } = renderHook(
			( { messages, dispatchRevision } ) =>
				useSubmissionAdmission( { messages, error: null, dispatchRevision } ),
			{ initialProps: { messages: [] as UIMessage[], dispatchRevision: 0 } }
		);

		rerender( { messages: [], dispatchRevision: 1 } );
		rerender( { messages: [ terminalMessage ], dispatchRevision: 1 } );

		expect( result.current.submitBlocked ).toBe( true );
		expect( result.current.notice?.message ).toBe( 'You’re out of free credits.' );
	} );

	it( 'recognizes a terminal quota when dispatch and response render in one batch', () => {
		setAgentsManagerData( {
			jetpackAiMeteringEnabled: true,
			jetpackAiQuota: {
				...canonicalQuota,
				used: 19,
				remaining: 1,
				exhausted: false,
			},
		} );
		const terminalMessage = {
			id: 'synchronous-terminal',
			content: [ { type: 'data', data: { name: 'jetpackAiQuota', ...canonicalQuota } } ],
		} as UIMessage;
		const { result, rerender } = renderHook(
			( { messages, dispatchRevision } ) =>
				useSubmissionAdmission( { messages, error: null, dispatchRevision } ),
			{ initialProps: { messages: [] as UIMessage[], dispatchRevision: 0 } }
		);

		rerender( { messages: [ terminalMessage ], dispatchRevision: 1 } );

		expect( result.current.submitBlocked ).toBe( true );
		expect( result.current.notice?.message ).toBe( 'You’re out of free credits.' );
	} );

	it( 'does not reuse the prior terminal quota as the result of a new dispatch', () => {
		setAgentsManagerData( {
			jetpackAiMeteringEnabled: true,
			jetpackAiQuota: {
				...canonicalQuota,
				used: 10,
				remaining: 10,
				exhausted: false,
			},
		} );
		const priorTerminal = {
			id: 'prior-terminal',
			content: [ { type: 'data', data: { name: 'jetpackAiQuota', ...canonicalQuota } } ],
		} as UIMessage;
		const { result, rerender } = renderHook(
			( { messages, dispatchRevision, historyRevision } ) =>
				useSubmissionAdmission( {
					messages,
					error: null,
					dispatchRevision,
					historyRevision,
				} ),
			{
				initialProps: {
					messages: [ priorTerminal ],
					dispatchRevision: 0,
					historyRevision: 1,
				},
			}
		);

		rerender( { messages: [ priorTerminal ], dispatchRevision: 1, historyRevision: 1 } );

		expect( result.current.submitBlocked ).toBe( false );
		expect( result.current.notice?.message ).toBe( '10 free credits left' );
	} );

	it( 'ignores an older refresh response that arrives after the post-turn refresh', async () => {
		setAgentsManagerData( {
			jetpackAiMeteringEnabled: true,
			jetpackAiQuota: {
				...canonicalQuota,
				used: 19,
				remaining: 1,
				exhausted: false,
			},
		} );
		let resolveInitialRefresh: ( value: unknown ) => void = () => undefined;
		let resolvePostTurnRefresh: ( value: unknown ) => void = () => undefined;
		const initialRefresh = new Promise< unknown >( ( resolve ) => {
			resolveInitialRefresh = resolve;
		} );
		const postTurnRefresh = new Promise< unknown >( ( resolve ) => {
			resolvePostTurnRefresh = resolve;
		} );
		mockApiFetch.mockReturnValueOnce( initialRefresh ).mockReturnValueOnce( postTurnRefresh );

		const { result, rerender } = renderHook(
			( { messages, dispatchRevision } ) =>
				useSubmissionAdmission( { messages, error: null, dispatchRevision } ),
			{ initialProps: { messages: [] as UIMessage[], dispatchRevision: 0 } }
		);
		await waitFor( () => expect( mockApiFetch ).toHaveBeenCalledTimes( 1 ) );

		const exhaustedMessage = {
			id: 'live-terminal',
			content: [ { type: 'data', data: { name: 'jetpackAiQuota', ...canonicalQuota } } ],
		} as UIMessage;
		rerender( { messages: [], dispatchRevision: 1 } );
		rerender( { messages: [ exhaustedMessage ], dispatchRevision: 1 } );
		expect( result.current.submitBlocked ).toBe( true );

		let postTurnRequest: Promise< void > | undefined;
		act( () => {
			postTurnRequest = result.current.refreshAfterTurn?.( 1 );
		} );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );

		await act( async () => {
			resolvePostTurnRefresh( { jetpackAiQuota: canonicalQuota } );
			await postTurnRequest;
		} );
		expect( result.current.submitBlocked ).toBe( true );

		await act( async () => {
			resolveInitialRefresh( {
				jetpackAiQuota: {
					...canonicalQuota,
					used: 10,
					remaining: 10,
					exhausted: false,
				},
			} );
			await initialRefresh;
		} );

		expect( result.current.submitBlocked ).toBe( true );
		expect( result.current.notice?.message ).toBe( 'You’re out of free credits.' );
	} );
} );
