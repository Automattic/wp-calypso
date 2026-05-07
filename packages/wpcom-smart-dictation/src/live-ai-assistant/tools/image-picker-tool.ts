import { dispatch, select } from '@wordpress/data';
import type { ImagePickerItem, ImagePickerState } from '../image-picker-modal';

export const PICK_IMAGE_TOOL_NAME = 'pick_image_tool';

export const pickImageToolDefinition = {
	type: 'function',
	name: PICK_IMAGE_TOOL_NAME,
	description:
		'Open an image picker for the user to choose an image by saying a number (1–9). ' +
		'Use action "open" to show the picker with 9 recent media library images. ' +
		'The user then says a number. Use action "select" with that number to confirm — ' +
		'this AUTOMATICALLY inserts a core/image block (purpose "block") or sets the featured image (purpose "featured_image"). ' +
		'Do NOT call insert_block_tool or any other tool after "select" — the image is already inserted/set. ' +
		'Use action "close" to dismiss without selecting. ' +
		'Use action "upload" when the user wants to upload a new image from their computer — ' +
		'a prompt appears where they tap "Choose image file" once (required by browsers); then ' +
		'the image is uploaded and inserted automatically. ' +
		'When the user asks to insert an image, add a photo, set the featured image, or change an image, call this tool with action "open" first.',
	parameters: {
		type: 'object',
		properties: {
			action: {
				type: 'string',
				enum: [ 'open', 'select', 'close', 'upload' ],
				description:
					'"open" = fetch images and show picker grid. "select" = pick image by number. "close" = dismiss picker. "upload" = show upload prompt (user taps once to open files).',
			},
			number: {
				type: 'number',
				description: 'The image number (1–9) to select. Required when action is "select".',
			},
			purpose: {
				type: 'string',
				enum: [ 'block', 'featured_image' ],
				description:
					'What the image will be used for. "block" inserts a core/image block. "featured_image" sets the post featured image. Defaults to "block".',
			},
			search: {
				type: 'string',
				description:
					'Optional search query to filter media library images (e.g. "sunset", "logo").',
			},
		},
		required: [ 'action' ],
		additionalProperties: false,
	},
} as const;

declare global {
	interface Window {
		__dictationImagePicker?: ImagePickerState;
		__dictationUploadPurpose?: 'block' | 'featured_image';
	}
}

function getPickerState(): ImagePickerState {
	if ( ! window.__dictationImagePicker ) {
		window.__dictationImagePicker = {
			isOpen: false,
			images: [],
			selectedNumber: null,
			purpose: 'block',
		};
	}
	return window.__dictationImagePicker;
}

function updatePickerState( patch: Partial< ImagePickerState > ) {
	const state = getPickerState();
	Object.assign( state, patch );
	window.dispatchEvent( new CustomEvent( 'dictation-image-picker-update' ) );
}

interface MediaItem {
	id: number;
	source_url: string;
	title?: { rendered?: string };
	alt_text?: string;
	media_details?: {
		width?: number;
		height?: number;
		sizes?: Record< string, { source_url?: string; width?: number; height?: number } >;
	};
	mime_type?: string;
}

async function fetchMediaImages( search?: string ): Promise< ImagePickerItem[] > {
	const queryArgs: Record< string, string | number > = {
		per_page: 9,
		media_type: 'image',
		orderby: 'date',
		order: 'desc',
	};
	if ( search && search.trim().length > 0 ) {
		queryArgs.search = search.trim();
	}

	const wp = (
		window as unknown as { wp?: { apiFetch?: ( opts: unknown ) => Promise< unknown > } }
	 ).wp;
	if ( ! wp?.apiFetch ) {
		throw new Error( 'wp.apiFetch is not available' );
	}

	const items = ( await wp.apiFetch( {
		path:
			'/wp/v2/media?' +
			new URLSearchParams(
				Object.entries( queryArgs ).map( ( [ k, v ] ) => [ k, String( v ) ] )
			).toString(),
	} ) ) as MediaItem[];

	return items
		.filter( ( m ) => m.mime_type?.startsWith( 'image/' ) )
		.slice( 0, 9 )
		.map( ( m ) => {
			const sizes = m.media_details?.sizes ?? {};
			const thumb = sizes.thumbnail?.source_url ?? sizes.medium?.source_url ?? m.source_url;
			return {
				id: m.id,
				url: m.source_url,
				thumbnail: thumb,
				title: m.title?.rendered ?? '',
				alt: m.alt_text ?? '',
				width: m.media_details?.width ?? 0,
				height: m.media_details?.height ?? 0,
			};
		} );
}

function getCreateBlockFn():
	| ( ( name: string, attrs?: Record< string, unknown > ) => unknown )
	| null {
	try {
		const blocks = select( 'core/blocks' ) as unknown as {
			getBlockType?: ( n: string ) => unknown;
		};
		void blocks;
		const wp = ( window as unknown as { wp?: { blocks?: { createBlock?: unknown } } } ).wp;
		const fn = wp?.blocks?.createBlock;
		return typeof fn === 'function'
			? ( fn as ( name: string, attrs?: Record< string, unknown > ) => unknown )
			: null;
	} catch {
		return null;
	}
}

async function insertImageBlock( img: ImagePickerItem ) {
	const create = getCreateBlockFn();
	if ( ! create ) {
		return { ok: false, error: 'wp.blocks.createBlock not available' };
	}
	const d = dispatch( 'core/block-editor' ) as unknown as {
		insertBlock: (
			block: unknown,
			index?: number,
			rootClientId?: string
		) => void | Promise< unknown >;
	};
	if ( ! d?.insertBlock ) {
		return { ok: false, error: 'Block editor dispatch not available' };
	}

	const block = create( 'core/image', {
		id: img.id,
		url: img.url,
		alt: img.alt,
		caption: '',
	} );
	try {
		const out = d.insertBlock( block );
		if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
			await ( out as Promise< unknown > );
		}
	} catch ( err ) {
		return {
			ok: false,
			error: `insertBlock failed: ${ err instanceof Error ? err.message : 'unknown' }`,
		};
	}
	return { ok: true, inserted_image: { id: img.id, url: img.url, alt: img.alt } };
}

async function setFeaturedImage( img: ImagePickerItem ) {
	try {
		const d = dispatch( 'core/editor' ) as unknown as {
			editPost: ( edits: Record< string, unknown > ) => void | Promise< unknown >;
		};
		if ( ! d?.editPost ) {
			return { ok: false, error: 'core/editor dispatch not available' };
		}
		const out = d.editPost( { featured_media: img.id } );
		if ( out && typeof ( out as Promise< unknown > ).then === 'function' ) {
			await ( out as Promise< unknown > );
		}
		return { ok: true, featured_image: { id: img.id, url: img.url } };
	} catch ( err ) {
		return {
			ok: false,
			error: `setFeaturedImage failed: ${ err instanceof Error ? err.message : 'unknown' }`,
		};
	}
}

export async function executePickImageTool( rawArgs: unknown ) {
	let args: Record< string, unknown >;
	try {
		args =
			typeof rawArgs === 'string'
				? ( JSON.parse( rawArgs ) as Record< string, unknown > )
				: ( rawArgs as Record< string, unknown > ) ?? {};
	} catch {
		return { ok: false, error: 'Invalid JSON arguments' };
	}

	const action = args.action as string;
	const purpose = ( args.purpose as string ) === 'featured_image' ? 'featured_image' : 'block';

	if ( action === 'open' ) {
		try {
			const images = await fetchMediaImages( args.search as string | undefined );
			if ( images.length === 0 ) {
				return { ok: false, error: 'No images found in the media library.' };
			}
			updatePickerState( {
				isOpen: true,
				images,
				selectedNumber: null,
				purpose: purpose as 'block' | 'featured_image',
			} );
			return {
				ok: true,
				action: 'opened',
				purpose,
				image_count: images.length,
				images: images.map( ( img, i ) => ( {
					number: i + 1,
					id: img.id,
					title: img.title || `Image ${ i + 1 }`,
					filename: img.url.split( '/' ).pop(),
				} ) ),
				instruction:
					'A grid of numbered images is now visible to the user. ' +
					'Tell them to say a number (1–' +
					images.length +
					') to pick one, or say "upload" to upload a new image from their computer. ' +
					'When they say a number, call this tool again with action "select" and that number. ' +
					'When they say "upload", call this tool with action "upload".',
			};
		} catch ( err ) {
			return {
				ok: false,
				error: `Failed to fetch images: ${ err instanceof Error ? err.message : 'unknown' }`,
			};
		}
	}

	if ( action === 'select' ) {
		const num =
			typeof args.number === 'number' ? args.number : parseInt( String( args.number ), 10 );
		if ( isNaN( num ) || num < 1 ) {
			return { ok: false, error: 'number is required and must be 1–9.' };
		}
		const state = getPickerState();
		if ( ! state.images.length ) {
			return { ok: false, error: 'No images loaded. Call with action "open" first.' };
		}
		if ( num > state.images.length ) {
			return {
				ok: false,
				error: `Number ${ num } is out of range. Only ${ state.images.length } images available.`,
			};
		}
		const img = state.images[ num - 1 ];

		updatePickerState( { selectedNumber: num } );

		// Brief delay so the user sees the selection highlight before the modal closes.
		await new Promise( ( r ) => setTimeout( r, 600 ) );

		let result: { ok: boolean; error?: string; [ key: string ]: unknown };
		if ( state.purpose === 'featured_image' ) {
			result = await setFeaturedImage( img );
		} else {
			result = await insertImageBlock( img );
		}

		updatePickerState( { isOpen: false, images: [], selectedNumber: null } );

		return {
			...result,
			selected_number: num,
			selected_image: { id: img.id, url: img.url, title: img.title, alt: img.alt },
		};
	}

	if ( action === 'close' ) {
		updatePickerState( { isOpen: false, images: [], selectedNumber: null } );
		return { ok: true, action: 'closed' };
	}

	if ( action === 'upload' ) {
		// Close the grid if it was open.
		updatePickerState( { isOpen: false, images: [], selectedNumber: null } );

		window.__dictationUploadPurpose = purpose;
		window.dispatchEvent( new CustomEvent( 'dictation-file-upload' ) );

		return {
			ok: true,
			action: 'upload_dialog_opened',
			purpose,
			instruction:
				'An upload prompt is on screen. Tell the user they must tap "Choose image file" once ' +
				'(browsers block fully voice-driven file dialogs). After they pick a file from their ' +
				'computer it will upload to the media library and automatically ' +
				( purpose === 'featured_image'
					? 'be set as the featured image'
					: 'be inserted as an image block' ) +
				'. You will receive a follow-up when upload finishes or if they cancel. ' +
				'Do NOT call insert_block_tool — it is handled automatically.',
		};
	}

	return {
		ok: false,
		error: `Unknown action "${ action }". Use "open", "select", "close", or "upload".`,
	};
}
