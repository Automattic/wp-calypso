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
