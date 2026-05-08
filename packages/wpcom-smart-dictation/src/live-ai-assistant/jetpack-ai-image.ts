/**
 * Headless image generation for the voice assistant.
 *
 * Calls /wpcom/v2/jetpack-ai-image directly (the same gpt-image-1 backend
 * Image Studio uses), sideloads the result into the WP media library, and
 * writes id/url/alt onto the target core/image block. No Image Studio UI
 * involved — Image Studio's generation pipeline is fully agent-driven and
 * not callable from JS, so we go straight to the source endpoint.
 */

import { dispatch, select } from '@wordpress/data';
import wpcomRequest from 'wpcom-proxy-request';
import { requestJetpackAiJwt } from './request-jwt';

// `@wordpress/block-editor` isn't a typed dep of this package, so we hand-roll
// the slice of the store API we use — same pattern as the editor-blocks tool.
interface BlockEditorSelectShape {
	getSelectedBlockClientId: () => string | null;
}
interface BlockEditorDispatchShape {
	updateBlockAttributes: (
		clientId: string,
		attributes: Record< string, unknown >
	) => Promise< void > | void;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export type ImageStyle =
	| 'none'
	| 'vivid'
	| 'anime'
	| 'photographic'
	| 'digital-art'
	| 'comicbook'
	| 'fantasy-art'
	| 'analog-film'
	| 'neonpunk'
	| 'isometric'
	| 'lowpoly'
	| 'origami'
	| 'line-art'
	| 'craft-clay'
	| 'cinematic'
	| 'pixel-art'
	| 'texture';

export interface GenerateOptions {
	prompt: string;
	aspectRatio?: AspectRatio;
	style?: ImageStyle;
	clientId?: string;
	/**
	 * Abort the in-flight request when the realtime session tears down. The OpenAI
	 * call alone takes 30–60s, so without this an abandoned generation would still
	 * land on the editor minutes after the user closed the dictation panel.
	 */
	signal?: AbortSignal;
}

export interface GenerateResult {
	mediaId: number;
	url: string;
	alt: string;
}

// gpt-image-1 only accepts square / portrait / landscape sizes, so 4:3 / 3:4
// collapse onto the closest landscape / portrait variant.
const ASPECT_TO_SIZE: Record< AspectRatio, string > = {
	'1:1': '1024x1024',
	'16:9': '1536x1024',
	'4:3': '1536x1024',
	'9:16': '1024x1536',
	'3:4': '1024x1536',
};

interface MediaNewResponse {
	media: Array< {
		ID: number;
		URL: string;
		alt?: string;
	} >;
}

interface JetpackAIImageResponse {
	data?: Array< { url?: string; b64_json?: string; revised_prompt?: string } >;
}

const FEATURE_SLUG = 'wpcom-dictation-tool';
const MODEL = 'gpt-image-1';

function buildStyledPrompt( prompt: string, style: ImageStyle ): string {
	if ( style === 'none' ) {
		return prompt;
	}
	// Style flag is encoded into the prompt rather than passed as a top-level
	// param: jetpack-ai-image's `style` param triggers a different code path
	// (b64_json, logo-specific framing) that we don't want here.
	return `${ prompt } [style: ${ style }]`;
}

function throwIfAborted( signal: AbortSignal | undefined ): void {
	if ( signal?.aborted ) {
		throw new DOMException( 'Image generation aborted', 'AbortError' );
	}
}

/**
 * Fully headless flow — no modal, no UI gestures.
 */
export async function generateAndApplyHeadless( opts: GenerateOptions ): Promise< GenerateResult > {
	const { prompt, aspectRatio = '1:1', style = 'none', signal } = opts;
	throwIfAborted( signal );

	const blockEditorSelect = select( 'core/block-editor' ) as unknown as BlockEditorSelectShape;
	const clientId = opts.clientId ?? blockEditorSelect.getSelectedBlockClientId();
	if ( ! clientId ) {
		throw new Error( 'No target block: pass clientId or select a core/image first.' );
	}

	let jwt: string;
	let blogId: string | number;
	try {
		const tokenData = await requestJetpackAiJwt();
		jwt = tokenData.token;
		blogId = tokenData.blogId;
	} catch ( err ) {
		throw new Error(
			`Could not obtain Jetpack AI JWT: ${ err instanceof Error ? err.message : String( err ) }`
		);
	}

	const styledPrompt = buildStyledPrompt( prompt, style );
	const requestBody = {
		prompt: styledPrompt,
		feature: FEATURE_SLUG,
		model: MODEL,
		size: ASPECT_TO_SIZE[ aspectRatio ],
	};

	let genResponse: JetpackAIImageResponse;
	try {
		genResponse = await wpcomRequest< JetpackAIImageResponse >( {
			path: '/jetpack-ai-image',
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			token: jwt,
			body: requestBody,
			signal,
		} );
	} catch ( err ) {
		if ( ( err as { name?: string } )?.name === 'AbortError' ) {
			throw err;
		}
		throw new Error(
			`jetpack-ai-image failed: ${ err instanceof Error ? err.message : String( err ) }`
		);
	}
	throwIfAborted( signal );

	const firstResult = genResponse?.data?.[ 0 ];
	const remoteUrl = firstResult?.url;
	const b64 = firstResult?.b64_json;
	if ( ! remoteUrl && ! b64 ) {
		throw new Error(
			`Image generation returned no usable image. Raw response: ${ JSON.stringify(
				genResponse
			).slice( 0, 500 ) }`
		);
	}

	const attrs = { title: prompt.slice( 0, 100 ), alt: prompt };

	let mediaResponse: MediaNewResponse;
	try {
		if ( b64 ) {
			// gpt-image-1 only returns base64; upload the decoded bytes directly so
			// the server doesn't need a fetchable URL.
			const blob = await ( await fetch( `data:image/png;base64,${ b64 }`, { signal } ) ).blob();
			const file = new File( [ blob ], 'live-ai-image.png', { type: 'image/png' } );
			mediaResponse = await wpcomRequest< MediaNewResponse >( {
				path: `/sites/${ blogId }/media/new`,
				apiVersion: '1.1',
				method: 'POST',
				formData: [
					[ 'media[]', file ],
					[ 'attrs[]', JSON.stringify( attrs ) ],
				],
				signal,
			} );
		} else {
			// Server-side sideload: wpcom fetches the OpenAI URL itself, dodging the
			// CORS block on oaidalleapiprodscus.blob.core.windows.net.
			mediaResponse = await wpcomRequest< MediaNewResponse >( {
				path: `/sites/${ blogId }/media/new`,
				apiVersion: '1.1',
				method: 'POST',
				body: {
					media_urls: [ remoteUrl ],
					attrs: [ attrs ],
				},
				signal,
			} );
		}
	} catch ( err ) {
		if ( ( err as { name?: string } )?.name === 'AbortError' ) {
			throw err;
		}
		throw new Error(
			`Media sideload failed: ${ err instanceof Error ? err.message : String( err ) }`
		);
	}
	throwIfAborted( signal );

	const attachment = mediaResponse?.media?.[ 0 ];
	if ( ! attachment?.ID || ! attachment?.URL ) {
		throw new Error(
			`Media sideload returned no attachment. Raw response: ${ JSON.stringify(
				mediaResponse
			).slice( 0, 500 ) }`
		);
	}

	const blockEditorDispatch = dispatch(
		'core/block-editor'
	) as unknown as BlockEditorDispatchShape;
	blockEditorDispatch.updateBlockAttributes( clientId, {
		id: attachment.ID,
		url: attachment.URL,
		alt: attachment.alt || prompt,
	} );

	return {
		mediaId: attachment.ID,
		url: attachment.URL,
		alt: attachment.alt || prompt,
	};
}
