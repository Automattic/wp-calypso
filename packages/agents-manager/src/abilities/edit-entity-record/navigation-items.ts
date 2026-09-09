import { createBlock, serialize } from '@wordpress/blocks';
import { readMenuItems, type NavigationBlock } from '../../utils/navigation-menu';

/**
 * Rebuilds a menu from the final item list the agent asks for.
 *
 * The agent sends `navigationItems` — the menu as it should end up — and each
 * item names an existing one by its `label`, `url` or page `id`. Reordering the
 * list reorders the menu, omitting an item removes it, and an item with a label
 * or url that matches nothing is added.
 */

export interface NavigationItemInput {
	clientId?: string;
	label?: string;
	url?: string;
	id?: number | string;
	kind?: string;
	type?: string;
	opensInNewTab?: boolean;
	items?: NavigationItemInput[];
}

const LINK_BLOCK = 'core/navigation-link';
const SUBMENU_BLOCK = 'core/navigation-submenu';

/**
 * The identity keys a menu item can be addressed by, most specific first.
 *
 * One definition for both sides: the keys an input claims and the keys a block
 * offers must be formed identically, or a lookup silently misses.
 *
 * The schema no longer offers a `clientId` — ids minted by another tool do not
 * resolve here — but one that leaks through must not shadow the label or url
 * sent with it, so every key is tried in turn rather than only the first.
 */
const identityKeys = ( {
	clientId,
	id,
	url,
	label,
}: {
	clientId?: unknown;
	id?: unknown;
	url?: unknown;
	label?: unknown;
} ): string[] =>
	[
		clientId && `clientId:${ clientId }`,
		id && `id:${ id }`,
		url && `url:${ url }`,
		label && `label:${ label }`,
	].filter( Boolean ) as string[];

/**
 * Indexes the menu by every identity its items can be addressed with.
 *
 * Each key holds a list, because labels and urls are not unique — a menu may
 * carry two items called Contact. Keeping only one would make both inputs
 * resolve to the same block and emit it twice, which is invalid: two menu
 * items cannot share a clientId.
 */
function indexMenu( items: NavigationBlock[] ): Map< string, NavigationBlock[] > {
	const index = new Map< string, NavigationBlock[] >();

	const add = ( item: NavigationBlock ) => {
		for ( const key of identityKeys( { clientId: item.clientId, ...item.attributes } ) ) {
			index.set( key, [ ...( index.get( key ) ?? [] ), item ] );
		}

		item.innerBlocks?.forEach( add );
	};

	items.forEach( add );

	return index;
}

/**
 * The menu item an input refers to, by the first identity that resolves to a
 * block no earlier input has already taken.
 *
 * Taken blocks are consumed so that two inputs sharing a label claim the two
 * items that share it, in the order they were sent, rather than both landing
 * on the same one.
 */
const takeExisting = (
	item: NavigationItemInput,
	index: Map< string, NavigationBlock[] >,
	taken: Set< NavigationBlock >
): NavigationBlock | undefined => {
	for ( const identity of identityKeys( item ) ) {
		const match = index.get( identity )?.find( ( block ) => ! taken.has( block ) );

		if ( match ) {
			taken.add( match );

			return match;
		}
	}

	return undefined;
};

const attributesFor = ( item: NavigationItemInput ) => ( {
	...( item.label ? { label: item.label } : {} ),
	...( item.url ? { url: item.url } : {} ),
	...( item.id ? { id: item.id } : {} ),
	...( item.kind ? { kind: item.kind } : {} ),
	...( item.type ? { type: item.type } : {} ),
	...( typeof item.opensInNewTab === 'boolean' ? { opensInNewTab: item.opensInNewTab } : {} ),
} );

/**
 * Replaces `navigationItems` with the blocks a write can apply, leaving any
 * other field of the record untouched. A record without it passes through.
 */
export async function buildNavigationItems(
	menuId: number | string,
	record: Record< string, unknown >
): Promise< Record< string, unknown > > {
	const { navigationItems, ...rest } = record;

	if ( ! Array.isArray( navigationItems ) ) {
		return record;
	}

	const current = await readMenuItems( menuId );

	if ( ! current ) {
		// Directive, because the id is the usual thing to get wrong: the agent
		// reads the menu from the block tree, where the numeric `ref` sits
		// alongside a clientId that looks just as much like an identifier.
		throw new Error(
			`Navigation menu not found: ${ menuId }. recordId must be the navigation ` +
				"block's numeric `ref` attribute, not its clientId. Read the block tree " +
				'again and use the `ref`. Nothing was changed.'
		);
	}

	const index = indexMenu( current );
	const taken = new Set< NavigationBlock >();
	const unresolved: string[] = [];

	// Two passes. Every item the agent names claims its block first, so a child
	// listed at the top level is *moved* out of its submenu rather than kept
	// there and copied — one block cannot appear in a menu twice.
	const resolved = new Map< NavigationItemInput, NavigationBlock >();

	const claim = ( inputs: NavigationItemInput[] ) =>
		inputs.forEach( ( input ) => {
			const existing = takeExisting( input, index, taken );

			if ( existing ) {
				resolved.set( input, existing );
			}

			claim( input.items ?? [] );
		} );

	/**
	 * A preserved subtree with every block the agent placed elsewhere removed,
	 * at any depth. A parent left with no children becomes a plain link again,
	 * so it does not draw a dropdown arrow over nothing.
	 */
	const prune = ( blocks: NavigationBlock[] = [] ): NavigationBlock[] =>
		blocks
			.filter( ( block ) => ! taken.has( block ) )
			.map( ( block ) => {
				const innerBlocks = prune( block.innerBlocks );

				return {
					...block,
					innerBlocks,
					name: innerBlocks.length ? SUBMENU_BLOCK : LINK_BLOCK,
				};
			} );

	const build = ( inputs: NavigationItemInput[] ): NavigationBlock[] =>
		inputs.map( ( input ) => {
			const existing = resolved.get( input );

			// Nothing to reuse and nothing to build from — an id alone makes a link
			// with no text, and writing that over a real menu item reads as the menu
			// having been wiped. Collected rather than thrown so every offending
			// item can be named at once and the whole rebuild refused.
			if ( ! existing && ! input.label && ! input.url ) {
				unresolved.push( String( input.clientId ?? input.id ?? 'unknown' ) );
			}

			// Listed children replace the block's own. Unlisted ones are kept, minus
			// any the agent placed elsewhere in this same rebuild — pruned at every
			// depth, since a block moved to the top level can sit further down than
			// a direct child.
			const innerBlocks = input.items ? build( input.items ) : prune( existing?.innerBlocks );

			// A block with children is a submenu, one without is a link. The type is
			// what draws the dropdown arrow, so deriving it from the final children
			// is what keeps a chevron off an item with nothing left to open.
			const name = innerBlocks.length ? SUBMENU_BLOCK : LINK_BLOCK;
			const block = existing ?? ( createBlock( name, attributesFor( input ) ) as NavigationBlock );

			return {
				...block,
				name,
				attributes: { ...block.attributes, ...attributesFor( input ) },
				innerBlocks,
			};
		} );

	claim( navigationItems as NavigationItemInput[] );

	const blocks = build( navigationItems as NavigationItemInput[] );

	if ( unresolved.length ) {
		// Model-facing, so deliberately untranslated: this is an instruction the
		// agent has to act on, and the user never sees it.
		throw new Error(
			`Navigation items not found: ${ [ ...new Set( unresolved ) ].join( ', ' ) }. ` +
				'They are not in this menu. Ids read from another tool do not resolve ' +
				'here — identify each item by its label or url instead. Nothing was changed.'
		);
	}

	// Both halves: `content` is what the record persists, `blocks` what the
	// editor reads. Writing one alone leaves the menu's saved form stale.
	return { ...rest, blocks, content: serialize( blocks ) };
}
