import { dispatch, select } from '@wordpress/data';
import { generateAndApplyHeadless } from '../../jetpack-ai-image';
import type { AspectRatio, ImageStyle } from '../../jetpack-ai-image';

// `@wordpress/block-editor` and `@wordpress/blocks` aren't typed deps of this
// package, so we hand-roll the slice of the store/registry API we use.
interface BlockEditorSelectShape {
	getSelectedBlockClientId: () => string | null;
	getBlockName: ( clientId: string ) => string | null;
}
interface BlockEditorDispatchShape {
	insertBlock: ( block: { name: string; clientId: string } ) => Promise< void > | void;
	removeBlock: ( clientId: string ) => Promise< void > | void;
}
interface BlocksRegistry {
	createBlock: (
		name: string,
		attributes?: Record< string, unknown >
	) => { name: string; clientId: string; attributes: Record< string, unknown > };
}

declare global {
	interface Window {
		wp?: {
			blocks?: BlocksRegistry;
		};
	}
}

export const GENERATE_IMAGE_TOOL_NAME = 'generate_image_tool';

const ASPECT_RATIOS: AspectRatio[] = [ '1:1', '16:9', '9:16', '4:3', '3:4' ];
const STYLES: ImageStyle[] = [
	'none',
	'vivid',
	'anime',
	'photographic',
	'digital-art',
	'comicbook',
	'fantasy-art',
	'analog-film',
	'neonpunk',
	'isometric',
	'lowpoly',
	'origami',
	'line-art',
	'craft-clay',
	'cinematic',
	'pixel-art',
	'texture',
];

export const generateImageToolDefinition = {
	type: 'function',
	name: GENERATE_IMAGE_TOOL_NAME,
	description:
		'Generate an AI image with WordPress.com Image Studio (gpt-image-1) and place it in a core/image block in the post. Use this whenever the user asks you to generate / create / draw / make / design an image, picture, illustration, or photo (e.g. "generate an image of a fluffy ginger cat sleeping on a windowsill", "add a photo of a sunset over the alps", "draw a logo for my coffee shop"). The tool handles the full flow: it generates the image, sideloads it into the user\'s media library, and writes the resulting URL / id / alt onto the target core/image block. Pass `prompt` (the description of what to generate, in English; rephrase the user\'s voice prompt into a concise, vivid scene description). Optionally pass `aspect_ratio` and `style`. Pass `client_id` to target a specific existing core/image block; otherwise the tool uses the currently selected core/image block, and if no core/image is selected it inserts a new one at the END of the post and uses that.',
	parameters: {
		type: 'object',
		properties: {
			prompt: {
				type: 'string',
				description:
					'A vivid English description of the image to generate (e.g. "a photorealistic close-up of a fluffy ginger cat sleeping on a sunlit windowsill, soft morning light"). Rephrase the user\'s voice request into something an image model can render directly.',
			},
			aspect_ratio: {
				type: 'string',
				enum: ASPECT_RATIOS,
				description: 'Optional aspect ratio. Defaults to "1:1".',
			},
			style: {
				type: 'string',
				enum: STYLES,
				description:
					'Optional visual style. Defaults to "none" (no style instruction). Use "photographic" for realistic photos, "digital-art" / "fantasy-art" / "anime" / "comicbook" for stylized art, etc.',
			},
			client_id: {
				type: 'string',
				description:
					'Optional clientId of an existing core/image block to fill. Omit to use the selected core/image, or to auto-insert a new one at the end of the post.',
			},
		},
		required: [ 'prompt' ],
		additionalProperties: false,
	},
} as const;

interface ParsedArgs {
	prompt: string;
	aspectRatio?: AspectRatio;
	style?: ImageStyle;
	clientId?: string;
}

function parseArgs( rawArgs: unknown ): ParsedArgs | { error: string } {
	try {
		const args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > | undefined );
		if ( ! args || typeof args !== 'object' ) {
			return { error: 'Invalid arguments.' };
		}
		const prompt = typeof args.prompt === 'string' ? args.prompt.trim() : '';
		if ( ! prompt ) {
			return { error: 'A "prompt" string is required.' };
		}

		let aspectRatio: AspectRatio | undefined;
		if ( typeof args.aspect_ratio === 'string' ) {
			if ( ( ASPECT_RATIOS as string[] ).includes( args.aspect_ratio ) ) {
				aspectRatio = args.aspect_ratio as AspectRatio;
			}
		}

		let style: ImageStyle | undefined;
		if ( typeof args.style === 'string' ) {
			if ( ( STYLES as string[] ).includes( args.style ) ) {
				style = args.style as ImageStyle;
			}
		}

		const clientId = typeof args.client_id === 'string' ? args.client_id.trim() : '';
		return {
			prompt,
			aspectRatio,
			style,
			clientId: clientId || undefined,
		};
	} catch {
		return { error: 'Could not parse arguments.' };
	}
}

/**
 * If the user opened the image picker before asking us to generate, dismiss it
 * so the running indicator and (eventually) the inserted block aren't obscured
 * by the modal grid. The picker stores its state on `window.__dictationImagePicker`
 * and listens for the `dictation-image-picker-update` event to re-render.
 */
function closeImagePickerIfOpen() {
	const w = window as unknown as {
		__dictationImagePicker?: {
			isOpen: boolean;
			mode: 'menu' | 'grid';
			images: unknown[];
			selectedNumber: number | null;
			purpose: string;
		};
	};
	const state = w.__dictationImagePicker;
	if ( ! state || ! state.isOpen ) {
		return;
	}
	state.isOpen = false;
	state.mode = 'grid';
	state.images = [];
	state.selectedNumber = null;
	window.dispatchEvent( new CustomEvent( 'dictation-image-picker-update' ) );
}

interface ResolvedTarget {
	clientId: string;
	/** True when we inserted a fresh block ourselves; the caller may want to clean it up on failure. */
	inserted: boolean;
}

/**
 * Resolve the clientId we should write the generated image into.
 * Order:
 *   1. explicit clientId (validate it's a core/image)
 *   2. currently-selected block, if it's a core/image
 *   3. insert a fresh core/image at the end of the post and use that
 */
async function resolveTargetClientId( provided: string | undefined ): Promise< ResolvedTarget > {
	const blockEditorSelect = select( 'core/block-editor' ) as unknown as BlockEditorSelectShape;

	if ( provided ) {
		const name = blockEditorSelect.getBlockName( provided );
		if ( name !== 'core/image' ) {
			throw new Error( `Block ${ provided } is not a core/image (got "${ name }").` );
		}
		return { clientId: provided, inserted: false };
	}

	const selectedId = blockEditorSelect.getSelectedBlockClientId();
	if ( selectedId && blockEditorSelect.getBlockName( selectedId ) === 'core/image' ) {
		return { clientId: selectedId, inserted: false };
	}

	const blocks = window.wp?.blocks;
	if ( ! blocks?.createBlock ) {
		throw new Error( 'wp.blocks is not available; cannot insert a new image block.' );
	}
	const newBlock = blocks.createBlock( 'core/image', {} );
	const blockEditorDispatch = dispatch(
		'core/block-editor'
	) as unknown as BlockEditorDispatchShape;
	await blockEditorDispatch.insertBlock( newBlock );
	return { clientId: newBlock.clientId, inserted: true };
}

// Tracks the AbortController of the currently in-flight image generation, if
// any, so that `cancel_image_generation_tool` can abort it without tearing down
// the whole dictation session. Module-scoped because at most one image
// generation runs at a time (the realtime tool runner serializes calls within
// a response, and the model only emits one generate_image_tool per turn).
let inFlightController: AbortController | null = null;

export function abortInFlightImageGeneration(): boolean {
	const controller = inFlightController;
	if ( ! controller ) {
		return false;
	}
	inFlightController = null;
	controller.abort();
	return true;
}

export async function executeGenerateImageTool( rawArgs: unknown, signal?: AbortSignal ) {
	const parsed = parseArgs( rawArgs );
	if ( 'error' in parsed ) {
		return { ok: false, error: parsed.error };
	}

	closeImagePickerIfOpen();

	let clientId: string;
	let weInsertedTheBlock = false;
	try {
		const resolved = await resolveTargetClientId( parsed.clientId );
		clientId = resolved.clientId;
		weInsertedTheBlock = resolved.inserted;
	} catch ( err ) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : 'Could not resolve target image block.',
		};
	}

	// Local controller fires either when the parent session signal aborts (panel
	// closed, dictation stopped) OR when the model calls cancel_image_generation_tool.
	const localController = new AbortController();
	if ( signal ) {
		if ( signal.aborted ) {
			localController.abort();
		} else {
			signal.addEventListener( 'abort', () => localController.abort(), { once: true } );
		}
	}
	inFlightController = localController;

	try {
		const result = await generateAndApplyHeadless( {
			prompt: parsed.prompt,
			aspectRatio: parsed.aspectRatio,
			style: parsed.style,
			clientId,
			signal: localController.signal,
		} );
		return {
			ok: true,
			client_id: clientId,
			url: result.url,
			alt: result.alt,
			media_id: result.mediaId,
			prompt: parsed.prompt,
		};
	} catch ( err ) {
		// Don't leave an empty placeholder block behind if we were the ones who
		// added it. If the user already had a core/image selected, leave it alone —
		// removing a block they were working on would be more surprising than the
		// failure itself. Same on abort: if the user closed the panel, an empty
		// auto-inserted core/image is just litter.
		if ( weInsertedTheBlock ) {
			try {
				const blockEditorDispatch = dispatch(
					'core/block-editor'
				) as unknown as BlockEditorDispatchShape;
				blockEditorDispatch.removeBlock( clientId );
			} catch {
				// Block may already be gone (e.g. user undid); ignore.
			}
		}
		const aborted =
			localController.signal.aborted ||
			signal?.aborted ||
			( err as { name?: string } )?.name === 'AbortError' ||
			undefined;
		let errorMessage: string;
		if ( aborted ) {
			errorMessage = 'Image generation cancelled';
		} else if ( err instanceof Error ) {
			errorMessage = err.message;
		} else {
			errorMessage = String( err );
		}
		return {
			ok: false,
			error: errorMessage,
			aborted,
		};
	} finally {
		if ( inFlightController === localController ) {
			inFlightController = null;
		}
	}
}
