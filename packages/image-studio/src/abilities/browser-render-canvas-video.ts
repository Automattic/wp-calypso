/**
 * Compose Feature Clip Ability
 *
 * WordPress Ability for the photo-driven Feature Clip flow. The agent loop
 * calls this after `wpcom/compose-video-for-studio` returns a successful
 * `brief`. The callback dispatches the brief to the FeatureClipRenderHost
 * (via videoStudioStore.pendingRender) and awaits the matching result from
 * the host, mirroring how update-canvas-video swaps the canvas after Veo.
 */

import { registerAbility } from '@wordpress/abilities';
import { dispatch, select, subscribe } from '@wordpress/data';
import { store as videoStudioStore, type VideoStudioActions } from '../stores/video-studio';
import type { FeatureClipBrief } from '../compositor/types';

const ABILITY_NAME = 'image-studio/browser-render-canvas-video';

let isRegistered = false;

interface BrowserRenderCanvasVideoResult {
	attachmentId: number;
	url: string;
	durationSeconds: number;
}

interface BrowserRenderCanvasVideoInput {
	brief?: FeatureClipBrief;
	style?: FeatureClipBrief[ 'style' ];
	scenes?: FeatureClipBrief[ 'scenes' ];
	titleCard?: FeatureClipBrief[ 'titleCard' ];
	audioBed?: FeatureClipBrief[ 'audioBed' ];
}

function validateBrief( raw: unknown ): FeatureClipBrief {
	if ( ! raw || typeof raw !== 'object' ) {
		throw new Error( 'brief must be an object.' );
	}
	const candidate = raw as Record< string, unknown >;
	if ( candidate.style !== 'highlights' ) {
		throw new Error( 'brief.style must be "highlights".' );
	}
	// Allow an empty scenes array — the renderer treats that as a text-only
	// clip (single full-duration title card). The brief still must DECLARE
	// scenes, just with zero entries when no images are usable.
	if ( ! Array.isArray( candidate.scenes ) ) {
		throw new Error( 'brief.scenes must be an array.' );
	}
	const validCameras: ReadonlySet< string > = new Set( [
		'zoom-in',
		'zoom-out',
		'pan-left',
		'pan-right',
		'static',
	] );
	candidate.scenes.forEach( ( scene, idx ) => {
		if ( ! scene || typeof scene !== 'object' ) {
			throw new Error( `brief.scenes[${ idx }] must be an object.` );
		}
		const s = scene as Record< string, unknown >;
		if ( typeof s.camera !== 'string' || ! validCameras.has( s.camera ) ) {
			throw new Error(
				`brief.scenes[${ idx }].camera must be one of: zoom-in, zoom-out, pan-left, pan-right, static.`
			);
		}
		if ( s.imageUrl !== undefined && typeof s.imageUrl !== 'string' ) {
			throw new Error( `brief.scenes[${ idx }].imageUrl must be a string when present.` );
		}
		if ( s.text !== undefined && typeof s.text !== 'string' ) {
			throw new Error( `brief.scenes[${ idx }].text must be a string when present.` );
		}
		if ( s.eyebrow !== undefined && s.eyebrow !== null && typeof s.eyebrow !== 'string' ) {
			throw new Error( `brief.scenes[${ idx }].eyebrow must be a string or null when present.` );
		}
	} );
	if (
		! candidate.titleCard ||
		typeof candidate.titleCard !== 'object' ||
		typeof ( candidate.titleCard as { copy?: unknown } ).copy !== 'string'
	) {
		throw new Error( 'brief.titleCard.copy must be a string.' );
	}
	return candidate as unknown as FeatureClipBrief;
}

// Accept either { brief: {...} } (the documented shape) OR a flattened brief
// passed at top level. GPT-5 reliably flattens the wrapper despite the schema
// + tool description, so being liberal here is much cheaper than re-prompting.
function extractBrief( input: BrowserRenderCanvasVideoInput | undefined ): FeatureClipBrief {
	if ( input && typeof input === 'object' && input.brief !== undefined ) {
		return validateBrief( input.brief );
	}
	if ( input && typeof input === 'object' && 'style' in input && 'scenes' in input ) {
		const { style, scenes, titleCard, audioBed } = input;
		return validateBrief( { style, scenes, titleCard, audioBed } );
	}
	throw new Error(
		'brief must be an object — pass either { brief: <FeatureClipBrief> } or the brief fields at top level.'
	);
}

function awaitRenderResult( requestId: string ): Promise< BrowserRenderCanvasVideoResult > {
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
 * Register the browser-render-canvas-video ability with the WordPress Abilities API.
 */
export async function registerBrowserRenderCanvasVideoAbility(): Promise< void > {
	if ( isRegistered ) {
		return;
	}

	try {
		await registerAbility( {
			name: ABILITY_NAME,
			label: 'Compose Feature Clip',
			category: 'image-studio',
			description:
				"Render a 9:16 vertical MP4 in the user's browser by stitching post images into a Ken-Burns sequence followed by a title card. Call this immediately after wpcom/compose-video-for-studio returns a successful `brief` — pass that brief verbatim. Returns { attachmentId, url, durationSeconds } once the MP4 has been uploaded to the media library.",
			input_schema: {
				type: 'object',
				properties: {
					brief: {
						type: 'object',
						description:
							'The FeatureClipBrief object returned verbatim by wpcom/compose-video-for-studio. Pass the WHOLE result.brief as a single nested object — do NOT spread its keys onto the top-level arguments.',
						properties: {
							style: {
								type: 'string',
								enum: [ 'highlights' ],
							},
							scenes: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										imageUrl: { type: 'string' },
										camera: { type: 'string' },
										text: { type: 'string' },
										eyebrow: { type: 'string' },
									},
								},
							},
							titleCard: {
								type: 'object',
								properties: {
									copy: { type: 'string' },
									cta: { type: 'string' },
								},
							},
							audioBed: { type: 'string' },
						},
					},
				},
				required: [ 'brief' ],
			},
			callback: async ( input: BrowserRenderCanvasVideoInput ) => {
				const brief = extractBrief( input );

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
