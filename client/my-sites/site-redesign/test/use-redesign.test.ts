/** @jest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import {
	startRedesign,
	fetchRedesign,
	generateRedesign,
	fetchRedesignPreview,
	applyRedesign,
	restartRedesign,
} from '../api';
import { useRedesign } from '../use-redesign';
import type { Redesign } from '../api';

jest.mock( '../api', () => ( {
	startRedesign: jest.fn(),
	fetchRedesign: jest.fn(),
	generateRedesign: jest.fn(),
	fetchRedesignPreview: jest.fn(),
	applyRedesign: jest.fn(),
	getCheckoutUrl: jest.fn(),
	rollbackRedesign: jest.fn(),
	restartRedesign: jest.fn(),
} ) );
const mockStart = jest.mocked( startRedesign );
const run = {
	id: 'rd_1',
	site_id: 1,
	status: 'interview',
	brief: null,
	brief_draft: null,
	brief_revision: 0,
	brief_confirmed: false,
	eligibility: { can_preview: true, can_apply: false },
	generation: null,
	preview: null,
} as Redesign;
beforeEach( () => {
	jest.clearAllMocks();
	window.history.replaceState( {}, '', '/' );
	mockStart.mockResolvedValue( run );
} );

test( 'does not generate until the caller explicitly confirms the brief', async () => {
	const draft = {
		...run,
		brief_draft: { goal: 'Read articles', style: 'Blue' },
		brief_revision: 2,
	};
	mockStart.mockResolvedValue( draft );
	const { result } = renderHook( () => useRedesign( 1 ) );
	await waitFor( () => expect( result.current.run ).toEqual( draft ) );
	expect( generateRedesign ).not.toHaveBeenCalled();
	jest.mocked( generateRedesign ).mockResolvedValue( { ...run, status: 'generating' } );
	await act( () => result.current.generate() );
	expect( generateRedesign ).toHaveBeenCalledWith( draft );
	expect( applyRedesign ).not.toHaveBeenCalled();
} );

test( 'drops a generation response after site switch and clears the old brief', async () => {
	mockStart.mockResolvedValue( {
		...run,
		brief_draft: { goal: 'Read', style: 'Blue' },
		brief_revision: 1,
	} );
	let resolveGeneration!: ( value: Redesign ) => void;
	jest.mocked( generateRedesign ).mockImplementation(
		() =>
			new Promise( ( resolve ) => {
				resolveGeneration = resolve;
			} )
	);
	const { result, rerender } = renderHook( ( { siteId } ) => useRedesign( siteId ), {
		initialProps: { siteId: 1 },
	} );
	await waitFor( () => expect( result.current.run?.id ).toBe( 'rd_1' ) );
	let pending!: Promise< void >;
	act( () => {
		pending = result.current.generate();
	} );
	window.history.replaceState( {}, '', '/' );
	mockStart.mockResolvedValue( { ...run, id: 'rd_2', site_id: 2 } );
	rerender( { siteId: 2 } );
	await waitFor( () => expect( result.current.run?.id ).toBe( 'rd_2' ) );
	await act( async () => {
		resolveGeneration( { ...run, status: 'preview_ready' } );
		await pending;
	} );
	expect( result.current.run?.site_id ).toBe( 2 );
	expect( result.current.brief ).toBeNull();
	expect( result.current.preview ).toBeNull();
} );

test( 'restores a checkout run without automatically applying', async () => {
	window.history.replaceState( {}, '', '/?redesign=rd_1&resume=apply' );
	jest.mocked( fetchRedesign ).mockResolvedValue( {
		...run,
		status: 'preview_ready',
		generation: { id: 'gen_1' } as Redesign[ 'generation' ],
	} );
	jest.mocked( fetchRedesignPreview ).mockResolvedValue( {
		html: 'Existing content',
		generation_id: 'gen_1',
		path: '/',
		routes: [],
	} );
	const { result } = renderHook( () => useRedesign( 1 ) );
	await waitFor( () => expect( result.current.preview?.html ).toBe( 'Existing content' ) );
	expect( fetchRedesign ).toHaveBeenCalledWith( 1, 'rd_1' );
	expect( startRedesign ).not.toHaveBeenCalled();
	expect( applyRedesign ).not.toHaveBeenCalled();
} );

test( 'recovers a stale run URL on the newly selected site', async () => {
	window.history.replaceState( {}, '', '/?redesign=rd_old&resume=apply' );
	jest.mocked( fetchRedesign ).mockRejectedValueOnce( { code: 'site_redesign_not_found' } );
	mockStart.mockResolvedValueOnce( { ...run, site_id: 2, id: 'rd_2' } );
	const { result } = renderHook( () => useRedesign( 2 ) );
	await waitFor( () => expect( result.current.run?.id ).toBe( 'rd_2' ) );
	expect( startRedesign ).toHaveBeenCalledWith( 2 );
	expect( window.location.search ).toBe( '?redesign=rd_2' );
	expect( result.current.error ).toBeNull();
} );

test( 'keeps the preview visible through apply polling for the same generation', async () => {
	const candidate = {
		...run,
		status: 'preview_ready',
		generation: { id: 'gen_1' } as Redesign[ 'generation' ],
	};
	mockStart.mockResolvedValue( candidate );
	jest.mocked( fetchRedesignPreview ).mockResolvedValue( {
		html: 'Existing content',
		generation_id: 'gen_1',
		path: '/',
		routes: [],
	} );
	jest.mocked( applyRedesign ).mockResolvedValue( { ...candidate, status: 'applying' } );
	const { result } = renderHook( () => useRedesign( 1 ) );
	await waitFor( () => expect( result.current.preview?.html ).toBe( 'Existing content' ) );
	await act( () => result.current.apply() );
	expect( result.current.preview?.html ).toBe( 'Existing content' );
	expect( fetchRedesignPreview ).toHaveBeenCalledTimes( 1 );
} );

test( 'ignores a second apply while the first response is in flight', async () => {
	const ready = { ...run, status: 'preview_ready' };
	mockStart.mockResolvedValue( ready );
	let resolveApply!: ( next: Redesign ) => void;
	jest.mocked( applyRedesign ).mockImplementation(
		() =>
			new Promise( ( resolve ) => {
				resolveApply = resolve;
			} )
	);
	const { result } = renderHook( () => useRedesign( 1 ) );
	await waitFor( () => expect( result.current.run ).toEqual( ready ) );
	let first!: Promise< void >;
	act( () => {
		first = result.current.apply();
		void result.current.apply();
	} );
	expect( applyRedesign ).toHaveBeenCalledTimes( 1 );
	await act( async () => {
		resolveApply( { ...ready, status: 'applying' } );
		await first;
	} );
	expect( result.current.run?.status ).toBe( 'applying' );
	expect( result.current.error ).toBeNull();
} );

test( 'refetches a stale draft instead of generating the newer revision silently', async () => {
	const ready = { ...run, brief_draft: { goal: 'Read', style: 'Blue' }, brief_revision: 1 };
	mockStart.mockResolvedValue( ready );
	jest.mocked( generateRedesign ).mockRejectedValue( { code: 'site_redesign_brief_stale' } );
	jest.mocked( fetchRedesign ).mockResolvedValue( {
		...ready,
		brief_draft: { goal: 'Read', style: 'Warm' },
		brief_revision: 2,
	} );
	const { result } = renderHook( () => useRedesign( 1 ) );
	await waitFor( () => expect( result.current.run ).toEqual( ready ) );
	await act( () => result.current.generate() );
	expect( result.current.brief?.style ).toBe( 'Warm' );
	expect( result.current.error ).toContain( 'Review the latest brief' );
	expect( generateRedesign ).toHaveBeenCalledTimes( 1 );
} );

test( 'recovers an already running server apply without displaying a false failure', async () => {
	mockStart.mockResolvedValue( { ...run, status: 'preview_ready' } );
	jest.mocked( applyRedesign ).mockRejectedValue( { code: 'site_redesign_busy' } );
	jest.mocked( fetchRedesign ).mockResolvedValue( { ...run, status: 'applying' } );
	const { result } = renderHook( () => useRedesign( 1 ) );
	await waitFor( () => expect( result.current.run?.status ).toBe( 'preview_ready' ) );
	await act( () => result.current.apply() );
	expect( result.current.run?.status ).toBe( 'applying' );
	expect( result.current.error ).toBeNull();
} );

test( 'keeps polling a failed run so an agent retry reaches the workspace', async () => {
	jest.useFakeTimers();
	try {
		const failed = {
			...run,
			status: 'failed',
			brief_draft: { goal: 'Read', style: 'Blue' },
			brief_revision: 1,
			generation: { id: 'gen_1', status: 'failed' } as Redesign[ 'generation' ],
		};
		const retried = {
			...failed,
			status: 'generating',
			generation: { id: 'gen_2', status: 'queued', brief_revision: 1, started_by: 'agent' },
		} as Redesign;
		mockStart.mockResolvedValue( failed );
		jest.mocked( fetchRedesign ).mockResolvedValue( retried );
		const { result } = renderHook( () => useRedesign( 1 ) );
		await waitFor( () => expect( result.current.run?.status ).toBe( 'failed' ) );
		await act( async () => {
			await jest.advanceTimersByTimeAsync( 5000 );
		} );
		expect( fetchRedesign ).toHaveBeenCalledWith( 1, 'rd_1' );
		expect( result.current.run?.generation?.id ).toBe( 'gen_2' );
		expect( generateRedesign ).not.toHaveBeenCalled();
	} finally {
		jest.useRealTimers();
	}
} );

test( 'keeps polling after a transient progress failure and recovers on the next answer', async () => {
	jest.useFakeTimers();
	try {
		const generating = {
			...run,
			status: 'generating',
			brief_draft: { goal: 'Read', style: 'Blue' },
			brief_revision: 1,
			generation: { id: 'gen_2', status: 'running', brief_revision: 1 },
		} as Redesign;
		const ready = {
			...generating,
			status: 'preview_ready',
			generation: { id: 'gen_2', status: 'succeeded', brief_revision: 1 },
		} as Redesign;
		mockStart.mockResolvedValue( generating );
		jest
			.mocked( fetchRedesign )
			.mockRejectedValueOnce( new Error( 'offline' ) )
			.mockResolvedValueOnce( ready );
		const { result } = renderHook( () => useRedesign( 1 ) );
		await waitFor( () => expect( result.current.run?.status ).toBe( 'generating' ) );
		await act( async () => {
			await jest.advanceTimersByTimeAsync( 3000 );
		} );
		expect( result.current.error ).toBe(
			'Unable to check design progress. Try loading your design again.'
		);
		await act( async () => {
			await jest.advanceTimersByTimeAsync( 5000 );
		} );
		expect( fetchRedesign ).toHaveBeenCalledTimes( 2 );
		expect( result.current.run?.status ).toBe( 'preview_ready' );
		expect( result.current.error ).toBeNull();
	} finally {
		jest.useRealTimers();
	}
} );

const briefRun = {
	...run,
	status: 'preview_ready',
	brief: { goal: 'Read', style: 'Blue' },
	brief_draft: { goal: 'Read', style: 'Blue' },
	brief_revision: 2,
	can_restart: true,
	generation: { id: 'gen_1', status: 'succeeded', brief_revision: 2 },
} as Redesign;
const freshRun = {
	...run,
	id: 'rd_2',
	can_restart: true,
	successor_id: null,
} as Redesign;

test( 'starts a new brief on a fresh run and leaves nothing from the old one', async () => {
	window.history.replaceState( {}, '', '/?redesign=rd_1&resume=apply' );
	jest.mocked( fetchRedesign ).mockResolvedValue( briefRun );
	jest.mocked( fetchRedesignPreview ).mockResolvedValue( {
		html: 'Old candidate',
		generation_id: 'gen_1',
		path: '/',
		routes: [],
	} );
	jest.mocked( restartRedesign ).mockResolvedValue( freshRun );
	const { result } = renderHook( () => useRedesign( 1 ) );
	await waitFor( () => expect( result.current.preview?.html ).toBe( 'Old candidate' ) );
	act( () => result.current.setPath( '/about/' ) );
	await act( () => result.current.restart() );
	expect( restartRedesign ).toHaveBeenCalledWith( briefRun );
	expect( result.current.run?.id ).toBe( 'rd_2' );
	expect( result.current.brief ).toBeNull();
	expect( result.current.preview ).toBeNull();
	expect( result.current.path ).toBe( '/' );
	expect( result.current.succession ).toEqual( { from: 'rd_1', to: 'rd_2' } );
	expect( window.location.search ).toBe( '?redesign=rd_2' );
	expect( generateRedesign ).not.toHaveBeenCalled();
	expect( applyRedesign ).not.toHaveBeenCalled();
} );

test( 'never starts over while a design is generating', async () => {
	mockStart.mockResolvedValue( { ...briefRun, status: 'generating', can_restart: false } );
	const { result } = renderHook( () => useRedesign( 1 ) );
	await waitFor( () => expect( result.current.run?.status ).toBe( 'generating' ) );
	await act( () => result.current.restart() );
	expect( restartRedesign ).not.toHaveBeenCalled();
} );

test( 'keeps the run and explains a busy restart', async () => {
	mockStart.mockResolvedValue( briefRun );
	jest.mocked( restartRedesign ).mockRejectedValue( { code: 'site_redesign_busy' } );
	jest.mocked( fetchRedesign ).mockResolvedValue( { ...briefRun, status: 'applying' } );
	const { result } = renderHook( () => useRedesign( 1 ) );
	await waitFor( () => expect( result.current.run?.id ).toBe( 'rd_1' ) );
	await act( () => result.current.restart() );
	expect( result.current.run?.id ).toBe( 'rd_1' );
	expect( result.current.run?.status ).toBe( 'applying' );
	expect( result.current.succession ).toBeNull();
	expect( result.current.error ).toContain( 'Wait for the current design work' );
} );

test( 'drops a restart that answers after a site switch', async () => {
	mockStart.mockResolvedValue( briefRun );
	let resolveRestart!: ( value: Redesign ) => void;
	jest.mocked( restartRedesign ).mockImplementation(
		() =>
			new Promise( ( resolve ) => {
				resolveRestart = resolve;
			} )
	);
	const { result, rerender } = renderHook( ( { siteId } ) => useRedesign( siteId ), {
		initialProps: { siteId: 1 },
	} );
	await waitFor( () => expect( result.current.run?.id ).toBe( 'rd_1' ) );
	let pending!: Promise< void >;
	act( () => {
		pending = result.current.restart();
	} );
	window.history.replaceState( {}, '', '/' );
	mockStart.mockResolvedValue( { ...run, id: 'rd_9', site_id: 2 } );
	rerender( { siteId: 2 } );
	await waitFor( () => expect( result.current.run?.id ).toBe( 'rd_9' ) );
	await act( async () => {
		resolveRestart( freshRun );
		await pending;
	} );
	expect( result.current.run?.id ).toBe( 'rd_9' );
	expect( result.current.succession ).toBeNull();
} );

test( 'follows a fresh run the agent started, found by polling the old one', async () => {
	jest.useFakeTimers();
	try {
		mockStart.mockResolvedValue( briefRun );
		jest
			.mocked( fetchRedesign )
			.mockResolvedValueOnce( { ...briefRun, status: 'superseded', successor_id: 'rd_2' } )
			.mockResolvedValueOnce( freshRun );
		const { result } = renderHook( () => useRedesign( 1 ) );
		await waitFor( () => expect( result.current.run?.id ).toBe( 'rd_1' ) );
		await act( async () => {
			await jest.advanceTimersByTimeAsync( 5000 );
		} );
		expect( fetchRedesign ).toHaveBeenNthCalledWith( 2, 1, 'rd_2' );
		expect( result.current.run?.id ).toBe( 'rd_2' );
		expect( result.current.brief ).toBeNull();
		expect( result.current.succession ).toEqual( { from: 'rd_1', to: 'rd_2' } );
		expect( window.location.search ).toBe( '?redesign=rd_2' );
		expect( restartRedesign ).not.toHaveBeenCalled();
	} finally {
		jest.useRealTimers();
	}
} );

test( 'follows an applied run that was started over, keeping its own status server-side', async () => {
	window.history.replaceState( {}, '', '/?redesign=rd_1' );
	jest
		.mocked( fetchRedesign )
		.mockResolvedValueOnce( { ...briefRun, status: 'applied', successor_id: 'rd_2' } )
		.mockResolvedValueOnce( freshRun );
	const { result } = renderHook( () => useRedesign( 1 ) );
	await waitFor( () => expect( result.current.run?.id ).toBe( 'rd_2' ) );
	expect( result.current.succession ).toEqual( { from: 'rd_1', to: 'rd_2' } );
	expect( window.location.search ).toBe( '?redesign=rd_2' );
} );

test( 'keeps polling after a rejected restart and accepts the next answer', async () => {
	jest.useFakeTimers();
	try {
		const interview = { ...briefRun, status: 'interview', generation: null } as Redesign;
		mockStart.mockResolvedValue( interview );
		let rejectRestart!: ( reason: unknown ) => void;
		jest.mocked( restartRedesign ).mockImplementation(
			() =>
				new Promise( ( _resolve, reject ) => {
					rejectRestart = reject;
				} )
		);
		jest.mocked( fetchRedesign ).mockResolvedValue( {
			...interview,
			status: 'generating',
			can_restart: false,
		} );
		const { result } = renderHook( () => useRedesign( 1 ) );
		await waitFor( () => expect( result.current.run?.status ).toBe( 'interview' ) );
		let pending!: Promise< void >;
		act( () => {
			pending = result.current.restart();
		} );
		// The poll scheduled before the restart answers while it is in flight and is dropped.
		await act( async () => {
			await jest.advanceTimersByTimeAsync( 5000 );
		} );
		await act( async () => {
			rejectRestart( new Error( 'offline' ) );
			await pending;
		} );
		expect( result.current.run?.status ).toBe( 'interview' );
		await act( async () => {
			await jest.advanceTimersByTimeAsync( 5000 );
		} );
		expect( result.current.run?.status ).toBe( 'generating' );
	} finally {
		jest.useRealTimers();
	}
} );

describe( 'back from a paid checkout', () => {
	test( 'never starts a run when the checkout run is gone', async () => {
		window.history.replaceState( {}, '', '/?redesign=rd_old&resume=apply' );
		jest.mocked( fetchRedesign ).mockRejectedValueOnce( { code: 'site_redesign_not_found' } );
		const { result } = renderHook( () => useRedesign( 1, { applyOnly: true } ) );
		await waitFor( () => expect( result.current.closed ).toBe( true ) );
		expect( startRedesign ).not.toHaveBeenCalled();
	} );

	test( 'never follows a successor, restarts, or generates', async () => {
		window.history.replaceState( {}, '', '/?redesign=rd_1&resume=apply' );
		jest
			.mocked( fetchRedesign )
			.mockResolvedValueOnce( { ...briefRun, successor_id: 'rd_2' } )
			.mockResolvedValueOnce( freshRun );
		const { result } = renderHook( () => useRedesign( 1, { applyOnly: true } ) );
		await waitFor( () => expect( result.current.closed ).toBe( true ) );
		expect( result.current.run?.id ).not.toBe( 'rd_2' );
		await act( () => result.current.restart() );
		await act( () => result.current.generate() );
		expect( restartRedesign ).not.toHaveBeenCalled();
		expect( generateRedesign ).not.toHaveBeenCalled();
		expect( startRedesign ).not.toHaveBeenCalled();
	} );
} );
