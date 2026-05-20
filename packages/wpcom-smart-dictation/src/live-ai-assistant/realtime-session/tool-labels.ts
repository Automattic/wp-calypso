import { STOP_DICTATION_TOOL_NAME } from '../tools/dictation-control-tool';
import {
	FORMAT_TEXT_TOOL_NAME,
	GET_BLOCK_TOOL_NAME,
	GET_BLOCK_TYPE_TOOL_NAME,
	GET_BLOCK_TYPES_TOOL_NAME,
	GET_EDITOR_BLOCKS_TOOL_NAME,
	GET_INSERTER_ITEMS_TOOL_NAME,
	GET_SELECTED_BLOCK_TOOL_NAME,
	HAS_SELECTED_BLOCK_TOOL_NAME,
	INSERT_BLOCK_TOOL_NAME,
	INSERT_BLOCKS_TOOL_NAME,
	MOVE_BLOCK_TOOL_NAME,
	REMOVE_BLOCK_TOOL_NAME,
	REPLACE_BLOCK_TOOL_NAME,
	SELECT_BLOCK_TOOL_NAME,
	UPDATE_BLOCK_ATTRIBUTES_TOOL_NAME,
	getBlockTitle,
} from '../tools/editor-blocks-tool';
import {
	GET_POST_INFO_TOOL_NAME,
	PUBLISH_POST_TOOL_NAME,
	REDO_TOOL_NAME,
	SAVE_POST_TOOL_NAME,
	SET_POST_TITLE_TOOL_NAME,
	UNDO_TOOL_NAME,
} from '../tools/editor-post-tool';
import { GENERATE_IMAGE_TOOL_NAME } from '../tools/generate-image-tool';
import { PICK_IMAGE_TOOL_NAME } from '../tools/image-picker-tool';
import { VERIFY_YOUTUBE_URL_TOOL_NAME } from '../tools/youtube-oembed-tool';

const READ_ONLY_TOOL_NAMES = new Set( [
	GET_EDITOR_BLOCKS_TOOL_NAME,
	GET_SELECTED_BLOCK_TOOL_NAME,
	GET_INSERTER_ITEMS_TOOL_NAME,
	HAS_SELECTED_BLOCK_TOOL_NAME,
	GET_BLOCK_TYPES_TOOL_NAME,
	GET_BLOCK_TYPE_TOOL_NAME,
	GET_BLOCK_TOOL_NAME,
	GET_POST_INFO_TOOL_NAME,
] );

/**
 * Map a tool name + arguments + result to a short, user-facing label that we
 * surface in the assistant panel as a subtle activity log entry.
 */
export function describeToolCall(
	name: string | undefined,
	rawArgs: unknown,
	result: unknown
): string | null {
	if ( ! name || READ_ONLY_TOOL_NAMES.has( name ) ) {
		return null;
	}

	const args = parseToolArguments( rawArgs );
	const isObjectResult = !! result && typeof result === 'object';
	const ok = isObjectResult && ( result as { ok?: boolean } ).ok !== false;
	const errorPrefix = ok ? '' : 'Failed: ';

	const blockTitleFromArg = ( key: string ): string | null => {
		const val = args[ key ];
		return typeof val === 'string' && val ? getBlockTitle( val ) : null;
	};

	switch ( name ) {
		case INSERT_BLOCK_TOOL_NAME: {
			const title = blockTitleFromArg( 'name' );
			return `${ errorPrefix }Inserted ${ title || 'a block' }`;
		}
		case INSERT_BLOCKS_TOOL_NAME: {
			const blocks = Array.isArray( args.blocks ) ? args.blocks : [];
			if ( blocks.length === 1 ) {
				const first = blocks[ 0 ] as { name?: string } | undefined;
				const title = first?.name ? getBlockTitle( first.name ) : null;
				return `${ errorPrefix }Inserted ${ title || 'a block' }`;
			}
			return `${ errorPrefix }Inserted ${ blocks.length } blocks`;
		}
		case UPDATE_BLOCK_ATTRIBUTES_TOOL_NAME: {
			const attrs = ( args.attributes as Record< string, unknown > ) || {};
			const style = attrs.style as { color?: { text?: string; background?: string } } | undefined;
			if ( style?.color?.text ) {
				return `${ errorPrefix }Set text color`;
			}
			if ( style?.color?.background ) {
				return `${ errorPrefix }Set background color`;
			}
			if ( typeof attrs.level === 'number' ) {
				return `${ errorPrefix }Changed heading level`;
			}
			if ( typeof attrs.content === 'string' ) {
				return `${ errorPrefix }Updated text`;
			}
			return `${ errorPrefix }Updated block`;
		}
		case REPLACE_BLOCK_TOOL_NAME: {
			const title = blockTitleFromArg( 'name' );
			return `${ errorPrefix }Replaced with ${ title || 'block' }`;
		}
		case REMOVE_BLOCK_TOOL_NAME:
			return `${ errorPrefix }Removed block`;
		case MOVE_BLOCK_TOOL_NAME: {
			const dir = typeof args.direction === 'string' ? args.direction : null;
			if ( dir === 'up' ) {
				return `${ errorPrefix }Moved block up`;
			}
			if ( dir === 'down' ) {
				return `${ errorPrefix }Moved block down`;
			}
			return `${ errorPrefix }Moved block`;
		}
		case SELECT_BLOCK_TOOL_NAME:
			return `${ errorPrefix }Selected block`;
		case FORMAT_TEXT_TOOL_NAME: {
			const fmt = typeof args.format === 'string' ? args.format : null;
			const verbs: Record< string, string > = {
				bold: 'Made bold',
				italic: 'Italicized',
				strikethrough: 'Struck through',
				code: 'Formatted as code',
				link: 'Linked',
				underline: 'Underlined',
				subscript: 'Made subscript',
				superscript: 'Made superscript',
			};
			return `${ errorPrefix }${ ( fmt && verbs[ fmt ] ) || 'Formatted text' }`;
		}
		case SET_POST_TITLE_TOOL_NAME:
			return `${ errorPrefix }Set post title`;
		case SAVE_POST_TOOL_NAME:
			return `${ errorPrefix }Saved draft`;
		case STOP_DICTATION_TOOL_NAME:
			return `${ errorPrefix }Stopped dictation`;
		case PUBLISH_POST_TOOL_NAME:
			return `${ errorPrefix }Published post`;
		case UNDO_TOOL_NAME:
			return `${ errorPrefix }Undid last change`;
		case REDO_TOOL_NAME:
			return `${ errorPrefix }Redid last change`;
		case VERIFY_YOUTUBE_URL_TOOL_NAME: {
			if ( ! ok ) {
				return "I couldn't find the right video.";
			}
			const title =
				isObjectResult && typeof ( result as { title?: unknown } ).title === 'string'
					? ( result as { title: string } ).title
					: null;
			return title ? `Verified YouTube URL: ${ title }` : 'Verified YouTube URL';
		}
		case GENERATE_IMAGE_TOOL_NAME: {
			if ( ! ok ) {
				const message =
					isObjectResult && typeof ( result as { error?: unknown } ).error === 'string'
						? ( result as { error: string } ).error
						: 'Could not generate image';
				return `Failed: ${ message }`;
			}
			return 'Generated image';
		}
		case PICK_IMAGE_TOOL_NAME: {
			const action = typeof args.action === 'string' ? args.action : '';
			if ( action === 'open' ) {
				return `${ errorPrefix }Opened image picker`;
			}
			if ( action === 'select' ) {
				const purpose = typeof args.purpose === 'string' ? args.purpose : '';
				if ( purpose === 'featured_image' ) {
					return `${ errorPrefix }Set featured image`;
				}
				return `${ errorPrefix }Inserted image`;
			}
			if ( action === 'close' ) {
				return 'Closed image picker';
			}
			if ( action === 'upload' ) {
				return `${ errorPrefix }Opened upload prompt`;
			}
			return `${ errorPrefix }Image picker`;
		}
		default:
			return null;
	}
}

function parseToolArguments( rawArgs: unknown ): Record< string, unknown > {
	try {
		if ( typeof rawArgs === 'string' ) {
			return JSON.parse( rawArgs ) as Record< string, unknown >;
		}
		if ( rawArgs && typeof rawArgs === 'object' ) {
			return rawArgs as Record< string, unknown >;
		}
	} catch {
		// fall through
	}
	return {};
}
