import { parse } from '@wordpress/block-serialization-default-parser';

type SelectFn = ( storeName: string ) => unknown;

interface TemplateBlock {
	name?: string;
	blockName?: string | null;
	attributes?: Record< string, unknown > | null;
	attrs?: Record< string, unknown > | null;
	innerBlocks?: TemplateBlock[];
}

const FEATURED_IMAGE_BLOCK = 'core/post-featured-image';
const QUERY_BLOCK = 'core/query';

const RATIO_PATTERN = /^\s*(\d+)\s*[/:]\s*(\d+)\s*$/;

// Landscape ratios the picker offers and the image model fallbacks all accept. A
// theme ratio outside this set (3:2, portrait, "auto") falls back to the 16:9 default.
export const THEME_ASPECT_RATIOS = [ '16:9', '4:3' ];

/**
 * Maps a `core/post-featured-image` `aspectRatio` attribute ("4/3") to a picker value, else null.
 * @param value - The block attribute value.
 * @returns The picker value, or null when the picker cannot represent it.
 */
export function normalizeThemeAspectRatio( value: unknown ): string | null {
	if ( typeof value !== 'string' ) {
		return null;
	}
	const match = value.match( RATIO_PATTERN );
	if ( ! match ) {
		return null;
	}
	const width = Number( match[ 1 ] );
	const height = Number( match[ 2 ] );
	if ( ! width || ! height ) {
		return null;
	}
	return (
		THEME_ASPECT_RATIOS.find( ( ratio ) => {
			const [ ratioWidth, ratioHeight ] = ratio.split( ':' ).map( Number );
			return width * ratioHeight === height * ratioWidth;
		} ) ?? null
	);
}

function findFeaturedImageRatio( blocks: TemplateBlock[] ): unknown {
	for ( const block of blocks ) {
		const name = block.name ?? block.blockName;
		if ( name === QUERY_BLOCK ) {
			continue;
		}
		const ratio =
			name === FEATURED_IMAGE_BLOCK
				? ( block.attributes ?? block.attrs )?.aspectRatio
				: findFeaturedImageRatio( block.innerBlocks ?? [] );
		if ( ratio !== undefined ) {
			return ratio;
		}
	}
	return undefined;
}

let lastContent: string | null = null;
let lastParsed: TemplateBlock[] = [];

function parseTemplate( content: string ): TemplateBlock[] {
	if ( content !== lastContent ) {
		lastContent = content;
		lastParsed = parse( content );
	}
	return lastParsed;
}

/**
 * The ratio the post's resolved template applies to the featured image, as a picker value, else null.
 * Skips query loops, takes the first block that sets a ratio, prefers unsaved template edits.
 * Template parts are not followed; patterns are already inlined by the templates endpoint.
 * @param select - The data registry's `select`.
 * @returns The picker value, or null when the template sets none the picker can use.
 */
export function getThemeFeaturedImageAspectRatio( select: SelectFn ): string | null {
	try {
		const editor = select( 'core/editor' ) as {
			getCurrentTemplateId?: () => string | null | undefined;
		} | null;
		const templateId = editor?.getCurrentTemplateId?.();
		if ( ! templateId ) {
			return null;
		}

		const core = select( 'core' ) as {
			getEditedEntityRecord?: ( kind: string, name: string, id: string ) => unknown;
		} | null;
		const record = core?.getEditedEntityRecord?.( 'postType', 'wp_template', templateId ) as
			{ content?: unknown; blocks?: TemplateBlock[] } | undefined;

		let blocks: TemplateBlock[];
		if ( Array.isArray( record?.blocks ) ) {
			blocks = record.blocks;
		} else if ( typeof record?.content === 'string' ) {
			blocks = parseTemplate( record.content );
		} else {
			return null;
		}

		return normalizeThemeAspectRatio( findFeaturedImageRatio( blocks ) );
	} catch ( error ) {
		window.console?.warn?.( '[Image Studio] Error reading the theme aspect ratio:', error );
		return null;
	}
}
