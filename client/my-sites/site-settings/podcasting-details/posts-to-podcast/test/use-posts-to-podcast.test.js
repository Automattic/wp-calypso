/**
 * @jest-environment jsdom
 */
import { act } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { usePostsToPodcastJob } from '../use-posts-to-podcast';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			post: jest.fn(),
			get: jest.fn(),
		},
	},
} ) );

const SITE_ID = 1234;
const storageKey = `posts-to-podcast:active-job:${ SITE_ID }`;

beforeEach( () => {
	jest.useFakeTimers();
	window.localStorage.clear();
	wpcom.req.post.mockReset();
	wpcom.req.get.mockReset();
} );

afterEach( () => {
	jest.useRealTimers();
} );

describe( 'usePostsToPodcastJob — initial + enqueue', () => {
	it( 'starts in idle with no stored job', () => {
		const { result } = renderHookWithProvider( () => usePostsToPodcastJob( SITE_ID ) );
		expect( result.current.status ).toBe( 'idle' );
		expect( result.current.jobId ).toBeNull();
	} );

	it( 'enqueues, persists the jobId, and transitions to polling', async () => {
		wpcom.req.post.mockResolvedValueOnce( { jobId: 42 } );
		wpcom.req.get.mockResolvedValue( { status: 'pending' } );

		const { result } = renderHookWithProvider( () => usePostsToPodcastJob( SITE_ID ) );

		await act( async () => {
			await result.current.generate( {
				window: { unit: 'days', n: 7 },
				length: 'medium',
				voicePreset: 'witty',
			} );
		} );

		expect( wpcom.req.post ).toHaveBeenCalledWith( {
			path: `/sites/${ SITE_ID }/posts-to-podcast`,
			apiNamespace: 'wpcom/v2',
			body: { window: { unit: 'days', n: 7 }, length: 'medium', voicePreset: 'witty' },
		} );
		expect( result.current.status ).toBe( 'polling' );
		expect( result.current.jobId ).toBe( 42 );

		const stored = JSON.parse( window.localStorage.getItem( storageKey ) );
		expect( stored.jobId ).toBe( 42 );
		expect( typeof stored.startedAt ).toBe( 'number' );
	} );
} );

describe( 'usePostsToPodcastJob — polling', () => {
	it( 'transitions to succeeded when the first poll returns complete', async () => {
		wpcom.req.post.mockResolvedValueOnce( { jobId: 7 } );
		wpcom.req.get.mockResolvedValueOnce( {
			status: 'complete',
			postId: 99,
			editUrl: 'https://example.test/edit',
		} );

		const { result } = renderHookWithProvider( () => usePostsToPodcastJob( SITE_ID ) );

		await act( async () => {
			await result.current.generate( {
				window: { unit: 'days', n: 7 },
				length: 'short',
				voicePreset: 'earnest',
			} );
		} );

		// The first poll fires immediately; flush pending promises.
		await act( async () => {} );

		expect( wpcom.req.get ).toHaveBeenCalledWith( {
			path: `/sites/${ SITE_ID }/posts-to-podcast/jobs/7`,
			apiNamespace: 'wpcom/v2',
		} );
		expect( result.current.status ).toBe( 'succeeded' );
		expect( result.current.result ).toEqual( { postId: 99, editUrl: 'https://example.test/edit' } );
		expect( window.localStorage.getItem( storageKey ) ).toBeNull();
	} );

	it( 'polls at 3s while elapsed < 30s, then switches to 10s', async () => {
		wpcom.req.post.mockResolvedValueOnce( { jobId: 1 } );
		for ( let i = 0; i < 12; i++ ) {
			wpcom.req.get.mockResolvedValueOnce( { status: 'pending' } );
		}
		wpcom.req.get.mockResolvedValueOnce( {
			status: 'complete',
			postId: 5,
			editUrl: 'https://e.test/e',
		} );

		const { result } = renderHookWithProvider( () => usePostsToPodcastJob( SITE_ID ) );

		await act( async () => {
			await result.current.generate( {
				window: { unit: 'days', n: 7 },
				length: 'short',
				voicePreset: 'witty',
			} );
		} );

		// Drain the first poll (immediate).
		await act( async () => {} );
		expect( wpcom.req.get ).toHaveBeenCalledTimes( 1 );

		// 3s × 9 advances = 9 more polls (10 total, last at 27s).
		for ( let i = 0; i < 9; i++ ) {
			await act( async () => {
				jest.advanceTimersByTime( 3000 );
			} );
		}
		expect( wpcom.req.get ).toHaveBeenCalledTimes( 10 );

		// Now elapsed ≥ 30s; next scheduled delay should be 10s, not 3s.
		await act( async () => {
			jest.advanceTimersByTime( 3000 );
		} );
		expect( wpcom.req.get ).toHaveBeenCalledTimes( 10 );

		await act( async () => {
			jest.advanceTimersByTime( 7000 );
		} );
		expect( wpcom.req.get ).toHaveBeenCalledTimes( 11 );
	} );
} );

describe( 'usePostsToPodcastJob — failures', () => {
	it( 'transitions to failed when enqueue rejects', async () => {
		wpcom.req.post.mockRejectedValueOnce( new Error( 'network' ) );
		const { result } = renderHookWithProvider( () => usePostsToPodcastJob( SITE_ID ) );

		await act( async () => {
			await result.current.generate( {
				window: { unit: 'days', n: 7 },
				length: 'short',
				voicePreset: 'witty',
			} );
		} );

		expect( result.current.status ).toBe( 'failed' );
		expect( result.current.error.code ).toBe( 'queue-failed' );
		expect( window.localStorage.getItem( storageKey ) ).toBeNull();
	} );

	it( 'transitions to failed when poll returns terminal failed', async () => {
		wpcom.req.post.mockResolvedValueOnce( { jobId: 3 } );
		wpcom.req.get.mockResolvedValueOnce( {
			status: 'failed',
			errorCode: 'upstream-bork',
			message: 'Upstream said no.',
		} );

		const { result } = renderHookWithProvider( () => usePostsToPodcastJob( SITE_ID ) );

		await act( async () => {
			await result.current.generate( {
				window: { unit: 'days', n: 7 },
				length: 'short',
				voicePreset: 'witty',
			} );
		} );
		await act( async () => {} );

		expect( result.current.status ).toBe( 'failed' );
		expect( result.current.error ).toEqual( {
			code: 'upstream-bork',
			message: 'Upstream said no.',
		} );
		expect( window.localStorage.getItem( storageKey ) ).toBeNull();
	} );

	it( 'transitions to failed when poll rejects', async () => {
		wpcom.req.post.mockResolvedValueOnce( { jobId: 4 } );
		wpcom.req.get.mockRejectedValueOnce( new Error( 'network' ) );

		const { result } = renderHookWithProvider( () => usePostsToPodcastJob( SITE_ID ) );

		await act( async () => {
			await result.current.generate( {
				window: { unit: 'days', n: 7 },
				length: 'short',
				voicePreset: 'witty',
			} );
		} );
		await act( async () => {} );

		expect( result.current.status ).toBe( 'failed' );
		expect( result.current.error.code ).toBe( 'poll-failed' );
	} );
} );
