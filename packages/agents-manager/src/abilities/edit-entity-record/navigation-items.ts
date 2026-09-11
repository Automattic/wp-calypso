import { createBlock, parse, serialize } from '@wordpress/blocks';
import { isRecord } from '../../utils/is-record';
import {
	NAVIGATION_LINK_BLOCK,
	NAVIGATION_SUBMENU_BLOCK,
	readMenuItems,
	type NavigationBlock,
} from '../../utils/navigation-menu';
import { providerSelectors } from '../../utils/provider-store';
import { sameUrl, urlKey } from '../../utils/same-url';

/**
 * Rebuilds a menu from the final item list the agent asks for.
 *
 * The agent sends `navigationItems` — the menu as it should end up — and each
 * item names an existing one by its `clientId`, `label`, `url` or page `id`.
 * Reordering the list reorders the menu, omitting an item removes it, and an
 * item with a label or url that matches nothing is added.
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

// Absent, or a string with something in it: an empty one names nothing and
// would clear what it landed on.
const isOptionalText = ( value: unknown ) =>
	value === undefined || ( typeof value === 'string' && value !== '' );

const isOptionalId = ( value: unknown ) =>
	value === undefined ||
	( typeof value === 'number' && value > 0 ) ||
	( typeof value === 'string' && value !== '' );

const NAVIGATION_ITEM_KEYS = [
	'clientId',
	'label',
	'url',
	'id',
	'kind',
	'type',
	'opensInNewTab',
	'items',
];

/**
 * The schema validates nothing below the first level, and the callback runs on
 * raw arguments anyway, so every entry is checked here before it reaches a
 * block attribute. Unknown keys are refused as the schema says: a misspelt one
 * would otherwise be dropped and the edit reported as done.
 */
const isNavigationItemInput = ( value: unknown ): value is NavigationItemInput =>
	isRecord( value ) &&
	Object.keys( value ).every( ( key ) => NAVIGATION_ITEM_KEYS.includes( key ) ) &&
	( value.clientId !== undefined ||
		value.label !== undefined ||
		value.url !== undefined ||
		value.id !== undefined ) &&
	isOptionalText( value.clientId ) &&
	isOptionalText( value.label ) &&
	isOptionalText( value.url ) &&
	isOptionalText( value.kind ) &&
	isOptionalText( value.type ) &&
	isOptionalId( value.id ) &&
	( value.opensInNewTab === undefined || typeof value.opensInNewTab === 'boolean' ) &&
	( value.items === undefined || Array.isArray( value.items ) );

/**
 * A list of items, refused rather than filtered when an entry is malformed: the
 * list replaces what is there, so dropping an entry would quietly remove items
 * the request never asked to touch.
 */
function checkItems( items: unknown[], where: string ): NavigationItemInput[] {
	if ( ! items.every( isNavigationItemInput ) ) {
		throw new Error(
			`Invalid navigation items ${ where }: each entry must be an object naming a clientId, ` +
				'label, url or id — non-empty strings, or a positive number for the id — with any ' +
				'kind and type as strings, opensInNewTab as a boolean, items as an array, and no other keys.'
		);
	}

	return items;
}

/** An item's children, or none — an absent list keeps the existing children. */
const childrenOf = ( item: NavigationItemInput ): NavigationItemInput[] | undefined =>
	item.items && checkItems( item.items, `under "${ item.label ?? '' }"` );

/**
 * Claim order, least ambiguous first.
 *
 * A clientId or a page id names one block; a url or a label can name several,
 * so they claim only what the tiers above have left. Otherwise an input naming
 * a shared url takes the block that a later, unambiguous id needed.
 */
const CLAIM_TIERS = [ [ 'clientId' ], [ 'id' ], [ 'url' ], [ 'label' ] ] as const;

/**
 * The identity keys a menu item can be addressed by, most specific first.
 *
 * One definition for both sides: the keys an input claims and the keys a block
 * offers must be formed identically, or a lookup silently misses. An id is
 * qualified by its type — a category can carry the same number as a page — and
 * a bare id means a page, which is what the schema offers.
 */
const identityKeys = ( {
	clientId,
	id,
	type,
	url,
	label,
}: {
	clientId?: unknown;
	id?: unknown;
	type?: unknown;
	url?: unknown;
	label?: unknown;
} ): string[] =>
	[
		clientId && `clientId:${ clientId }`,
		id && `id:${ type ?? 'page' }:${ id }`,
		url && `url:${ urlKey( url ) ?? url }`,
		label && `label:${ label }`,
	].filter( ( key ): key is string => !! key );

interface PageStructure {
	clientIdMap?: Record< string, string >;
	navigationItemMap?: Record< string, { attributes?: Record< string, unknown > } >;
}

// TODO (ability-migration): Big Sky's page structure hands the agent short block
// ids, and its store keeps what they stood for — the editor's clientId, and a
// menu item's attributes. Until that context migrates, this is the way back.
const pageStructure = (): PageStructure | undefined =>
	providerSelectors< { getFullPageStructure?: () => PageStructure } >()?.getFullPageStructure?.();

/**
 * The identities an input can claim: its own, and then what the page structure
 * recorded under its short id — the editor's clientId, and the attributes the
 * item had. Both sets, so an item the request relabels and re-links still
 * finds its block once the editor has re-created it. An id the structure does
 * not know is taken as an editor clientId.
 */
const identitiesOf = ( item: NavigationItemInput ): string[] => {
	const structure = pageStructure();
	const recorded = item.clientId
		? structure?.navigationItemMap?.[ item.clientId ]?.attributes
		: undefined;

	return [
		...identityKeys( {
			...item,
			clientId: item.clientId && ( structure?.clientIdMap?.[ item.clientId ] ?? item.clientId ),
		} ),
		...( recorded ? identityKeys( recorded ) : [] ),
	];
};

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
		for ( const key of identityKeys( { ...item.attributes, clientId: item.clientId } ) ) {
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
	taken: Set< NavigationBlock >,
	tier: readonly string[]
): NavigationBlock | undefined => {
	for ( const identity of identitiesOf( item ) ) {
		if ( ! tier.some( ( kind ) => identity.startsWith( `${ kind }:` ) ) ) {
			continue;
		}

		const match = index.get( identity )?.find( ( block ) => ! taken.has( block ) );

		if ( match ) {
			taken.add( match );

			return match;
		}
	}

	return undefined;
};

/**
 * The type a block should carry once its children are known.
 *
 * Only the submenu/link distinction is ours to change: it is what draws the
 * dropdown arrow. Any other block a menu holds keeps the type it had.
 */
const blockName = ( block: NavigationBlock, innerBlocks: NavigationBlock[] ): string => {
	if ( block.name === NAVIGATION_SUBMENU_BLOCK && ! innerBlocks.length ) {
		return NAVIGATION_LINK_BLOCK;
	}

	if ( block.name === NAVIGATION_LINK_BLOCK && innerBlocks.length ) {
		return NAVIGATION_SUBMENU_BLOCK;
	}

	return block.name;
};

/** Every label in a menu, top to bottom, for a refusal to name. */
const labelsOf = ( blocks: NavigationBlock[] ): string[] =>
	blocks
		.flatMap( ( block ) => [
			String( block.attributes?.label ?? '' ),
			...labelsOf( block.innerBlocks ?? [] ),
		] )
		.filter( Boolean );

const attributesFor = ( item: NavigationItemInput ) => ( {
	...( item.label ? { label: item.label } : {} ),
	...( item.url ? { url: item.url } : {} ),
	...( item.id ? { id: item.id } : {} ),
	...( item.kind ? { kind: item.kind } : {} ),
	...( item.type ? { type: item.type } : {} ),
	...( typeof item.opensInNewTab === 'boolean' ? { opensInNewTab: item.opensInNewTab } : {} ),
} );

/**
 * Both halves of a raw menu edit: `content` is what persists, `blocks` what the
 * editor reads, and a record carrying only one would leave the other stale.
 */
function withBothHalves( record: Record< string, unknown > ): Record< string, unknown > {
	const { blocks, content } = record;

	// Anything but serialized blocks would persist while the editor kept its
	// own; the schema's null is allowed on other records, not here.
	if ( content !== undefined && typeof content !== 'string' ) {
		throw new Error(
			'content must be a string of serialized blocks. Send navigationItems to rewrite the menu.'
		);
	}

	if ( blocks !== undefined ) {
		if ( ! Array.isArray( blocks ) ) {
			throw new Error( 'blocks must be an array of navigation blocks.' );
		}

		return { ...record, content: serialize( blocks ) };
	}

	return content === undefined ? record : { ...record, blocks: parse( content ) };
}

/**
 * Replaces `navigationItems` with the blocks a write can apply, leaving any
 * other field of the record untouched. A record without it passes through, with
 * a raw `blocks` or `content` edit completed to both halves.
 */
export async function buildNavigationItems(
	menuId: number | string,
	record: Record< string, unknown >
): Promise< Record< string, unknown > > {
	const { navigationItems, ...rest } = record;

	if ( navigationItems === undefined ) {
		return withBothHalves( record );
	}

	if ( ! Array.isArray( navigationItems ) ) {
		throw new Error( 'navigationItems must be an array of menu items.' );
	}

	const items = checkItems( navigationItems, 'at the top level' );

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

	const claim = ( inputs: NavigationItemInput[], tier: readonly string[] ) =>
		inputs.forEach( ( input ) => {
			const existing = resolved.get( input ) ?? takeExisting( input, index, taken, tier );

			if ( existing ) {
				resolved.set( input, existing );
			}

			claim( childrenOf( input ) ?? [], tier );
		} );

	/**
	 * A preserved subtree with every block the agent placed elsewhere removed,
	 * at any depth. Types come from `blockName()`.
	 */
	const prune = ( blocks: NavigationBlock[] = [] ): NavigationBlock[] =>
		blocks
			.filter( ( block ) => ! taken.has( block ) )
			.map( ( block ) => {
				const innerBlocks = prune( block.innerBlocks );

				return { ...block, innerBlocks, name: blockName( block, innerBlocks ) };
			} );

	const build = ( inputs: NavigationItemInput[] ): NavigationBlock[] =>
		inputs.map( ( input ) => {
			const existing = resolved.get( input );

			// Nothing to reuse and nothing to build from — an id alone makes a link
			// with no text, and writing that over a real menu item reads as the menu
			// having been wiped. Collected rather than thrown so every offending
			// item can be named at once and the whole rebuild refused.
			if ( ! existing && ! input.label && ! input.url ) {
				unresolved.push( String( input.clientId ?? input.id ) );
			}

			// Listed children replace the block's own; unlisted ones are pruned.
			const children = childrenOf( input );
			const innerBlocks = children ? build( children ) : prune( existing?.innerBlocks );

			const block =
				existing ??
				( createBlock(
					innerBlocks.length ? NAVIGATION_SUBMENU_BLOCK : NAVIGATION_LINK_BLOCK,
					attributesFor( input )
				) as NavigationBlock );
			const name = blockName( block, innerBlocks );
			const attributes = { ...block.attributes, ...attributesFor( input ) };

			// A page id makes a page link — on a new item, or whatever the block
			// linked before. A new url without one makes a custom link, as the
			// editor's own link control does: the page it used to point at must not
			// follow it into renames and deletions. The id may have only identified
			// the item.
			if ( input.id && String( input.id ) !== String( existing?.attributes?.id ) ) {
				Object.assign( attributes, { type: 'page', kind: 'post-type' }, attributesFor( input ) );
			} else if ( input.url && ! sameUrl( input.url, existing?.attributes?.url ) ) {
				delete attributes.id;
				Object.assign( attributes, { type: 'custom', kind: 'custom' } );
			}

			return { ...block, name, attributes, innerBlocks };
		} );

	CLAIM_TIERS.forEach( ( tier ) => claim( items, tier ) );

	const blocks = build( items );

	if ( unresolved.length ) {
		// Model-facing, so deliberately untranslated: this is an instruction the
		// agent has to act on, and the user never sees it. The menu's own labels
		// are listed so the retry needs no further reading.
		const labels = labelsOf( current ).map( ( label ) => `"${ label }"` );

		throw new Error(
			`Navigation items not found: ${ [ ...new Set( unresolved ) ].join( ', ' ) }. ` +
				'Identify each existing item by its clientId from the page structure, its label, ' +
				`its url or its page id — this menu holds ${ labels.join( ', ' ) || 'no items' }. ` +
				'Nothing was changed.'
		);
	}

	return { ...rest, blocks, content: serialize( blocks ) };
}
