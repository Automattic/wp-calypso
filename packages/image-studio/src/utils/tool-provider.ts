/**
 * Tool Provider for Image Studio
 *
 * Provides image studio abilities AND client-side tools to the AI agent.
 * Abilities run via @wordpress/abilities (deterministic actions on the
 * canvas/store). Client tools execute custom code in the browser, used
 * for the EditFrame photo-style render path.
 */
import { getAbilities, executeAbility } from '@wordpress/abilities';
import { dispatch, select, subscribe } from '@wordpress/data';
import { registerUpdateCanvasImageAbility, registerUpdateCanvasVideoAbility } from '../abilities';
import { store as videoStudioStore, type VideoStudioActions } from '../stores/video-studio';
import type { FeatureClipBrief } from '../compositor/types';
import type { Tool, ToolProvider as AgentticToolProvider } from '@automattic/agenttic-client';

export const ALLOWED_ABILITIES = [
	'image-studio/update-canvas-image',
	'image-studio/update-canvas-video',
	'image-studio/render-images',
];

export const COMPOSE_FEATURE_CLIP_TOOL_ID = 'image-studio/compose-feature-clip';

let isInitialized = false;

export async function initializeAbilities(): Promise< void > {
	if ( isInitialized ) {
		return;
	}

	await registerUpdateCanvasImageAbility();
	await registerUpdateCanvasVideoAbility();
	isInitialized = true;

	window.console?.log?.( '[Image Studio] Abilities registered' );
}

export async function getFilteredAbilities(): Promise< ReturnType< typeof getAbilities > > {
	await initializeAbilities();

	const allAbilities = await getAbilities();
	const filtered = allAbilities.filter(
		( ability ) => ability?.name && ALLOWED_ABILITIES.includes( ability.name )
	);

	window.console?.log?.(
		'[Image Studio] Available abilities:',
		filtered.map( ( a ) => a.name )
	);

	return filtered;
}

export async function executeFilteredAbility( name: string, args: any ): Promise< any > {
	await initializeAbilities();

	if ( ! ALLOWED_ABILITIES.includes( name ) ) {
		throw new Error( `Ability '${ name }' is not allowed for Image Studio` );
	}

	window.console?.log?.( `[Image Studio] Executing ability: ${ name }`, args );

	return executeAbility( name, args );
}

const FEATURE_CLIP_TOOL_DEFINITION: Tool = {
	id: COMPOSE_FEATURE_CLIP_TOOL_ID,
	name: 'Compose Feature Clip',
	description:
		'REQUIRED whenever the user asks for a video, clip, reel, MP4, short, or motion content AND the value at clientContext.videoStudio.style is exactly "informative-photo" or "promotional-photo". Read clientContext.videoStudio.style on every video request: if that string ends in "-photo", you MUST call this tool and you MUST NOT call wpcom__generate_video_for_studio. Conversely, if clientContext.videoStudio.style is "informative" or "promotional" (no "-photo" suffix), do NOT call this tool — use wpcom__generate_video_for_studio. Past turns in this conversation do not override the current style; re-check clientContext.videoStudio.style for every new request. This tool renders a 9:16 vertical MP4 in the user\'s browser by stitching post images into a Ken-Burns sequence followed by a title card. The input must follow the FeatureClipBrief schema; image scenes come from the user\'s post media. Returns { attachmentId, url, durationSeconds } once the MP4 has been uploaded to the media library.',
	input_schema: {
		type: 'object',
		properties: {
			style: {
				type: 'string',
				description: 'Either "informative-photo" or "promotional-photo".',
			},
			scenes: {
				type: 'array',
				description:
					'Ordered scene list. 2-4 scenes recommended. Each scene is a single post image with an optional caption.',
			},
			titleCard: {
				type: 'object',
				description:
					'Closing scene title card. `copy` is a 2-6 word tagline (NOT the full post title).',
			},
			audioBed: {
				type: 'string',
				description: 'Optional. One of "silent", "contemplative", "energetic". Defaults to silent.',
			},
		},
		required: [ 'style', 'scenes', 'titleCard' ],
	},
};

export interface ComposeFeatureClipResult {
	attachmentId: number;
	url: string;
	durationSeconds: number;
}

/**
 * Wait for the store to surface either a result or an error for the given
 * requestId, then resolve / reject. Uses `subscribe` from @wordpress/data
 * because the alternative — polling — is wasteful and the alternative
 * alternative — listening on raw redux — would couple us to internals.
 */
function awaitFeatureClipRenderResult( requestId: string ): Promise< ComposeFeatureClipResult > {
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

function validateBrief( args: unknown ): FeatureClipBrief {
	if ( ! args || typeof args !== 'object' ) {
		throw new Error( 'Brief must be an object.' );
	}
	const candidate = args as Record< string, unknown >;
	if ( candidate.style !== 'informative-photo' && candidate.style !== 'promotional-photo' ) {
		throw new Error( 'Brief.style must be "informative-photo" or "promotional-photo".' );
	}
	if ( ! Array.isArray( candidate.scenes ) || candidate.scenes.length === 0 ) {
		throw new Error( 'Brief.scenes must be a non-empty array.' );
	}
	if (
		! candidate.titleCard ||
		typeof candidate.titleCard !== 'object' ||
		typeof ( candidate.titleCard as { copy?: unknown } ).copy !== 'string'
	) {
		throw new Error( 'Brief.titleCard.copy must be a string.' );
	}
	return candidate as unknown as FeatureClipBrief;
}

export async function executeComposeFeatureClip(
	args: unknown
): Promise< ComposeFeatureClipResult > {
	const brief = validateBrief( args );

	const requestId =
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `compose-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }`;

	const actions = dispatch( videoStudioStore ) as unknown as VideoStudioActions;
	const resolutionPromise = awaitFeatureClipRenderResult( requestId );
	await actions.requestFeatureClipRender( { requestId, brief } );

	return resolutionPromise;
}

export function createToolProvider(): AgentticToolProvider {
	return {
		getAbilities: getFilteredAbilities,
		executeAbility: executeFilteredAbility,
		getAvailableTools: async () => [ FEATURE_CLIP_TOOL_DEFINITION ],
		executeTool: async ( toolId: string, args: unknown ) => {
			if ( toolId !== COMPOSE_FEATURE_CLIP_TOOL_ID ) {
				throw new Error( `Unknown tool: ${ toolId }` );
			}
			return executeComposeFeatureClip( args );
		},
	};
}
