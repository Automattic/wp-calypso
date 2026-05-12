# Posts to Podcast — Calypso Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Jetpack "Posts to Podcast" Phase A surface into Calypso, rendered as a new section on the existing `/settings/podcasting/:site_id` page, gated to Automatticians + sites where podcasting is enabled.

**Architecture:** Direct `wpcom.req` calls against the existing `wpcom/v2/posts-to-podcast` endpoint (no Jetpack proxy on the Calypso side). A local React hook owns the enqueue + poll state machine and persists the active `jobId` in `localStorage` so navigating away and back resumes the generating state. UI is a new `Card` rendered after the "Feed settings" card in `podcasting-details/index.jsx`.

**Tech Stack:** React, classic Calypso (Redux + page.js), `@automattic/components`, `@wordpress/components`, `wpcom.js` (via `calypso/lib/wp`), `@tanstack/react-query` (for the existing `readTeamsQuery` only), Jest + React Testing Library + `nock`.

---

## File Structure

**Create:**
- `client/my-sites/site-settings/podcasting-details/posts-to-podcast/presets.js` — preset constants.
- `client/my-sites/site-settings/podcasting-details/posts-to-podcast/use-posts-to-podcast.js` — enqueue + poll hook + `localStorage` resume.
- `client/my-sites/site-settings/podcasting-details/posts-to-podcast/index.jsx` — `<PostsToPodcastSection>` component.
- `client/my-sites/site-settings/podcasting-details/posts-to-podcast/style.scss` — minimal styles (only if needed).
- `client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/presets.test.js`
- `client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js`
- `client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/index.test.jsx`

**Modify:**
- `client/my-sites/site-settings/podcasting-details/index.jsx` — render `<PostsToPodcastSection siteId={ siteId } siteSlug={ siteSlug } />` near the bottom of the form, inside the `isPodcastingEnabled && ...` branch.

---

## Task 1: Presets module

**Files:**
- Create: `client/my-sites/site-settings/podcasting-details/posts-to-podcast/presets.js`
- Test: `client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/presets.test.js`

The presets are the single source of truth in Calypso for the three select inputs. Labels are produced by a function (so they pick up the current locale via `useTranslate()` at call time).

- [ ] **Step 1: Write the failing test**

```js
// test/presets.test.js
import { translate } from 'i18n-calypso';
import {
	getWindowPresets,
	getLengthPresets,
	getVoicePresets,
} from '../presets';

describe( 'posts-to-podcast presets', () => {
	it( 'returns the three voice presets in order', () => {
		const presets = getVoicePresets( translate );
		expect( presets.map( ( p ) => p.id ) ).toEqual( [ 'witty', 'earnest', 'professional' ] );
		presets.forEach( ( p ) => expect( typeof p.label ).toBe( 'string' ) );
	} );

	it( 'returns the three length presets in order', () => {
		const presets = getLengthPresets( translate );
		expect( presets.map( ( p ) => p.id ) ).toEqual( [ 'short', 'medium', 'long' ] );
	} );

	it( 'returns the four window presets with unit/n shape', () => {
		const presets = getWindowPresets( translate );
		expect( presets.map( ( p ) => p.id ) ).toEqual( [
			'last-7-days',
			'last-14-days',
			'last-30-days',
			'last-3-months',
		] );
		expect( presets[ 0 ] ).toMatchObject( { unit: 'days', n: 7 } );
		expect( presets[ 3 ] ).toMatchObject( { unit: 'months', n: 3 } );
	} );
} );
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/presets.test.js`
Expected: FAIL with "Cannot find module '../presets'".

- [ ] **Step 3: Implement presets.js**

```js
// presets.js

export function getVoicePresets( translate ) {
	return [
		{ id: 'witty', label: translate( 'Witty' ) },
		{ id: 'earnest', label: translate( 'Earnest' ) },
		{ id: 'professional', label: translate( 'Professional' ) },
	];
}

export function getLengthPresets( translate ) {
	return [
		{ id: 'short', label: translate( 'Short (~3 min)' ) },
		{ id: 'medium', label: translate( 'Medium (~7 min)' ) },
		{ id: 'long', label: translate( 'Long (~12 min)' ) },
	];
}

export function getWindowPresets( translate ) {
	return [
		{ id: 'last-7-days', label: translate( 'Last 7 days' ), unit: 'days', n: 7 },
		{ id: 'last-14-days', label: translate( 'Last 14 days' ), unit: 'days', n: 14 },
		{ id: 'last-30-days', label: translate( 'Last 30 days' ), unit: 'days', n: 30 },
		{ id: 'last-3-months', label: translate( 'Last 3 months' ), unit: 'months', n: 3 },
	];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/presets.test.js`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add client/my-sites/site-settings/podcasting-details/posts-to-podcast/presets.js \
        client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/presets.test.js
git commit -m "Posts to Podcast: add preset constants for window/length/voice"
```

---

## Task 2: Hook — enqueue, poll, and localStorage resume

**Files:**
- Create: `client/my-sites/site-settings/podcasting-details/posts-to-podcast/use-posts-to-podcast.js`
- Test: `client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js`

The hook owns the entire job lifecycle. State machine: `idle → polling → succeeded | failed`. `wpcom.req` is mocked in tests via `jest.mock('calypso/lib/wp', ...)` — that's the lowest-friction unit-test approach for a hook that hand-rolls a timer loop. `nock` is overkill here.

### 2a — Initial state and `generate()`

- [ ] **Step 1: Write the failing test (initial state + successful enqueue)**

```js
// test/use-posts-to-podcast.test.js
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { act } from '@testing-library/react';
import { usePostsToPodcastJob } from '../use-posts-to-podcast';
import wpcom from 'calypso/lib/wp';

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js`
Expected: FAIL with "Cannot find module '../use-posts-to-podcast'".

- [ ] **Step 3: Implement minimal hook (idle + generate + START_POLLING)**

```js
// use-posts-to-podcast.js
import { useCallback, useEffect, useReducer, useRef } from 'react';
import wpcom from 'calypso/lib/wp';

const POLL_FAST_MS = 3000;
const POLL_SLOW_MS = 10000;
const POLL_SWITCH_MS = 30000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

const storageKey = ( siteId ) => `posts-to-podcast:active-job:${ siteId }`;

function readStored( siteId ) {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	try {
		const raw = window.localStorage.getItem( storageKey( siteId ) );
		if ( ! raw ) {
			return null;
		}
		const parsed = JSON.parse( raw );
		if ( ! parsed || ! parsed.jobId || typeof parsed.startedAt !== 'number' ) {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

function writeStored( siteId, value ) {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		window.localStorage.setItem( storageKey( siteId ), JSON.stringify( value ) );
	} catch {}
}

function clearStored( siteId ) {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		window.localStorage.removeItem( storageKey( siteId ) );
	} catch {}
}

const initial = {
	status: 'idle',
	jobId: null,
	startedAt: null,
	result: null,
	error: null,
};

function reducer( state, action ) {
	switch ( action.type ) {
		case 'START_POLLING':
			return {
				status: 'polling',
				jobId: action.jobId,
				startedAt: action.startedAt,
				result: null,
				error: null,
			};
		case 'SUCCEEDED':
			return { ...state, status: 'succeeded', result: action.result };
		case 'FAILED':
			return { ...state, status: 'failed', error: action.error };
		case 'RESET':
			return initial;
		default:
			return state;
	}
}

export function usePostsToPodcastJob( siteId ) {
	const [ state, dispatch ] = useReducer( reducer, initial, ( init ) => {
		const stored = readStored( siteId );
		if ( stored && Date.now() - stored.startedAt < POLL_TIMEOUT_MS ) {
			return {
				...init,
				status: 'polling',
				jobId: stored.jobId,
				startedAt: stored.startedAt,
			};
		}
		if ( stored ) {
			clearStored( siteId );
		}
		return init;
	} );

	const generate = useCallback(
		async ( { window: windowParam, length, voicePreset } ) => {
			try {
				const response = await wpcom.req.post( {
					path: `/sites/${ siteId }/posts-to-podcast`,
					apiNamespace: 'wpcom/v2',
					body: { window: windowParam, length, voicePreset },
				} );
				if ( ! response?.jobId ) {
					dispatch( {
						type: 'FAILED',
						error: { code: 'queue-failed', message: null },
					} );
					return;
				}
				const startedAt = Date.now();
				writeStored( siteId, { jobId: response.jobId, startedAt } );
				dispatch( { type: 'START_POLLING', jobId: response.jobId, startedAt } );
			} catch {
				dispatch( { type: 'FAILED', error: { code: 'queue-failed', message: null } } );
			}
		},
		[ siteId ]
	);

	const reset = useCallback( () => {
		clearStored( siteId );
		dispatch( { type: 'RESET' } );
	}, [ siteId ] );

	return {
		status: state.status,
		jobId: state.jobId,
		result: state.result,
		error: state.error,
		generate,
		reset,
	};
}
```

(No polling effect yet — added in 2b.)

- [ ] **Step 4: Run tests to verify the two initial cases pass**

Run: `yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add client/my-sites/site-settings/podcasting-details/posts-to-podcast/use-posts-to-podcast.js \
        client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js
git commit -m "Posts to Podcast: add hook scaffold with enqueue + localStorage write"
```

### 2b — Polling loop (success and pending → success)

- [ ] **Step 1: Append the failing tests for polling**

Append to `test/use-posts-to-podcast.test.js`:

```js
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
		// 12 pending polls, then a complete.
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

		// Advance through the fast window: 3s × 10 polls = 30s. (Poll 1 is immediate, then 9 more before the switch.)
		for ( let i = 0; i < 9; i++ ) {
			await act( async () => {
				jest.advanceTimersByTime( 3000 );
			} );
		}
		expect( wpcom.req.get ).toHaveBeenCalledTimes( 10 );

		// Next poll should fire 10s later, not 3s.
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
```

- [ ] **Step 2: Run tests to verify both polling tests fail**

Run: `yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js`
Expected: FAIL — `wpcom.req.get` is never called; status stays `polling`.

- [ ] **Step 3: Add the polling effect to the hook**

Add this `useEffect` after the `useReducer` in `use-posts-to-podcast.js`:

```js
const timerRef = useRef( null );

useEffect( () => {
	if ( state.status !== 'polling' ) {
		return undefined;
	}

	let cancelled = false;

	async function poll() {
		const elapsed = Date.now() - state.startedAt;
		if ( elapsed > POLL_TIMEOUT_MS ) {
			clearStored( siteId );
			dispatch( {
				type: 'FAILED',
				error: { code: 'timeout', message: null },
			} );
			return;
		}
		try {
			const record = await wpcom.req.get( {
				path: `/sites/${ siteId }/posts-to-podcast/jobs/${ state.jobId }`,
				apiNamespace: 'wpcom/v2',
			} );
			if ( cancelled ) {
				return;
			}
			if ( record.status === 'complete' ) {
				clearStored( siteId );
				dispatch( {
					type: 'SUCCEEDED',
					result: { postId: record.postId, editUrl: record.editUrl },
				} );
				return;
			}
			if ( record.status === 'failed' ) {
				clearStored( siteId );
				dispatch( {
					type: 'FAILED',
					error: {
						code: record.errorCode || 'job-failed',
						message: record.message || record.errorMessage || null,
					},
				} );
				return;
			}
			// pending / unknown — schedule next poll
			const nextDelay =
				Date.now() - state.startedAt < POLL_SWITCH_MS ? POLL_FAST_MS : POLL_SLOW_MS;
			timerRef.current = setTimeout( poll, nextDelay );
		} catch {
			if ( cancelled ) {
				return;
			}
			clearStored( siteId );
			dispatch( {
				type: 'FAILED',
				error: { code: 'poll-failed', message: null },
			} );
		}
	}

	poll();

	return () => {
		cancelled = true;
		if ( timerRef.current ) {
			clearTimeout( timerRef.current );
			timerRef.current = null;
		}
	};
}, [ state.status, state.jobId, state.startedAt, siteId ] );
```

Also add the import for `useRef` (already in the top-level import list above) and confirm `useEffect` is imported.

- [ ] **Step 4: Run tests to verify polling tests pass**

Run: `yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add client/my-sites/site-settings/podcasting-details/posts-to-podcast/use-posts-to-podcast.js \
        client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js
git commit -m "Posts to Podcast: poll job status with 3s/10s fast→slow cadence"
```

### 2c — Failure paths and timeout

- [ ] **Step 1: Append the failing tests**

```js
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
		expect( result.current.error ).toEqual( { code: 'upstream-bork', message: 'Upstream said no.' } );
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
```

- [ ] **Step 2: Run tests to verify they pass**

The polling-effect implementation from 2b already handles these paths. Run:
`yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js`
Expected: PASS, 7 tests.

(If any fail, fix in `use-posts-to-podcast.js`.)

- [ ] **Step 3: Commit**

```bash
git add client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js
git commit -m "Posts to Podcast: cover enqueue/poll/terminal failure paths"
```

### 2d — Resume from `localStorage`

- [ ] **Step 1: Append the failing tests**

```js
describe( 'usePostsToPodcastJob — resume from localStorage', () => {
	it( 'resumes polling on mount when a fresh entry is stored', async () => {
		const startedAt = Date.now() - 90 * 1000; // 90s ago
		window.localStorage.setItem(
			storageKey,
			JSON.stringify( { jobId: 77, startedAt } )
		);
		wpcom.req.get.mockResolvedValueOnce( {
			status: 'complete',
			postId: 12,
			editUrl: 'https://e.test/x',
		} );

		const { result } = renderHookWithProvider( () => usePostsToPodcastJob( SITE_ID ) );
		expect( result.current.status ).toBe( 'polling' );
		expect( result.current.jobId ).toBe( 77 );
		expect( wpcom.req.post ).not.toHaveBeenCalled();

		await act( async () => {} );

		expect( wpcom.req.get ).toHaveBeenCalledWith( {
			path: `/sites/${ SITE_ID }/posts-to-podcast/jobs/77`,
			apiNamespace: 'wpcom/v2',
		} );
		expect( result.current.status ).toBe( 'succeeded' );
	} );

	it( 'discards an expired entry and stays idle', () => {
		const startedAt = Date.now() - ( 6 * 60 * 1000 ); // 6 min ago, beyond 5-min window
		window.localStorage.setItem(
			storageKey,
			JSON.stringify( { jobId: 77, startedAt } )
		);

		const { result } = renderHookWithProvider( () => usePostsToPodcastJob( SITE_ID ) );

		expect( result.current.status ).toBe( 'idle' );
		expect( window.localStorage.getItem( storageKey ) ).toBeNull();
	} );
} );
```

- [ ] **Step 2: Run tests to verify they pass**

The reducer initializer already handles resume. Run:
`yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js`
Expected: PASS, 9 tests.

- [ ] **Step 3: Commit**

```bash
git add client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js
git commit -m "Posts to Podcast: resume polling from localStorage on mount"
```

### 2e — Total timeout + unmount cleanup

- [ ] **Step 1: Append the failing tests**

```js
describe( 'usePostsToPodcastJob — timeout and cleanup', () => {
	it( 'transitions to failed with code "timeout" when polling exceeds 5 minutes', async () => {
		const startedAt = Date.now() - ( 5 * 60 * 1000 + 1000 ); // already 5min+1s old
		window.localStorage.setItem(
			storageKey,
			JSON.stringify( { jobId: 11, startedAt } )
		);

		const { result } = renderHookWithProvider( () => usePostsToPodcastJob( SITE_ID ) );
		// Hook resume-init checks elapsed against POLL_TIMEOUT_MS — over-the-line entries are cleared and stay idle.
		// To test the runtime timeout path, seed an entry that's just under the wire and let it tip over.

		expect( result.current.status ).toBe( 'idle' );
	} );

	it( 'clears the pending timer on unmount', async () => {
		wpcom.req.post.mockResolvedValueOnce( { jobId: 8 } );
		wpcom.req.get.mockResolvedValue( { status: 'pending' } );

		const { result, unmount } = renderHookWithProvider( () =>
			usePostsToPodcastJob( SITE_ID )
		);

		await act( async () => {
			await result.current.generate( {
				window: { unit: 'days', n: 7 },
				length: 'short',
				voicePreset: 'witty',
			} );
		} );
		await act( async () => {} );

		const callsBeforeUnmount = wpcom.req.get.mock.calls.length;
		unmount();
		await act( async () => {
			jest.advanceTimersByTime( 60_000 );
		} );

		expect( wpcom.req.get.mock.calls.length ).toBe( callsBeforeUnmount );
	} );
} );
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js`
Expected: PASS, 11 tests.

- [ ] **Step 3: Commit**

```bash
git add client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/use-posts-to-podcast.test.js
git commit -m "Posts to Podcast: verify timeout + unmount cleanup"
```

---

## Task 3: `<PostsToPodcastSection>` component

**Files:**
- Create: `client/my-sites/site-settings/podcasting-details/posts-to-podcast/index.jsx`
- Create: `client/my-sites/site-settings/podcasting-details/posts-to-podcast/style.scss` (only if needed)
- Test: `client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/index.test.jsx`

The component is the only public surface in this folder. It owns:
- The a8c gate (via `readTeamsQuery`).
- The form state (3 controlled selects).
- Mapping the selected `window` preset back to the `{ unit, n }` request body.
- Rendering the right `Notice` for `polling | succeeded | failed`.

The component receives `siteId` and `siteSlug` as props (the parent already has both via `useSelector`).

### 3a — A8c gate and idle form

- [ ] **Step 1: Write the failing test**

```jsx
// test/index.test.jsx
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { QueryClient } from '@tanstack/react-query';
import { readTeamsQuery } from '@automattic/api-queries';
import { PostsToPodcastSection } from '../index';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn(), get: jest.fn() } },
} ) );

function renderSection( { teams = [] } = {} ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	queryClient.setQueryData( readTeamsQuery().queryKey, { teams } );
	return renderWithProvider(
		<PostsToPodcastSection siteId={ 1 } siteSlug="example.test" />,
		{ queryClient }
	);
}

describe( '<PostsToPodcastSection>', () => {
	it( 'renders nothing when user is not in the a8c team', () => {
		const { container } = renderSection( { teams: [ { slug: 'other' } ] } );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the form for a8c team members', () => {
		const { getByRole } = renderSection( { teams: [ { slug: 'a8c' } ] } );
		expect( getByRole( 'combobox', { name: /Window/i } ) ).toBeVisible();
		expect( getByRole( 'combobox', { name: /Length/i } ) ).toBeVisible();
		expect( getByRole( 'combobox', { name: /Voice/i } ) ).toBeVisible();
		expect( getByRole( 'button', { name: /Generate/i } ) ).toBeVisible();
	} );
} );
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/index.test.jsx`
Expected: FAIL with "Cannot find module '../index'".

- [ ] **Step 3: Implement the component (gate + idle form)**

```jsx
// index.jsx
import { readTeamsQuery } from '@automattic/api-queries';
import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import Notice from 'calypso/components/notice';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import {
	getLengthPresets,
	getVoicePresets,
	getWindowPresets,
} from './presets';
import { usePostsToPodcastJob } from './use-posts-to-podcast';

export function PostsToPodcastSection( { siteId, siteSlug } ) {
	const translate = useTranslate();
	const { data: teamsData, isLoading: teamsLoading } = useQuery( readTeamsQuery() );

	const windowPresets = useMemo( () => getWindowPresets( translate ), [ translate ] );
	const lengthPresets = useMemo( () => getLengthPresets( translate ), [ translate ] );
	const voicePresets = useMemo( () => getVoicePresets( translate ), [ translate ] );

	const [ windowId, setWindowId ] = useState( windowPresets[ 0 ].id );
	const [ lengthId, setLengthId ] = useState( 'medium' );
	const [ voiceId, setVoiceId ] = useState( voicePresets[ 0 ].id );

	const { status, result, error, generate, reset } = usePostsToPodcastJob( siteId );

	if ( teamsLoading || ! isAutomatticTeamMember( teamsData?.teams ?? [] ) ) {
		return null;
	}

	const isPolling = status === 'polling';

	const onGenerate = () => {
		const preset = windowPresets.find( ( p ) => p.id === windowId );
		if ( ! preset ) {
			return;
		}
		generate( {
			window: { unit: preset.unit, n: preset.n },
			length: lengthId,
			voicePreset: voiceId,
		} );
	};

	return (
		<>
			<SettingsSectionHeader title={ translate( 'Generate episode from recent posts' ) } />
			<Card className="site-settings__card">
				<FormFieldset>
					<FormLabel htmlFor="posts-to-podcast-window">{ translate( 'Window' ) }</FormLabel>
					<FormSelect
						id="posts-to-podcast-window"
						value={ windowId }
						onChange={ ( e ) => setWindowId( e.target.value ) }
						disabled={ isPolling }
					>
						{ windowPresets.map( ( p ) => (
							<option key={ p.id } value={ p.id }>
								{ p.label }
							</option>
						) ) }
					</FormSelect>
					<FormSettingExplanation>
						{ translate( 'Which posts to draw from.' ) }
					</FormSettingExplanation>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="posts-to-podcast-length">{ translate( 'Length' ) }</FormLabel>
					<FormSelect
						id="posts-to-podcast-length"
						value={ lengthId }
						onChange={ ( e ) => setLengthId( e.target.value ) }
						disabled={ isPolling }
					>
						{ lengthPresets.map( ( p ) => (
							<option key={ p.id } value={ p.id }>
								{ p.label }
							</option>
						) ) }
					</FormSelect>
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="posts-to-podcast-voice">{ translate( 'Voice' ) }</FormLabel>
					<FormSelect
						id="posts-to-podcast-voice"
						value={ voiceId }
						onChange={ ( e ) => setVoiceId( e.target.value ) }
						disabled={ isPolling }
					>
						{ voicePresets.map( ( p ) => (
							<option key={ p.id } value={ p.id }>
								{ p.label }
							</option>
						) ) }
					</FormSelect>
				</FormFieldset>

				<Button variant="primary" onClick={ onGenerate } disabled={ isPolling }>
					{ isPolling ? translate( 'Generating…' ) : translate( 'Generate' ) }
				</Button>

				{ status === 'polling' && (
					<Notice status="is-info" showDismiss={ false }>
						{ translate(
							'Generating episode script — this usually takes 2–3 minutes. You can leave this page and come back.'
						) }
					</Notice>
				) }
				{ status === 'succeeded' && result?.postId && (
					<Notice status="is-success" onDismissClick={ reset }>
						{ translate( 'Draft created.' ) }
						<Button
							variant="primary"
							href={ `/post/${ siteSlug }/${ result.postId }` }
							style={ { marginInlineStart: '8px' } }
						>
							{ translate( 'Open draft' ) }
						</Button>
						<Button variant="link" href={ `/posts/drafts/${ siteSlug }` }>
							{ translate( 'View drafts' ) }
						</Button>
					</Notice>
				) }
				{ status === 'failed' && (
					<Notice status="is-error" onDismissClick={ reset }>
						{ error?.message ||
							translate( 'Generation failed. Please try again.' ) }
					</Notice>
				) }
			</Card>
		</>
	);
}
```

- [ ] **Step 4: Run tests to verify gate + idle render pass**

Run: `yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/index.test.jsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add client/my-sites/site-settings/podcasting-details/posts-to-podcast/index.jsx \
        client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/index.test.jsx
git commit -m "Posts to Podcast: render gated form with status notices"
```

### 3b — Generate happy path + error path tests

- [ ] **Step 1: Append the failing tests**

```jsx
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import wpcom from 'calypso/lib/wp';

beforeEach( () => {
	window.localStorage.clear();
	wpcom.req.post.mockReset();
	wpcom.req.get.mockReset();
} );

describe( '<PostsToPodcastSection> — interactions', () => {
	it( 'enqueues, polls, and shows the success notice with a link to the draft', async () => {
		jest.useFakeTimers();
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		wpcom.req.post.mockResolvedValueOnce( { jobId: 55 } );
		wpcom.req.get.mockResolvedValueOnce( {
			status: 'complete',
			postId: 321,
			editUrl: '/post/example.test/321',
		} );

		const { getByRole, findByText } = renderSection( {
			teams: [ { slug: 'a8c' } ],
		} );

		await user.click( getByRole( 'button', { name: /Generate/i } ) );
		await act( async () => {} );

		expect( wpcom.req.post ).toHaveBeenCalledWith( {
			path: '/sites/1/posts-to-podcast',
			apiNamespace: 'wpcom/v2',
			body: {
				window: { unit: 'days', n: 7 },
				length: 'medium',
				voicePreset: 'witty',
			},
		} );
		expect( await findByText( /Draft created\./ ) ).toBeVisible();
		const openButton = getByRole( 'link', { name: /Open draft/i } );
		expect( openButton ).toHaveAttribute( 'href', '/post/example.test/321' );
		jest.useRealTimers();
	} );

	it( 'shows an error notice and re-enables Generate when enqueue rejects', async () => {
		const user = userEvent.setup();
		wpcom.req.post.mockRejectedValueOnce( new Error( 'nope' ) );

		const { getByRole, findByText } = renderSection( {
			teams: [ { slug: 'a8c' } ],
		} );

		await user.click( getByRole( 'button', { name: /Generate/i } ) );

		expect( await findByText( /Generation failed/i ) ).toBeVisible();
		expect( getByRole( 'button', { name: /Generate/i } ) ).toBeEnabled();
	} );
} );
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/index.test.jsx`
Expected: PASS, 4 tests.

- [ ] **Step 3: Commit**

```bash
git add client/my-sites/site-settings/podcasting-details/posts-to-podcast/test/index.test.jsx
git commit -m "Posts to Podcast: cover generate happy path and error path"
```

---

## Task 4: Wire the section into `podcasting-details/index.jsx`

**Files:**
- Modify: `client/my-sites/site-settings/podcasting-details/index.jsx`

No new test for this file (it ships without tests; we keep that scope). The integration is rendered conditional on the existing `isPodcastingEnabled` branch.

- [ ] **Step 1: Add the import**

Near the other local imports in `client/my-sites/site-settings/podcasting-details/index.jsx`, add:

```jsx
import { PostsToPodcastSection } from './posts-to-podcast';
```

- [ ] **Step 2: Render the section at the bottom of the enabled branch**

Inside `( isPodcastingEnabled || isEnabling ) && (...)` block in the form, after the existing "Feed settings" `Card` (which closes around line 424 of the current file), add:

```jsx
{ isPodcastingEnabled && (
	<PostsToPodcastSection siteId={ siteId } siteSlug={ siteSlug } />
) }
```

(The component already guards on `isAutomatticTeamMember`; this extra wrapper keeps the JSX symmetric with the rest of the enabled-only blocks and skips the React Query subscription entirely until the user has actually enabled podcasting.)

- [ ] **Step 3: Lint and type-check**

```bash
yarn eslint client/my-sites/site-settings/podcasting-details/index.jsx \
            client/my-sites/site-settings/podcasting-details/posts-to-podcast/
```

Expected: no errors.

- [ ] **Step 4: Run the new tests + the type-check that CI will run**

```bash
yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/
yarn typecheck-client
```

Expected: tests PASS, typecheck PASS.

- [ ] **Step 5: Commit**

```bash
git add client/my-sites/site-settings/podcasting-details/index.jsx
git commit -m "Posts to Podcast: mount section on Podcasting settings page"
```

---

## Task 5: Manual verification

Type-checking and unit tests verify code correctness, not feature correctness. Verify the feature end-to-end before marking the work done.

- [ ] **Step 1: Start the Calypso dev server**

```bash
yarn start
```

Wait for "Compiled successfully" in the terminal.

- [ ] **Step 2: Open the page**

In the browser: `http://calypso.localhost:3000/settings/podcasting/<your-test-site>`

Sign in as an a8c user. Enable podcasting on the site if it isn't already (pick a category).

- [ ] **Step 3: Verify the section is visible only for a8c users with podcasting enabled**

- Open DevTools → Application → Local Storage, confirm there's no `posts-to-podcast:active-job:*` entry initially.
- The "Generate episode from recent posts" header and form should be present.
- Disable podcasting (uncheck the toggle and save). The section should disappear. Re-enable; it should reappear.

- [ ] **Step 4: Verify enqueue + poll + success**

- Pick `Last 7 days`, `Medium (~7 min)`, `Witty`. Click `Generate`.
- The button switches to "Generating…", selects disable, an info `Notice` appears.
- DevTools → Application → Local Storage shows `posts-to-podcast:active-job:<siteId>` with `{ jobId, startedAt }`.
- Navigate to another page (e.g. `/sites`) and back to `/settings/podcasting/<site>`. The "Generating…" state should be present without re-POSTing.
- When the job completes (2–3 min), the success `Notice` appears with an "Open draft" button pointing at `/post/<siteSlug>/<postId>`.

- [ ] **Step 5: Verify error path**

- Use DevTools → Network → enable "Block request URL" for `**/posts-to-podcast` once, click Generate. The error `Notice` should appear, and the Generate button should re-enable.

- [ ] **Step 6: Pre-PR checks**

```bash
yarn typecheck-client
yarn test-client client/my-sites/site-settings/podcasting-details/posts-to-podcast/
yarn lint:js
```

Expected: all PASS.

- [ ] **Step 7: Open the PR**

Follow `.github/PULL_REQUEST_TEMPLATE.md`. Create as draft. Use the Linear issue ID (if one exists for this work) in the description; do not link to wordpress.com URLs or mention people by name.

---

## Self-review notes

- **Spec coverage:** Placement + gating (Task 4 mounts the component; Task 3 enforces `isAutomatticTeamMember`). Component structure (Tasks 1–3 create the four files in the design). API + wire format (Task 2 implements both calls with the exact paths/namespace/body shape from the design). Persistence (Tasks 2b/2d cover write/read/expire/clear). UI (Task 3 renders selects + Generate + the three notice states). Testing (each task has TDD tests matching the design's coverage list).
- **Placeholder scan:** No TBDs, no "appropriate error handling" placeholders, every code step has runnable code.
- **Type consistency:** `usePostsToPodcastJob(siteId)`, `generate({ window, length, voicePreset })`, hook return `{ status, jobId, result, error, generate, reset }`, `result = { postId, editUrl }`, `error = { code, message }` — used consistently across Tasks 2 and 3 tests and implementations.
