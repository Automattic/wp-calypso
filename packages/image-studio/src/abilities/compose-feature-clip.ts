/**
 * Compose Feature Clip Ability
 *
 * WordPress Ability for the photo-driven Feature Clip flow. The agent loop
 * calls this after `wpcom/composite-clip-for-studio` returns a successful
 * `brief`. The callback dispatches the brief to the FeatureClipRenderHost
 * (via videoStudioStore.pendingRender) and awaits the matching result from
 * the host, mirroring how update-canvas-video swaps the canvas after Veo.
 */

import { registerAbility } from '@wordpress/abilities';
import { dispatch, select, subscribe } from '@wordpress/data';
import { store as videoStudioStore, type VideoStudioActions } from '../stores/video-studio';
import type { FeatureClipBrief } from '../compositor/types';

const ABILITY_NAME = 'image-studio/compose-feature-clip';

let isRegistered = false;

interface ComposeFeatureClipResult {
	attachmentId: number;
	url: string;
	durationSeconds: number;
}

interface ComposeFeatureClipInput {
	brief?: FeatureClipBrief;
}

function validateBrief( raw: unknown ): FeatureClipBrief {
	if ( ! raw || typeof raw !== 'object' ) {
		throw new Error( 'brief must be an object.' );
	}
	const candidate = raw as Record< string, unknown >;
	if ( candidate.style !== 'informative-photo' && candidate.style !== 'promotional-photo' ) {
		throw new Error( 'brief.style must be "informative-photo" or "promotional-photo".' );
	}
	if ( ! Array.isArray( candidate.scenes ) || candidate.scenes.length === 0 ) {
		throw new Error( 'brief.scenes must be a non-empty array.' );
	}
	if (
		! candidate.titleCard ||
		typeof candidate.titleCard !== 'object' ||
		typeof ( candidate.titleCard as { copy?: unknown } ).copy !== 'string'
	) {
		throw new Error( 'brief.titleCard.copy must be a string.' );
	}
	return candidate as unknown as FeatureClipBrief;
}

function awaitRenderResult( requestId: string ): Promise< ComposeFeatureClipResult > {
	return new Promise( ( resolve, reject ) => {
		const checkOnce = () => {
			const result = select( videoStudioStore ).getLastFeatureClipRenderResult();
			if ( result?.requestId === requestId ) {
				return { kind: 'ok' as const, value: result };
			}
			const error = select( videoStudioStore ).getLastFeatureClipRenderError();
			if ( error?.requestId === requestId ) {
				return { kind: 'err' as const, value: error };
			}
			return null;
		};

		const initial = checkOnce();
		if ( initial ) {
			if ( initial.kind === 'ok' ) {
				resolve( {
					attachmentId: initial.value.attachmentId,
					url: initial.value.url,
					durationSeconds: initial.value.durationSeconds,
				} );
			} else {
				reject( new Error( initial.value.message ) );
			}
			return;
		}

		const unsubscribe = subscribe( () => {
			const outcome = checkOnce();
			if ( ! outcome ) {
				return;
			}
			unsubscribe();
			if ( outcome.kind === 'ok' ) {
				resolve( {
					attachmentId: outcome.value.attachmentId,
					url: outcome.value.url,
					durationSeconds: outcome.value.durationSeconds,
				} );
			} else {
				reject( new Error( outcome.value.message ) );
			}
		}, videoStudioStore );
	} );
}

/**
 * Register the compose-feature-clip ability with the WordPress Abilities API.
 */
export async function registerComposeFeatureClipAbility(): Promise< void > {
	if ( isRegistered ) {
		return;
	}

	try {
		await registerAbility( {
			name: ABILITY_NAME,
			label: 'Compose Feature Clip',
			category: 'image-studio',
			description:
				"Render a 9:16 vertical MP4 in the user's browser by stitching post images into a Ken-Burns sequence followed by a title card. Call this immediately after wpcom/composite-clip-for-studio returns a successful `brief` — pass that brief verbatim. Returns { attachmentId, url, durationSeconds } once the MP4 has been uploaded to the media library.",
			input_schema: {
				type: 'object',
				properties: {
					brief: {
						type: 'object',
						description:
							'The FeatureClipBrief returned by wpcom/composite-clip-for-studio. Use it verbatim.',
					},
				},
				required: [ 'brief' ],
			},
			callback: async ( input: ComposeFeatureClipInput ) => {
				const brief = validateBrief( input?.brief );

				const requestId =
					typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
						? crypto.randomUUID()
						: `compose-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }`;

				const actions = dispatch( videoStudioStore ) as unknown as VideoStudioActions;
				const resolutionPromise = awaitRenderResult( requestId );
				await actions.requestFeatureClipRender( { requestId, brief } );

				return resolutionPromise;
			},
		} );

		isRegistered = true;
	} catch ( error ) {
		const message = error instanceof Error ? error.message : '';
		if ( message.includes( ABILITY_NAME ) && message.includes( 'already registered' ) ) {
			isRegistered = true;
			return;
		}
		throw error;
	}
}
