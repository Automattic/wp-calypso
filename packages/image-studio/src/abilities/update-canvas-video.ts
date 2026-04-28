/**
 * Update Canvas Video Ability
 *
 * WordPress Ability for refreshing the Image Studio canvas after the backend
 * generates a new video clip. The agent calls this once `wpcom/generate-video-for-studio`
 * returns a successful result, replacing the previous behaviour of scraping the
 * raw conversation history client-side.
 */

import { registerAbility } from '@wordpress/abilities';
import { dispatch } from '@wordpress/data';
import { store as videoStudioStore, type VideoStudioActions } from '../stores/video-studio';

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

				try {
					await preloadVideo( url );
				} catch {
					// Preload is best-effort; never block the canvas swap.
				}

				await setCurrentVideoUrl( url );
				await setCurrentAttachmentId( attachmentId );
				await setCurrentDurationSeconds( durationSeconds );

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
