/**
 * Update Canvas Video Ability
 *
 * WordPress Ability for refreshing the Image Studio canvas after the backend
 * generates a new video clip. The agent calls this once `wpcom/generate-video-for-studio`
 * returns a successful result, replacing the previous behaviour of scraping the
 * raw conversation history client-side.
 */

import { registerAbility } from '@wordpress/abilities';
import apiFetch from '@wordpress/api-fetch';
import { dispatch, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { FEATURE_CLIP_META_KEY } from '../extensions/feature-clip-meta';
import { store as imageStudioStore, type ImageStudioActions } from '../store';
import { store as videoStudioStore, type VideoStudioActions } from '../stores/video-studio';
import { ImageStudioMode } from '../types';
import { trackImageStudioImageGenerated } from '../utils/tracking';

/**
 * Persist the generated video clip's attachment ID against the current post
 * via the standard core REST `posts` endpoint. The meta is registered by the
 * Jetpack Image Studio extension with `show_in_rest`. Failures are logged but
 * never block the canvas swap — the in-memory video-studio store still
 * reflects the freshly generated clip even if the meta write loses the race.
 */
async function persistFeatureClipMeta( attachmentId: number ): Promise< void > {
	const editor = select( 'core/editor' ) as
		| { getCurrentPostId: () => number | null; getCurrentPostType: () => string | null }
		| undefined;

	const postId = editor?.getCurrentPostId?.() ?? null;
	const postType = editor?.getCurrentPostType?.() ?? 'post';

	if ( ! postId ) {
		return;
	}

	// Look up the post type's actual REST base. Naive `${postType}s` breaks
	// for custom post types whose REST base isn't a simple "+s" (e.g. an
	// already-plural slug like `news`, or an explicit `rest_base` override).
	// `getEntityRecord( 'root', 'postType', name )` is populated by the editor
	// the moment the post loads, so this is a synchronous read in practice.
	const core = select( 'core' ) as
		| {
				getEntityRecord: (
					kind: string,
					name: string,
					id: string
				) => { rest_base?: string } | undefined;
		  }
		| undefined;
	const restBase = core?.getEntityRecord?.( 'root', 'postType', postType )?.rest_base;
	const path = restBase ? `/wp/v2/${ restBase }/${ postId }` : `/wp/v2/${ postType }s/${ postId }`;

	try {
		const response = ( await apiFetch( {
			path,
			method: 'POST',
			data: { meta: { [ FEATURE_CLIP_META_KEY ]: attachmentId } },
		} ) ) as Record< string, unknown >;

		(
			dispatch( 'core' ) as { receiveEntityRecords: ( ...args: unknown[] ) => void }
		 )?.receiveEntityRecords?.( 'postType', postType, [ response ] );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.warn( '[Image Studio] Failed to persist feature clip meta:', error );
	}
}

const ABILITY_NAME = 'image-studio/update-canvas-video';

// Track if ability has been registered to avoid duplicate registration
let isRegistered = false;

// Preload metadata for the generated clip so the canvas swap is instant.
// Failures (network, codec) are non-fatal — we still dispatch the URL.
function preloadVideo( url: string ): Promise< void > {
	if ( ! url || typeof window === 'undefined' || typeof document === 'undefined' ) {
		return Promise.resolve();
	}

	return new Promise( ( resolve ) => {
		const video = document.createElement( 'video' );
		const done = () => resolve();
		video.preload = 'metadata';
		video.onloadedmetadata = done;
		video.onerror = done;
		setTimeout( done, 3000 );
		video.src = url;
	} );
}

interface UpdateCanvasVideoAbilityInput {
	url?: string | null;
	attachmentId?: number | null;
	durationSeconds?: number | null;
	style?: string | null;
}

/**
 * Register the update canvas video ability with WordPress Abilities API
 */
export async function registerUpdateCanvasVideoAbility(): Promise< void > {
	// Prevent duplicate registration (e.g., from React Strict Mode)
	if ( isRegistered ) {
		return;
	}

	try {
		// The 'image-studio' category is registered by registerUpdateCanvasImageAbility,
		// which initializeAbilities() always runs first. Re-registering here would fail —
		// and historically that failure was swallowed by the outer catch below, which
		// silently skipped the registerAbility() call and hid this ability entirely.
		await registerAbility( {
			name: ABILITY_NAME,
			label: 'Update Canvas Video',
			category: 'image-studio',
			description:
				'Swap the Image Studio canvas to play a freshly generated video clip. Call this immediately after wpcom/generate-video-for-studio returns a successful result.',
			input_schema: {
				type: 'object',
				properties: {
					url: {
						type: 'string',
						description: 'URL to the generated video file.',
					},
					attachmentId: {
						type: 'number',
						description: 'The attachment ID for the generated video.',
					},
					durationSeconds: {
						type: 'number',
						description: 'Optional duration of the generated clip in seconds.',
					},
					style: {
						type: 'string',
						description: 'Optional style preset used for generation.',
					},
				},
				required: [ 'url', 'attachmentId' ],
			},
			callback: async ( input: UpdateCanvasVideoAbilityInput ) => {
				const url = typeof input?.url === 'string' ? input.url.trim() : '';
				const attachmentId = input?.attachmentId ? Number( input.attachmentId ) : null;
				const rawDuration = input?.durationSeconds;
				const durationSeconds =
					typeof rawDuration === 'number' && Number.isFinite( rawDuration ) && rawDuration > 0
						? rawDuration
						: null;

				if ( ! url ) {
					throw new Error( 'url is required to update the canvas video.' );
				}
				if ( ! attachmentId || Number.isNaN( attachmentId ) || attachmentId <= 0 ) {
					throw new Error( 'A positive attachmentId is required to update the canvas video.' );
				}

				const { setCurrentVideoUrl, setCurrentAttachmentId, setCurrentDurationSeconds } = dispatch(
					videoStudioStore
				) as VideoStudioActions;
				const { addNotice } = dispatch( imageStudioStore ) as ImageStudioActions;

				try {
					await preloadVideo( url );
				} catch {
					// Preload is best-effort; never block the canvas swap.
				}

				await setCurrentVideoUrl( url );
				await setCurrentAttachmentId( attachmentId );
				await setCurrentDurationSeconds( durationSeconds );

				// Persist the clip → post linkage. Best-effort; the in-memory
				// store reflects the new clip regardless of REST outcome.
				await persistFeatureClipMeta( attachmentId );

				trackImageStudioImageGenerated( {
					mode: ImageStudioMode.Generate,
					attachmentId,
					isAnnotated: false,
				} );

				addNotice( __( 'Video saved to Media Library', __i18n_text_domain__ ), 'success' );

				return { ok: true };
			},
		} );

		// Mark as registered
		isRegistered = true;
	} catch ( error ) {
		const message = error instanceof Error ? error.message : '';
		// Only swallow when this exact ability was already registered (e.g. HMR / Strict Mode).
		// A bare "already registered" check used to also catch category-registration failures,
		// which silently skipped registerAbility() and hid the ability at runtime.
		if ( message.includes( ABILITY_NAME ) && message.includes( 'already registered' ) ) {
			isRegistered = true;
			return;
		}
		// Re-throw other errors as they indicate a real problem
		throw error;
	}
}
