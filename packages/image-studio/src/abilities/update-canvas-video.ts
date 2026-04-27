/**
 * Update Canvas Video Ability
 *
 * WordPress Ability for refreshing the Image Studio canvas after the backend
 * generates a new video clip. The agent calls this once `wpcom/generate-video-for-studio`
 * returns a successful result, replacing the previous behaviour of scraping the
 * raw conversation history client-side.
 */

import { registerAbility, registerAbilityCategory } from '@wordpress/abilities';
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
	attachmentId?: string | number | null;
	durationSeconds?: number | null;
	tone?: string | null;
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
		try {
			await registerAbilityCategory( 'image-studio', {
				label: 'Image Studio',
				description: 'Capabilities exposed by the Image Studio experience.',
			} );
		} catch ( categoryError ) {
			// Ignore "already registered" errors so we can safely re-use the category.
			const message = ( categoryError as Error )?.message || '';
			if ( ! message.includes( 'already exists' ) ) {
				throw categoryError;
			}
		}

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
					tone: {
						type: 'string',
						description: 'Optional tone preset used for generation.',
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

				if ( ! url ) {
					throw new Error( 'url is required to update the canvas video.' );
				}
				if ( ! attachmentId || Number.isNaN( attachmentId ) || attachmentId <= 0 ) {
					throw new Error( 'A positive attachmentId is required to update the canvas video.' );
				}

				const { setCurrentVideoUrl } = dispatch( videoStudioStore ) as VideoStudioActions;

				try {
					await preloadVideo( url );
				} catch {
					// Preload is best-effort; never block the canvas swap.
				}

				await setCurrentVideoUrl( url );

				return { ok: true };
			},
		} );

		// Mark as registered
		isRegistered = true;
	} catch ( error ) {
		// If ability is already registered, silently ignore
		// This can happen in development with hot module reloading or React Strict Mode
		if ( error instanceof Error && error.message.includes( 'already registered' ) ) {
			isRegistered = true;
			return;
		}
		// Re-throw other errors as they indicate a real problem
		throw error;
	}
}
