# Image Studio: Share as Instagram Reel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Share as Instagram Reel" CTA below the generated-video preview in Image Studio's Feature Clip flow. Clicking it routes the just-generated MP4 into Jetpack Social's existing Reels publishing path — only to Instagram, only when the current post is already published.

**Architecture:** Pure-frontend change inside `packages/image-studio`. The CTA writes `attached_media` + `media_source: 'upload-video'` to post-meta via `core/editor`'s `editPost`, then dispatches the existing `shareCurrentPost` thunk on the `jetpack-social-plugin` store with `skipped_connections` set to all non-Instagram services. No new wpcom REST endpoints, no server-side code. Cross-bundle access via `@wordpress/data` selectors/dispatchers and a single typed read from `window.JetpackScriptData`. See `docs/superpowers/specs/2026-05-04-image-studio-share-as-instagram-reel-design.md`.

**Tech Stack:** TypeScript, React, `@wordpress/data`, `@wordpress/components`, `@wordpress/editor`, Jest + `@testing-library/react`. Image Studio's existing `recordImageStudioEvent` for telemetry; existing `ImageStudioNotice` (driven by `addNotice` store action) for user-facing notices.

---

## File Structure

| File | Status | Purpose |
|---|---|---|
| `packages/image-studio/src/utils/tracking.ts` | modify | Add `trackImageStudioReelShare*` event helpers |
| `packages/image-studio/src/utils/tracking.test.ts` *(if absent, do not create — see Task 1)* | modify-or-skip | Existing coverage — add cases for new helpers if file exists |
| `packages/image-studio/src/utils/jetpack-script-data.ts` | create | Typed helper to read `window.JetpackScriptData?.social?.api_paths?.resharePost` |
| `packages/image-studio/src/utils/jetpack-script-data.test.ts` | create | Unit test for the helper |
| `packages/image-studio/src/hooks/use-reel-share/index.ts` | create | Core hook — selectors, pre-checks, click handler, telemetry |
| `packages/image-studio/src/hooks/use-reel-share/index.test.ts` | create | Hook unit tests |
| `packages/image-studio/src/components/generate-layout/share-reel-action/index.tsx` | create | Thin renderer component |
| `packages/image-studio/src/components/generate-layout/share-reel-action/index.test.tsx` | create | Component test |
| `packages/image-studio/src/components/generate-layout/share-reel-action/style.scss` | create | Component styles |
| `packages/image-studio/src/components/generate-layout/index.tsx` | modify | Render `<ShareReelAction />` below the `<video>` |

---

## Task 1: Add tracking helpers for Reel share events

**Why first:** Pure-additive utility code, no dependencies on other tasks. Lets later tasks call into stable APIs.

**Files:**
- Modify: `packages/image-studio/src/utils/tracking.ts` (append new exports near other `trackImageStudio*` exports, after the last `trackImageStudio*` function)
- Modify: `packages/image-studio/src/utils/tracking.test.ts` (add a `describe` block for the new helpers)

- [ ] **Step 1: Add the `trackImageStudioReelShare*` functions**

Append the following block at the end of `packages/image-studio/src/utils/tracking.ts`, after the last existing `trackImageStudio*` export:

```ts
/**
 * Tracks when the Reel share button is clicked, before any pre-checks run.
 * @param options                  - Tracking options
 * @param options.attachmentId     - The video attachment ID
 * @param options.durationSeconds  - Optional duration of the clip in seconds
 */
export function trackImageStudioReelShareClicked( {
	attachmentId,
	durationSeconds,
}: {
	attachmentId: number;
	durationSeconds?: number | null;
} ): void {
	const properties: Record< string, string | number > = { attachment_id: attachmentId };
	if ( durationSeconds ) {
		properties.duration_seconds = durationSeconds;
	}
	recordImageStudioEvent( 'image_studio_reel_share_clicked', properties );
}

/**
 * Tracks when the Reel share is blocked by a missing Instagram Business connection.
 */
export function trackImageStudioReelShareNotConnected(): void {
	recordImageStudioEvent( 'image_studio_reel_share_not_connected' );
}

/**
 * Tracks when the Reel share is blocked because the post isn't published yet.
 */
export function trackImageStudioReelShareNotPublished(): void {
	recordImageStudioEvent( 'image_studio_reel_share_post_not_published' );
}

/**
 * Tracks when the Reel share is blocked by missing video state (defensive).
 */
export function trackImageStudioReelShareInvalidState(): void {
	recordImageStudioEvent( 'image_studio_reel_share_invalid_state' );
}

/**
 * Tracks when shareCurrentPost successfully dispatched the IG submission.
 */
export function trackImageStudioReelShareDispatched(): void {
	recordImageStudioEvent( 'image_studio_reel_share_dispatched' );
}

/**
 * Tracks when shareCurrentPost returned false or threw.
 * @param errorMessage - Optional error description from the thunk/exception.
 */
export function trackImageStudioReelShareFailed( errorMessage?: string ): void {
	const properties: Record< string, string | number > = {};
	if ( errorMessage ) {
		properties.error_message = errorMessage;
	}
	recordImageStudioEvent( 'image_studio_reel_share_failed', properties );
}
```

- [ ] **Step 2: Add tests for the new helpers**

Append the following `describe` block to the end of `packages/image-studio/src/utils/tracking.test.ts`. Add `trackImageStudioReelShareClicked`, `trackImageStudioReelShareNotConnected`, `trackImageStudioReelShareNotPublished`, `trackImageStudioReelShareInvalidState`, `trackImageStudioReelShareDispatched`, and `trackImageStudioReelShareFailed` to the existing `import` line at the top of the file (alongside the existing `trackImageStudioOpened`/`trackImageStudioClosed` imports).

```ts
describe( 'reel share tracking helpers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		selectMock.mockReturnValue( {
			getEntryPoint: jest.fn( () => 'post_editor_feature_clip' ),
		} );
	} );

	it( 'fires reel_share_clicked with attachment_id and duration_seconds', () => {
		trackImageStudioReelShareClicked( { attachmentId: 555, durationSeconds: 12 } );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_clicked',
			expect.objectContaining( { attachment_id: 555, duration_seconds: 12 } )
		);
	} );

	it( 'fires reel_share_clicked without duration_seconds when not provided', () => {
		trackImageStudioReelShareClicked( { attachmentId: 555 } );
		const call = recordTracksEventMock.mock.calls[ 0 ];
		expect( call[ 0 ] ).toBe( 'jetpack_big_sky_image_studio_reel_share_clicked' );
		expect( call[ 1 ] ).not.toHaveProperty( 'duration_seconds' );
	} );

	it( 'fires reel_share_not_connected', () => {
		trackImageStudioReelShareNotConnected();
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_not_connected',
			expect.any( Object )
		);
	} );

	it( 'fires reel_share_post_not_published', () => {
		trackImageStudioReelShareNotPublished();
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_post_not_published',
			expect.any( Object )
		);
	} );

	it( 'fires reel_share_invalid_state', () => {
		trackImageStudioReelShareInvalidState();
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_invalid_state',
			expect.any( Object )
		);
	} );

	it( 'fires reel_share_dispatched', () => {
		trackImageStudioReelShareDispatched();
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_dispatched',
			expect.any( Object )
		);
	} );

	it( 'fires reel_share_failed with error_message when provided', () => {
		trackImageStudioReelShareFailed( 'boom' );
		expect( recordTracksEventMock ).toHaveBeenCalledWith(
			'jetpack_big_sky_image_studio_reel_share_failed',
			expect.objectContaining( { error_message: 'boom' } )
		);
	} );

	it( 'fires reel_share_failed without error_message when omitted', () => {
		trackImageStudioReelShareFailed();
		const call = recordTracksEventMock.mock.calls[ 0 ];
		expect( call[ 0 ] ).toBe( 'jetpack_big_sky_image_studio_reel_share_failed' );
		expect( call[ 1 ] ).not.toHaveProperty( 'error_message' );
	} );
} );
```

- [ ] **Step 3: Run tests and type-check**

```bash
yarn jest --rootDir packages/image-studio --runTestsByPath packages/image-studio/src/utils/tracking.test.ts
cd packages/image-studio && npx tsc --noEmit
```
Expected: tests pass, zero TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add packages/image-studio/src/utils/tracking.ts packages/image-studio/src/utils/tracking.test.ts
git commit -m "Image Studio: add tracking helpers for Reel share events"
```

---

## Task 2: Add a typed helper to read the Jetpack Social `resharePost` API path

**Why:** Image Studio runs in a separate bundle and intentionally avoids importing from `@automattic/jetpack-script-data`. The `share-post` API path is injected at runtime as `window.JetpackScriptData?.social?.api_paths?.resharePost`. Encapsulate the global access in one typed helper so the rest of the code stays clean and a single comment explains the global dependency.

**Files:**
- Create: `packages/image-studio/src/utils/jetpack-script-data.ts`
- Create: `packages/image-studio/src/utils/jetpack-script-data.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/image-studio/src/utils/jetpack-script-data.test.ts`:

```ts
import { getReelSharePostPath } from './jetpack-script-data';

describe( 'getReelSharePostPath', () => {
	const originalScriptData = ( window as unknown as { JetpackScriptData?: unknown } )
		.JetpackScriptData;

	afterEach( () => {
		( window as unknown as { JetpackScriptData?: unknown } ).JetpackScriptData =
			originalScriptData;
	} );

	it( 'returns null when window.JetpackScriptData is undefined', () => {
		( window as unknown as { JetpackScriptData?: unknown } ).JetpackScriptData = undefined;
		expect( getReelSharePostPath() ).toBeNull();
	} );

	it( 'returns null when social.api_paths.resharePost is missing', () => {
		( window as unknown as { JetpackScriptData?: unknown } ).JetpackScriptData = {
			social: { api_paths: {} },
		};
		expect( getReelSharePostPath() ).toBeNull();
	} );

	it( 'returns the resharePost path string when present', () => {
		( window as unknown as { JetpackScriptData?: unknown } ).JetpackScriptData = {
			social: { api_paths: { resharePost: '/wpcom/v2/publicize/share-post/{postId}' } },
		};
		expect( getReelSharePostPath() ).toBe( '/wpcom/v2/publicize/share-post/{postId}' );
	} );

	it( 'returns null when the path is a non-string value', () => {
		( window as unknown as { JetpackScriptData?: unknown } ).JetpackScriptData = {
			social: { api_paths: { resharePost: 42 } },
		};
		expect( getReelSharePostPath() ).toBeNull();
	} );
} );
```

- [ ] **Step 2: Run the test to verify it fails**

Run from the repo root:
```bash
yarn jest --rootDir packages/image-studio --runTestsByPath packages/image-studio/src/utils/jetpack-script-data.test.ts
```
Expected: FAIL with "Cannot find module './jetpack-script-data'".

- [ ] **Step 3: Write the minimal implementation**

Create `packages/image-studio/src/utils/jetpack-script-data.ts`:

```ts
/**
 * Read the Jetpack Social "reshare post" REST path from the global script-data
 * blob that Jetpack injects on pages where Jetpack Social is loaded.
 *
 * Image Studio runs in its own bundle and intentionally avoids importing from
 * @automattic/jetpack-script-data. Encapsulating the window read here keeps the
 * global dependency in one place and lets callers branch on `null` cleanly.
 *
 * @returns The path template (e.g. `/wpcom/v2/publicize/share-post/{postId}`)
 *          or `null` if Jetpack Social isn't available on this page.
 */
export function getReelSharePostPath(): string | null {
	const scriptData = ( window as unknown as {
		JetpackScriptData?: { social?: { api_paths?: { resharePost?: unknown } } };
	} ).JetpackScriptData;

	const path = scriptData?.social?.api_paths?.resharePost;
	return typeof path === 'string' && path.length > 0 ? path : null;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
yarn jest --rootDir packages/image-studio --runTestsByPath packages/image-studio/src/utils/jetpack-script-data.test.ts
```
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add packages/image-studio/src/utils/jetpack-script-data.ts packages/image-studio/src/utils/jetpack-script-data.test.ts
git commit -m "Image Studio: add helper to read Jetpack Social resharePost path"
```

---

## Task 3: Add the `useReelShare` hook (core logic)

**Why this size:** All cross-bundle wiring, pre-check pipeline, click handler, and telemetry sit in one hook. The component in Task 4 stays a thin renderer. Tests cover every branch of the pre-check pipeline plus happy path and failure cases.

**Files:**
- Create: `packages/image-studio/src/hooks/use-reel-share/index.ts`
- Create: `packages/image-studio/src/hooks/use-reel-share/index.test.ts`

### What the hook returns

```ts
type ReelShareReason =
	| 'no-connection'
	| 'post-not-published'
	| 'no-video'
	| 'no-script-data';

interface UseReelShareReturn {
	canShare: boolean;
	reason: ReelShareReason | null;
	isVisible: boolean;
	isSharing: boolean;
	handleShare: () => Promise< void >;
}
```

`isVisible` is the architectural visibility gate (entry point + script-data presence + non-empty video state). `canShare` is the click-time pre-check result, exposed for tests. `reason` is the first failing pre-check (advisory). The component reads `isVisible` to decide whether to render at all, and `isSharing` to disable the button while a share is in flight.

### Pre-check order (first failure wins)

1. `currentVideoUrl` is empty or `currentAttachmentId` is null → `reason = 'no-video'`
2. `getReelSharePostPath()` returns null → `reason = 'no-script-data'` (and `isVisible` is false, so this is mostly defensive)
3. No active `instagram-business` connection in `jetpack-social-plugin` store → `reason = 'no-connection'`
4. `isCurrentPostPublished()` is false → `reason = 'post-not-published'`
5. Otherwise → `canShare = true, reason = null`

- [ ] **Step 1: Write the failing tests**

Create `packages/image-studio/src/hooks/use-reel-share/index.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react';
import { useReelShare } from './index';

// Tracking spies
const mockTrackClicked = jest.fn();
const mockTrackNotConnected = jest.fn();
const mockTrackNotPublished = jest.fn();
const mockTrackInvalidState = jest.fn();
const mockTrackDispatched = jest.fn();
const mockTrackFailed = jest.fn();

// Store action spies
const mockEditPost = jest.fn();
const mockShareCurrentPost = jest.fn();
const mockAddNotice = jest.fn();

// Selector state — mutable per-test
type Connection = { connection_id: string; service_name: string; enabled: boolean };

let mockState: {
	currentVideoUrl: string | null;
	currentAttachmentId: number | null;
	currentDurationSeconds: number | null;
	entryPoint: string;
	currentPostId: number | null;
	isCurrentPostPublished: boolean;
	currentMeta: Record< string, unknown >;
	connections: Connection[];
	isSharingCurrentPost: boolean;
};

let mockReelSharePath: string | null;

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( ( selector ) => {
		return selector( ( storeName: string ) => {
			if ( storeName === 'video-studio' ) {
				return {
					getCurrentVideoUrl: () => mockState.currentVideoUrl,
					getCurrentAttachmentId: () => mockState.currentAttachmentId,
					getCurrentDurationSeconds: () => mockState.currentDurationSeconds,
				};
			}
			if ( storeName === 'image-studio' ) {
				return {
					getEntryPoint: () => mockState.entryPoint,
				};
			}
			if ( storeName === 'core/editor' ) {
				return {
					getCurrentPostId: () => mockState.currentPostId,
					isCurrentPostPublished: () => mockState.isCurrentPostPublished,
					getEditedPostAttribute: ( attr: string ) =>
						attr === 'meta' ? mockState.currentMeta : undefined,
				};
			}
			if ( storeName === 'jetpack-social-plugin' ) {
				return {
					getConnections: () => mockState.connections,
					isSharingCurrentPost: () => mockState.isSharingCurrentPost,
				};
			}
			return {};
		} );
	} ),
	useDispatch: jest.fn( ( storeName: string ) => {
		if ( storeName === 'core/editor' ) {
			return { editPost: mockEditPost };
		}
		if ( storeName === 'jetpack-social-plugin' ) {
			return { shareCurrentPost: mockShareCurrentPost };
		}
		if ( storeName === 'image-studio' ) {
			return { addNotice: mockAddNotice };
		}
		return {};
	} ),
} ) );

jest.mock( '@wordpress/element', () => ( {
	useCallback: ( fn: ( ...args: unknown[] ) => unknown ) => fn,
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
	sprintf: ( format: string, ...args: unknown[] ) =>
		format.replace( /%s/g, () => String( args.shift() ) ),
} ) );

jest.mock( '../../utils/jetpack-script-data', () => ( {
	getReelSharePostPath: jest.fn( () => mockReelSharePath ),
} ) );

jest.mock( '../../utils/tracking', () => ( {
	trackImageStudioReelShareClicked: ( ...args: unknown[] ) => mockTrackClicked( ...args ),
	trackImageStudioReelShareNotConnected: () => mockTrackNotConnected(),
	trackImageStudioReelShareNotPublished: () => mockTrackNotPublished(),
	trackImageStudioReelShareInvalidState: () => mockTrackInvalidState(),
	trackImageStudioReelShareDispatched: () => mockTrackDispatched(),
	trackImageStudioReelShareFailed: ( ...args: unknown[] ) => mockTrackFailed( ...args ),
} ) );

const igConnection: Connection = {
	connection_id: '1001',
	service_name: 'instagram-business',
	enabled: true,
};
const twitterConnection: Connection = {
	connection_id: '1002',
	service_name: 'twitter',
	enabled: true,
};

describe( 'useReelShare', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockReelSharePath = '/wpcom/v2/publicize/share-post/{postId}';
		mockState = {
			currentVideoUrl: 'https://example.com/clip.mp4',
			currentAttachmentId: 555,
			currentDurationSeconds: 12,
			entryPoint: 'post_editor_feature_clip',
			currentPostId: 999,
			isCurrentPostPublished: true,
			currentMeta: { jetpack_social_options: { version: 2 } },
			connections: [ igConnection, twitterConnection ],
			isSharingCurrentPost: false,
		};
		mockShareCurrentPost.mockResolvedValue( true );
		mockEditPost.mockResolvedValue( undefined );
		mockAddNotice.mockResolvedValue( undefined );
	} );

	describe( 'isVisible', () => {
		it( 'is true when entry point is feature clip, video is set, and script-data is available', () => {
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.isVisible ).toBe( true );
		} );

		it( 'is false when entry point is not the feature clip panel', () => {
			mockState.entryPoint = 'media_library';
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false when the video URL is empty', () => {
			mockState.currentVideoUrl = null;
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false when JetpackScriptData is missing', () => {
			mockReelSharePath = null;
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.isVisible ).toBe( false );
		} );
	} );

	describe( 'canShare and reason', () => {
		it( 'reports canShare=true when all preconditions pass', () => {
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.canShare ).toBe( true );
			expect( result.current.reason ).toBeNull();
		} );

		it( 'reports no-connection when no instagram-business connection exists', () => {
			mockState.connections = [ twitterConnection ];
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.canShare ).toBe( false );
			expect( result.current.reason ).toBe( 'no-connection' );
		} );

		it( 'reports post-not-published when post is a draft', () => {
			mockState.isCurrentPostPublished = false;
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.canShare ).toBe( false );
			expect( result.current.reason ).toBe( 'post-not-published' );
		} );

		it( 'reports no-video when attachment id is null', () => {
			mockState.currentAttachmentId = null;
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.canShare ).toBe( false );
			expect( result.current.reason ).toBe( 'no-video' );
		} );
	} );

	describe( 'handleShare — happy path', () => {
		it( 'writes attached_media and media_source then dispatches shareCurrentPost with non-IG connections skipped', async () => {
			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockTrackClicked ).toHaveBeenCalledWith( {
				attachmentId: 555,
				durationSeconds: 12,
			} );

			expect( mockEditPost ).toHaveBeenCalledWith( {
				meta: {
					jetpack_social_options: {
						version: 2,
						attached_media: [
							{ id: 555, url: 'https://example.com/clip.mp4', type: 'video/mp4' },
						],
						media_source: 'upload-video',
					},
				},
			} );

			expect( mockShareCurrentPost ).toHaveBeenCalledWith(
				{ message: '', skipped_connections: [ '1002' ] },
				{ savePost: true, apiPath: '/wpcom/v2/publicize/share-post/{postId}' }
			);

			expect( mockTrackDispatched ).toHaveBeenCalledTimes( 1 );
			expect( mockTrackFailed ).not.toHaveBeenCalled();
		} );

		it( 'shows a success notice when shareCurrentPost resolves truthy', async () => {
			const { result } = renderHook( () => useReelShare() );
			await act( async () => {
				await result.current.handleShare();
			} );
			expect( mockAddNotice ).toHaveBeenCalledWith(
				expect.stringMatching( /Shared to Instagram/i ),
				'success'
			);
		} );
	} );

	describe( 'handleShare — pre-check gates', () => {
		it( 'shows a no-connection notice with action when IG is not connected', async () => {
			mockState.connections = [ twitterConnection ];
			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockEditPost ).not.toHaveBeenCalled();
			expect( mockShareCurrentPost ).not.toHaveBeenCalled();
			expect( mockTrackNotConnected ).toHaveBeenCalledTimes( 1 );
			expect( mockAddNotice ).toHaveBeenCalledWith(
				expect.stringMatching( /Connect Instagram/i ),
				'warning',
				expect.arrayContaining( [
					expect.objectContaining( { label: expect.any( String ), url: expect.any( String ) } ),
				] )
			);
		} );

		it( 'shows a not-published notice when the post is a draft', async () => {
			mockState.isCurrentPostPublished = false;
			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockEditPost ).not.toHaveBeenCalled();
			expect( mockShareCurrentPost ).not.toHaveBeenCalled();
			expect( mockTrackNotPublished ).toHaveBeenCalledTimes( 1 );
			expect( mockAddNotice ).toHaveBeenCalledWith(
				expect.stringMatching( /Publish this post first/i ),
				'warning'
			);
		} );

		it( 'shows an invalid-state notice when the video state is missing', async () => {
			mockState.currentAttachmentId = null;
			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockEditPost ).not.toHaveBeenCalled();
			expect( mockShareCurrentPost ).not.toHaveBeenCalled();
			expect( mockTrackInvalidState ).toHaveBeenCalledTimes( 1 );
			expect( mockAddNotice ).toHaveBeenCalledWith(
				expect.stringMatching( /Generate a video first/i ),
				'error'
			);
		} );
	} );

	describe( 'handleShare — failure', () => {
		it( 'tracks reel_share_failed when shareCurrentPost resolves falsy', async () => {
			mockShareCurrentPost.mockResolvedValueOnce( false );
			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockTrackFailed ).toHaveBeenCalledTimes( 1 );
			expect( mockTrackDispatched ).not.toHaveBeenCalled();
		} );

		it( 'tracks reel_share_failed when shareCurrentPost throws', async () => {
			mockShareCurrentPost.mockRejectedValueOnce( new Error( 'boom' ) );
			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockTrackFailed ).toHaveBeenCalledWith( 'boom' );
			expect( mockTrackDispatched ).not.toHaveBeenCalled();
		} );
	} );
} );
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
yarn jest --rootDir packages/image-studio --runTestsByPath packages/image-studio/src/hooks/use-reel-share/index.test.ts
```
Expected: FAIL with "Cannot find module './index'".

- [ ] **Step 3: Write the implementation**

Create `packages/image-studio/src/hooks/use-reel-share/index.ts`:

```ts
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as imageStudioStore, type ImageStudioActions } from '../../store';
import { ImageStudioEntryPoint } from '../../store';
import { store as videoStudioStore } from '../../stores/video-studio';
import { getReelSharePostPath } from '../../utils/jetpack-script-data';
import {
	trackImageStudioReelShareClicked,
	trackImageStudioReelShareDispatched,
	trackImageStudioReelShareFailed,
	trackImageStudioReelShareInvalidState,
	trackImageStudioReelShareNotConnected,
	trackImageStudioReelShareNotPublished,
} from '../../utils/tracking';

const SOCIAL_STORE = 'jetpack-social-plugin';
const EDITOR_STORE = 'core/editor';
const IG_SERVICE = 'instagram-business';

type ReelShareReason = 'no-connection' | 'post-not-published' | 'no-video' | 'no-script-data';

interface Connection {
	connection_id: string | number;
	service_name: string;
	enabled?: boolean;
}

interface JetpackSocialOptions {
	attached_media?: Array< { id: number; url: string; type: string } >;
	media_source?: string;
	version?: number;
	[ key: string ]: unknown;
}

interface UseReelShareReturn {
	canShare: boolean;
	reason: ReelShareReason | null;
	isVisible: boolean;
	isSharing: boolean;
	handleShare: () => Promise< void >;
}

function getConnectInstagramUrl(): string {
	// Marketing connections page. We don't append a site slug here because Image
	// Studio's bundle doesn't have access to one — the spec's `{site}` token is
	// resolved by Calypso's router when the URL is opened (it redirects to the
	// primary site's marketing page). Opens in a new tab so the Studio modal
	// stays mounted.
	return '/marketing/connections';
}

export function useReelShare(): UseReelShareReturn {
	const sharePath = getReelSharePostPath();

	const {
		currentVideoUrl,
		currentAttachmentId,
		currentDurationSeconds,
		entryPoint,
		isPublished,
		currentMeta,
		hasInstagramConnection,
		nonInstagramConnectionIds,
		isSharing,
	} = useSelect( ( select ) => {
		const videoStore = select( videoStudioStore );
		const studio = select( imageStudioStore );
		const editor = select( EDITOR_STORE ) as
			| {
					isCurrentPostPublished: () => boolean;
					getEditedPostAttribute: ( attr: string ) => unknown;
			  }
			| undefined;
		const social = select( SOCIAL_STORE ) as
			| {
					getConnections: () => Connection[];
					isSharingCurrentPost: () => boolean;
			  }
			| undefined;

		const connections = social?.getConnections?.() ?? [];
		const enabledConnections = connections.filter( ( c ) => c.enabled !== false );

		return {
			currentVideoUrl: videoStore.getCurrentVideoUrl?.() ?? null,
			currentAttachmentId: videoStore.getCurrentAttachmentId?.() ?? null,
			currentDurationSeconds: videoStore.getCurrentDurationSeconds?.() ?? null,
			entryPoint: studio.getEntryPoint?.() ?? null,
			isPublished: editor?.isCurrentPostPublished?.() ?? false,
			currentMeta:
				( editor?.getEditedPostAttribute?.( 'meta' ) as Record< string, unknown > ) ?? {},
			hasInstagramConnection: enabledConnections.some(
				( c ) => c.service_name === IG_SERVICE
			),
			nonInstagramConnectionIds: enabledConnections
				.filter( ( c ) => c.service_name !== IG_SERVICE )
				.map( ( c ) => String( c.connection_id ) ),
			isSharing: social?.isSharingCurrentPost?.() ?? false,
		};
	}, [] );

	const { editPost } = useDispatch( EDITOR_STORE ) as {
		editPost: ( edits: { meta: Record< string, unknown > } ) => Promise< void >;
	};
	const { shareCurrentPost } = useDispatch( SOCIAL_STORE ) as {
		shareCurrentPost: (
			params: { message: string; skipped_connections: string[] },
			config: { apiPath: string; savePost?: boolean }
		) => Promise< boolean >;
	};
	const { addNotice } = useDispatch( imageStudioStore ) as ImageStudioActions;

	const isVisible =
		entryPoint === ImageStudioEntryPoint.PostEditorFeatureClip &&
		!! currentVideoUrl &&
		!! sharePath;

	let reason: ReelShareReason | null = null;
	if ( ! currentVideoUrl || ! currentAttachmentId ) {
		reason = 'no-video';
	} else if ( ! sharePath ) {
		reason = 'no-script-data';
	} else if ( ! hasInstagramConnection ) {
		reason = 'no-connection';
	} else if ( ! isPublished ) {
		reason = 'post-not-published';
	}
	const canShare = reason === null;

	const handleShare = useCallback( async () => {
		trackImageStudioReelShareClicked( {
			attachmentId: currentAttachmentId ?? 0,
			durationSeconds: currentDurationSeconds,
		} );

		// Re-evaluate pre-checks at click time — state may have changed since render.
		if ( ! currentVideoUrl || ! currentAttachmentId ) {
			trackImageStudioReelShareInvalidState();
			await addNotice(
				__( 'Generate a video first to share it as a Reel.', __i18n_text_domain__ ),
				'error'
			);
			return;
		}

		if ( ! sharePath ) {
			// isVisible would be false in this case; defensive bail-out.
			return;
		}

		if ( ! hasInstagramConnection ) {
			trackImageStudioReelShareNotConnected();
			await addNotice(
				__(
					'Connect Instagram in your site marketing settings to share Reels.',
					__i18n_text_domain__
				),
				'warning',
				[
					{
						label: __( 'Connect Instagram', __i18n_text_domain__ ),
						url: getConnectInstagramUrl(),
						openInNewTab: true,
					},
				]
			);
			return;
		}

		if ( ! isPublished ) {
			trackImageStudioReelShareNotPublished();
			await addNotice(
				__(
					'Publish this post first to share it as an Instagram Reel.',
					__i18n_text_domain__
				),
				'warning'
			);
			return;
		}

		const existingSocialOptions =
			( currentMeta.jetpack_social_options as JetpackSocialOptions | undefined ) ?? {};

		try {
			await editPost( {
				meta: {
					jetpack_social_options: {
						...existingSocialOptions,
						attached_media: [
							{
								id: currentAttachmentId,
								url: currentVideoUrl,
								type: 'video/mp4',
							},
						],
						media_source: 'upload-video',
					},
				},
			} );

			const success = await shareCurrentPost(
				{ message: '', skipped_connections: nonInstagramConnectionIds },
				{ savePost: true, apiPath: sharePath }
			);

			if ( success ) {
				trackImageStudioReelShareDispatched();
				await addNotice(
					__( 'Shared to Instagram as a Reel.', __i18n_text_domain__ ),
					'success'
				);
			} else {
				// shareCurrentPost already created a notice via @wordpress/notices;
				// avoid a second one. Just record telemetry.
				trackImageStudioReelShareFailed();
			}
		} catch ( err ) {
			const message = err instanceof Error ? err.message : undefined;
			trackImageStudioReelShareFailed( message );
		}
	}, [
		addNotice,
		currentAttachmentId,
		currentDurationSeconds,
		currentMeta,
		currentVideoUrl,
		editPost,
		hasInstagramConnection,
		isPublished,
		nonInstagramConnectionIds,
		sharePath,
		shareCurrentPost,
	] );

	return {
		canShare,
		reason,
		isVisible,
		isSharing,
		handleShare,
	};
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
yarn jest --rootDir packages/image-studio --runTestsByPath packages/image-studio/src/hooks/use-reel-share/index.test.ts
```
Expected: PASS — all tests in the suite green.

- [ ] **Step 5: Type-check the package**

```bash
cd packages/image-studio && npx tsc --noEmit
```
Expected: zero TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add packages/image-studio/src/hooks/use-reel-share/
git commit -m "Image Studio: add useReelShare hook for Reel share flow"
```

---

## Task 4: Add the `<ShareReelAction />` component

**Why this size:** Pure renderer + click wiring. Tests cover render gating, disabled-while-sharing, and click → `handleShare` wiring.

**Files:**
- Create: `packages/image-studio/src/components/generate-layout/share-reel-action/index.tsx`
- Create: `packages/image-studio/src/components/generate-layout/share-reel-action/index.test.tsx`
- Create: `packages/image-studio/src/components/generate-layout/share-reel-action/style.scss`

- [ ] **Step 1: Write the failing test**

Create `packages/image-studio/src/components/generate-layout/share-reel-action/index.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ShareReelAction } from './index';

const mockUseReelShare = jest.fn();

jest.mock( '../../../hooks/use-reel-share', () => ( {
	useReelShare: () => mockUseReelShare(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

describe( '<ShareReelAction />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders nothing when isVisible is false', () => {
		mockUseReelShare.mockReturnValue( {
			canShare: false,
			reason: 'no-video',
			isVisible: false,
			isSharing: false,
			handleShare: jest.fn(),
		} );

		const { container } = render( <ShareReelAction /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the button when isVisible is true', () => {
		mockUseReelShare.mockReturnValue( {
			canShare: true,
			reason: null,
			isVisible: true,
			isSharing: false,
			handleShare: jest.fn(),
		} );

		render( <ShareReelAction /> );
		expect( screen.getByRole( 'button', { name: /Share as Instagram Reel/i } ) ).toBeInTheDocument();
	} );

	it( 'disables the button while a share is in flight', () => {
		mockUseReelShare.mockReturnValue( {
			canShare: true,
			reason: null,
			isVisible: true,
			isSharing: true,
			handleShare: jest.fn(),
		} );

		render( <ShareReelAction /> );
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
	} );

	it( 'invokes handleShare on click', () => {
		const handleShare = jest.fn();
		mockUseReelShare.mockReturnValue( {
			canShare: true,
			reason: null,
			isVisible: true,
			isSharing: false,
			handleShare,
		} );

		render( <ShareReelAction /> );
		fireEvent.click( screen.getByRole( 'button', { name: /Share as Instagram Reel/i } ) );
		expect( handleShare ).toHaveBeenCalledTimes( 1 );
	} );
} );
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
yarn jest --rootDir packages/image-studio --runTestsByPath packages/image-studio/src/components/generate-layout/share-reel-action/index.test.tsx
```
Expected: FAIL with "Cannot find module './index'".

- [ ] **Step 3: Write the implementation**

Create `packages/image-studio/src/components/generate-layout/share-reel-action/index.tsx`:

```tsx
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useReelShare } from '../../../hooks/use-reel-share';
import './style.scss';

export function ShareReelAction(): JSX.Element | null {
	const { isVisible, isSharing, handleShare } = useReelShare();

	if ( ! isVisible ) {
		return null;
	}

	return (
		<div className="image-studio-share-reel-action">
			<Button
				variant="primary"
				className="image-studio-share-reel-action__button"
				__next40pxDefaultSize
				disabled={ isSharing }
				isBusy={ isSharing }
				onClick={ handleShare }
			>
				{ isSharing
					? __( 'Sharing to Instagram…', __i18n_text_domain__ )
					: __( 'Share as Instagram Reel', __i18n_text_domain__ ) }
			</Button>
		</div>
	);
}
```

Create `packages/image-studio/src/components/generate-layout/share-reel-action/style.scss`:

```scss
.image-studio-share-reel-action {
	display: flex;
	justify-content: center;
	margin-top: 16px;

	&__button {
		min-width: 220px;
	}
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
yarn jest --rootDir packages/image-studio --runTestsByPath packages/image-studio/src/components/generate-layout/share-reel-action/index.test.tsx
```
Expected: PASS — all 4 tests green.

- [ ] **Step 5: Type-check the package**

```bash
cd packages/image-studio && npx tsc --noEmit
```
Expected: zero TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add packages/image-studio/src/components/generate-layout/share-reel-action/
git commit -m "Image Studio: add ShareReelAction component"
```

---

## Task 5: Wire `<ShareReelAction />` into `GenerateLayout`

**Files:**
- Modify: `packages/image-studio/src/components/generate-layout/index.tsx`

- [ ] **Step 1: Read the current `GenerateLayout` to confirm structure**

Open `packages/image-studio/src/components/generate-layout/index.tsx`. Current shape (for reference; do not modify the existing branch logic, just augment the video branch):

```tsx
if ( videoUrl ) {
    return (
        <div className={ /* ... */ }>
            <video /* ... */ />
        </div>
    );
}
```

- [ ] **Step 2: Modify the video branch to render the action below the video**

Replace the existing `if ( videoUrl ) { ... }` block in `packages/image-studio/src/components/generate-layout/index.tsx` with the following. Keep all surrounding code (imports above, the `else` branch, the closing return) unchanged.

```tsx
import { ShareReelAction } from './share-reel-action';
```

Add that import alongside the existing top-of-file imports.

Then update the video branch:

```tsx
	if ( videoUrl ) {
		return (
			<div
				className={ cn( 'image-studio-modal__generate-layout--video', {
					'is-ai-processing': isAiProcessing,
					'is-prompt-sent': isPromptSent,
				} ) }
			>
				<video
					className="image-studio-modal__generated-video"
					src={ videoUrl }
					aria-label={ __( 'Generated feature clip preview', __i18n_text_domain__ ) }
					controls
					loop
					muted
					playsInline
					preload="metadata"
				/>
				<ShareReelAction />
			</div>
		);
	}
```

- [ ] **Step 3: Type-check the package**

```bash
cd packages/image-studio && npx tsc --noEmit
```
Expected: zero TypeScript errors.

- [ ] **Step 4: Run the package's full test suite**

```bash
yarn jest --rootDir packages/image-studio
```
Expected: all suites pass — including the new ones from tasks 2–4 and any pre-existing tests for `generate-layout`.

- [ ] **Step 5: Lint the touched files**

```bash
yarn lint:js packages/image-studio/src
```
Expected: no errors specific to the touched files. (Pre-existing warnings in unrelated files are fine.)

- [ ] **Step 6: Commit**

```bash
git add packages/image-studio/src/components/generate-layout/index.tsx
git commit -m "Image Studio: render ShareReelAction below generated video preview"
```

---

## Task 6: Manual end-to-end verification (sandbox)

**Why:** All paths above are validated against existing code and unit tests, but the integration with Meta's Graph API (Reels submission, video MIME validation, Meta-crawler access to the WPCOM CDN) has never been exercised by Image Studio code in this configuration. Per the spec's open question #4, manual sandbox testing is required before declaring v1 shippable.

This task produces no commits — it's a verification checklist for the implementer to walk through with the user/QA before merging.

- [ ] **Pre-conditions on the test sandbox:**
  - A WordPress.com site with **Jetpack Social** active.
  - At least one **Instagram Business** connection wired up via Marketing → Connections.
  - Image Studio is enabled and `imageStudioData.isDevMode` is true (so the Feature Clip sidebar registers).
  - A second active connection (e.g. Twitter/X) so we can verify it is **not** triggered.

- [ ] **Test 1 — Happy path (published post):**
  1. Open a published post.
  2. Open the "Generate Feature Clip" sidebar panel and generate a clip.
  3. Wait for the canvas to display the generated MP4.
  4. Click "Share as Instagram Reel".
  5. **Verify:**
     - Button enters busy state.
     - A success snackbar appears within ~10s–2min.
     - The Reel appears on the connected Instagram account.
     - The other connected service (Twitter/X) was **not** triggered (no new post on it).

- [ ] **Test 2 — Draft post gate:**
  1. Open a draft post (or save a published post back to draft).
  2. Generate a clip.
  3. Click "Share as Instagram Reel".
  4. **Verify:** A warning notice appears: "Publish this post first to share it as an Instagram Reel." No editPost / shareCurrentPost calls fire (check the network tab — no `share-post` POST).

- [ ] **Test 3 — Missing connection:**
  1. Disconnect the Instagram connection in Marketing → Connections.
  2. Generate a clip.
  3. Click "Share as Instagram Reel".
  4. **Verify:** A warning notice appears with a "Connect Instagram" action button. Clicking the action button opens `/marketing/connections` in a new tab.

- [ ] **Test 4 — Telemetry:**
  1. Open the Tracks debug panel or browser console with Tracks logging enabled.
  2. Walk through Tests 1–3.
  3. **Verify each event fires:**
     - `image_studio_reel_share_clicked` on every click.
     - `image_studio_reel_share_dispatched` only after Test 1 success.
     - `image_studio_reel_share_post_not_published` after Test 2.
     - `image_studio_reel_share_not_connected` after Test 3.
     - All events carry `placement = 'post_editor_feature_clip'`, the standard `sessionid`, and `is_test = true`.

- [ ] **Test 5 — Private blog smoke check (if accessible):**
  1. Try Test 1 on a private/Atomic-private sandbox blog.
  2. **Verify:** Either the share fails with Meta's "media couldn't be fetched" error surfaced via the standard `shareCurrentPost` failure path (acceptable, documented limitation), OR the share succeeds (great — no follow-up needed).

- [ ] **Sign-off:** Once all tests pass, post results to the Linear issue (RSM-2117) and request reviewer approval to land the branch.

---

## Self-Review Notes (do not delete; informs reviewers)

- **Spec coverage check:** All scope items from `docs/superpowers/specs/2026-05-04-image-studio-share-as-instagram-reel-design.md` are mapped:
  - "New `<ShareReelAction />` component in `GenerateLayout`" → Tasks 4 + 5.
  - "New `useReelShare` hook" → Task 3.
  - "Pre-check pipeline (no-connection / post-not-published / no-video / no-script-data)" → Task 3 (logic + tests).
  - "Click handler: editPost → shareCurrentPost with non-IG skipped → success snackbar" → Task 3.
  - "Telemetry events" → Tasks 1 + 3.
  - "Cross-bundle script-data access via `window.JetpackScriptData`" → Task 2.
  - "ImageStudioNotice for user-facing messages" → handled implicitly via `addNotice` action used in Task 3 (the existing `<ImageStudioNotice />` already renders these).
  - "Visibility hard hide outside Feature Clip entry point" → Task 3 (hook) + Task 4 (component returns null when `isVisible === false`).
- **Type consistency:** `useReelShare`'s return type `UseReelShareReturn` is consumed only in Task 4 (`{ isVisible, isSharing, handleShare }`); fields match.
- **No placeholders in steps:** every code step contains the full implementation; every command step has the exact command and expected outcome.
