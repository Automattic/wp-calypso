/**
 * The client context's `currentPageContent` and `selectedBlockClientId`: the
 * agent sends their ids back, so whoever resolves them has to hand them out.
 * The shape is the one the backend parses: with a section root, a `header`,
 * `content` and `footer` region; without one, the blocks as they are.
 */

import { createShortIdLookup, setMenuItemAttributes } from './block-ids';
import {
	getBlock,
	getBlockParents,
	getBlocks,
	getCurrentPost,
	getSectionRootClientId,
	getSelectedBlockClientId,
	getTemplatePartClientIds,
	TEMPLATE_PART_BLOCK,
	type EditorBlock,
} from './editor-blocks';
import { getLoadedMenuItems, isMenuItem, NAVIGATION_BLOCK, type MenuId } from './navigation-menu';

// Where a theme offers both, the hero header is the one on the page.
const HEADER_SLUGS = [ 'header-hero', 'header' ];
const FOOTER_SLUG = 'footer';
const REGION_SLUGS: unknown[] = [ ...HEADER_SLUGS, FOOTER_SLUG ];

type RegionType = 'header' | 'content' | 'footer';

/** A block of the page structure, or one of its regions when it carries a `type`. */
interface PageBlock {
	type?: RegionType;
	clientId: string;
	name?: string;
	attributes?: Record< string, unknown >;
	innerBlocks: PageBlock[];
}

export interface PageStructure {
	currentPageContent: PageBlock[];
	selectedBlockClientId: string;
}

const findTemplatePart = (
	parts: { slug: string; clientId: string }[],
	slugs: string[]
): string | undefined =>
	slugs.map( ( slug ) => parts.find( ( part ) => part.slug === slug )?.clientId ).find( Boolean );

// The editor keeps a template part's blocks and a rendered menu's items apart
// from the tree; a menu the view does not render is read from its record.
const withControlledBlocks = ( blocks: EditorBlock[] ): EditorBlock[] =>
	blocks.map( ( block ) => {
		let innerBlocks = block.innerBlocks ?? [];

		if ( block.name === TEMPLATE_PART_BLOCK || block.name === NAVIGATION_BLOCK ) {
			innerBlocks = getBlocks( block.clientId );
		}

		if ( block.name === NAVIGATION_BLOCK && ! innerBlocks.length && block.attributes.ref ) {
			innerBlocks = getLoadedMenuItems( block.attributes.ref as MenuId ) ?? [];
		}

		return { ...block, innerBlocks: withControlledBlocks( innerBlocks ) };
	} );

/**
 * The blocks of the page, by region. A theme can wrap a template part in a
 * block that carries content of its own, a cover around the header, say. That
 * wrapper matches no slug and sits outside the section root, so the region is
 * widened to it: what the agent cannot see, it cannot edit.
 */
function getPageRegions(): PageBlock[] {
	const sectionRoot = getSectionRootClientId();
	const templateParts = getTemplatePartClientIds();
	const header = findTemplatePart( templateParts, HEADER_SLUGS );
	const footer = findTemplatePart( templateParts, [ FOOTER_SLUG ] );
	const sectionRootParents = sectionRoot ? getBlockParents( sectionRoot ) : [];

	// The outermost ancestor that does not hold the content as well. A part
	// inside the content is already there.
	const widen = ( clientId: string | undefined ): string | undefined => {
		if ( ! clientId ) {
			return undefined;
		}

		const parents = getBlockParents( clientId );

		if ( sectionRoot && parents.includes( sectionRoot ) ) {
			return clientId;
		}

		return (
			parents.find(
				( parent ) => parent !== sectionRoot && ! sectionRootParents.includes( parent )
			) ?? clientId
		);
	};

	const headerRoot = widen( header );
	const widenedFooter = widen( footer );

	// A wrapper both parts share stays the header's; as the footer too, it
	// would list everything inside it twice.
	const footerRoot = widenedFooter === headerRoot ? footer : widenedFooter;

	const toRegion = ( type: RegionType, clientId: string | undefined ): PageBlock[] => {
		// Without the check, `getBlocks()` would answer with the whole document.
		if ( ! clientId ) {
			return [];
		}

		const innerBlocks = withControlledBlocks( getBlocks( clientId ) );
		const block = getBlock( clientId );

		return innerBlocks.length
			? [
					{
						name: block?.name ?? TEMPLATE_PART_BLOCK,
						type,
						clientId,
						attributes: block?.attributes ?? {},
						innerBlocks,
					},
				]
			: [];
	};

	const content = withControlledBlocks(
		getBlocks( sectionRoot ).filter(
			( block ) =>
				block.name !== TEMPLATE_PART_BLOCK || ! REGION_SLUGS.includes( block.attributes.slug )
		)
	);

	return [
		...toRegion( 'header', headerRoot ),
		...( sectionRoot
			? [
					{
						name: getBlock( sectionRoot )?.name,
						type: 'content' as const,
						clientId: sectionRoot,
						innerBlocks: content,
					},
				]
			: content ),
		...toRegion( 'footer', footerRoot ),
	];
}

/**
 * The page structure under short ids, or `null` before the editor holds a
 * post or when it cannot be read: a context read must never fail the turn,
 * and an empty structure would displace the provider's. Records the menu
 * items it lists, for `getMenuItemAttributes()`.
 */
export function getPageStructure(): PageStructure | null {
	try {
		if ( ! getCurrentPost() ) {
			return null;
		}

		const { toShortId, findShortId } = createShortIdLookup();
		const menuItemAttributes = new Map< string, Record< string, unknown > >();

		const shorten = ( block: PageBlock, isInMenu = false ): PageBlock => {
			const shortId = toShortId( block.clientId );

			const holdsMenuItems =
				isInMenu || ( block.name === NAVIGATION_BLOCK && !! block.attributes?.ref );

			if ( isInMenu && isMenuItem( block ) ) {
				menuItemAttributes.set( shortId, block.attributes ?? {} );
			}

			return {
				...block,
				clientId: shortId,
				innerBlocks: ( block.innerBlocks ?? [] ).map( ( innerBlock ) =>
					shorten( innerBlock, holdsMenuItems )
				),
			};
		};

		const currentPageContent = getPageRegions().map( ( block ) => shorten( block ) );
		const selected = getSelectedBlockClientId();

		setMenuItemAttributes( menuItemAttributes );

		return {
			currentPageContent,
			// Found, not minted: only a block the structure lists has an id the agent knows.
			selectedBlockClientId: ( selected && findShortId( selected ) ) || '',
		};
	} catch {
		return null;
	}
}
