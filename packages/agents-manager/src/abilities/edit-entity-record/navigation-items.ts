import { createBlock, parse, serialize } from '@wordpress/blocks';
import { getMenuItemAttributes, resolveClientId } from '../../utils/block-ids';
import { normalizeLabel } from '../../utils/entity-title';
import { isRecord } from '../../utils/is-record';
import {
	NAVIGATION_LINK_BLOCK,
	NAVIGATION_SUBMENU_BLOCK,
	readMenuItems,
	type NavigationBlock,
} from '../../utils/navigation-menu';
import { sameUrl, urlKey } from '../../utils/same-url';

/**
 * Rebuilds a menu from the final item list the agent asks for.
 *
 * The agent sends `navigationItems` — the menu as it should end up — and each
 * item names an existing one by its `clientId`, `label`, `url` or page `id`.
 * Reordering the list reorders the menu, omitting an item removes it, and a
 * labelled item that matches nothing is added as a new link. A clientId that
 * names nothing is refused, as is an unmatched item with no label.
 */

interface NavigationItemInput {
	clientId?: string;
	label?: string;
	url?: string;
	id?: number | string;
	kind?: string;
	type?: string;
	opensInNewTab?: boolean;
	items?: NavigationItemInput[];
}

const isText = ( value: unknown ) => typeof value === 'string' && value.trim() !== '';

const isId = ( value: unknown ) =>
	( typeof value === 'number' && value > 0 ) ||
	( typeof value === 'string' && /^[1-9]\d*$/.test( value ) );

/**
 * What is wrong with a raw item, or nothing. The schema stops at the first
 * level, so each field the rebuild reads is checked here. Other keys are
 * ignored, since the agent echoes what the page structure showed it, and
 * `null` counts as absent, since the agent writes it for a field it has no
 * value for.
 */
function itemProblem( value: unknown ): string | undefined {
	if ( ! isRecord( value ) ) {
		return 'an entry that is not an object';
	}

	const { clientId, label, url, id, opensInNewTab, items } = value;

	if ( clientId == null && label == null && url == null && id == null ) {
		return 'an entry naming no clientId, label, url or id';
	}

	const wrongText = ( [ 'clientId', 'label', 'url', 'kind', 'type' ] as const ).find(
		( field ) => value[ field ] != null && ! isText( value[ field ] )
	);

	if ( wrongText ) {
		return `a ${ wrongText } that is not a non-empty string`;
	}

	if ( id != null && ! isId( id ) ) {
		return 'an id that is not a positive number';
	}

	if ( opensInNewTab != null && typeof opensInNewTab !== 'boolean' ) {
		return 'an opensInNewTab that is not true or false';
	}

	if ( items != null && ! Array.isArray( items ) ) {
		return 'items that is not an array';
	}

	return undefined;
}

/**
 * A list of items at every level, refused rather than filtered when an entry is
 * malformed: the list replaces what is there, so dropping an entry would
 * quietly remove items the request never asked to touch.
 */
function checkNavigationItems( items: unknown, where: string ): NavigationItemInput[] {
	if ( ! Array.isArray( items ) ) {
		throw new Error( `navigationItems ${ where } must be an array of menu items.` );
	}

	for ( const [ index, item ] of items.entries() ) {
		const problem = itemProblem( item );

		if ( problem ) {
			throw new Error(
				`Invalid navigation items ${ where }: entry ${ index + 1 } has ${ problem }. ` +
					'Nothing was changed.'
			);
		}
	}

	( items as NavigationItemInput[] ).forEach(
		( item ) =>
			item.items != null && checkNavigationItems( item.items, `under "${ item.label ?? '' }"` )
	);

	return items;
}

/** An item's children, or none — an absent list keeps the existing children. */
const childrenOf = ( item: NavigationItemInput ): NavigationItemInput[] | undefined =>
	item.items ?? undefined;

/**
 * Refuses a malformed menu record before anything in the batch is written. A raw
 * `content` edit must be serialized blocks, or it would persist while the editor
 * kept its own.
 */
export function checkMenuRecord( record: Record< string, unknown > ): void {
	const { blocks, content, navigationItems } = record;

	if ( content !== undefined && typeof content !== 'string' ) {
		throw new Error(
			'content must be a string of serialized blocks. Send navigationItems to rewrite the menu.'
		);
	}

	if ( blocks !== undefined && ! Array.isArray( blocks ) ) {
		throw new Error( 'blocks must be an array of navigation blocks.' );
	}

	if ( navigationItems !== undefined ) {
		checkNavigationItems( navigationItems, 'at the top level' );
	}
}

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
		label && `label:${ normalizeLabel( label ) }`,
	].filter( ( key ): key is string => !! key );

/**
 * The identities an input can claim, in two groups. `known` is what the page
 * structure holds for the item: the editor clientId its short id stands for,
 * and the attributes it recorded. `own` is the input's own values, claimed
 * second because they may be new — a re-link's page id would otherwise claim
 * whichever item already points at that page.
 */
const identitiesOf = ( item: NavigationItemInput ): { known: string[]; own: string[] } => {
	const recorded = item.clientId ? getMenuItemAttributes( item.clientId ) : undefined;

	return {
		known: [
			...identityKeys( { clientId: item.clientId && resolveClientId( item.clientId ) } ),
			...( recorded ? identityKeys( recorded ) : [] ),
		],
		own: identityKeys( { ...item, clientId: undefined } ),
	};
};

type IdentitySource = keyof ReturnType< typeof identitiesOf >;

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
	identities: string[],
	index: Map< string, NavigationBlock[] >,
	taken: Set< NavigationBlock >,
	tier: readonly string[]
): NavigationBlock | undefined => {
	for ( const identity of identities ) {
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
	// The block declares `id` as a number; the schema lets a call send a string.
	...( item.id ? { id: Number( item.id ) } : {} ),
	...( item.kind ? { kind: item.kind } : {} ),
	...( item.type ? { type: item.type } : {} ),
	...( typeof item.opensInNewTab === 'boolean' ? { opensInNewTab: item.opensInNewTab } : {} ),
} );

/**
 * Both halves of a raw menu edit: `content` is what persists, `blocks` what the
 * editor reads, and a record carrying only one would leave the other stale.
 */
function withBlocksAndContent( record: Record< string, unknown > ): Record< string, unknown > {
	const { blocks, content } = record;

	if ( Array.isArray( blocks ) ) {
		return { ...record, content: serialize( blocks ) };
	}

	return typeof content === 'string' ? { ...record, blocks: parse( content ) } : record;
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
	checkMenuRecord( record );

	const { navigationItems, ...rest } = record;

	if ( navigationItems === undefined ) {
		return withBlocksAndContent( record );
	}

	const items = navigationItems as NavigationItemInput[];

	const current = await readMenuItems( menuId );

	if ( ! current ) {
		throw new Error( `Navigation menu not found: ${ menuId }. Nothing was changed.` );
	}

	const index = indexMenu( current );
	const taken = new Set< NavigationBlock >();
	const unresolved: string[] = [];

	// Two passes. Every item the agent names claims its block first, so a child
	// listed at the top level is *moved* out of its submenu rather than kept
	// there and copied — one block cannot appear in a menu twice.
	const resolved = new Map< NavigationItemInput, NavigationBlock >();

	const claim = (
		inputs: NavigationItemInput[],
		source: IdentitySource,
		tier: readonly string[]
	) =>
		inputs.forEach( ( input ) => {
			const existing =
				resolved.get( input ) ??
				takeExisting( identitiesOf( input )[ source ], index, taken, tier );

			if ( existing ) {
				resolved.set( input, existing );
			}

			claim( childrenOf( input ) ?? [], source, tier );
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

			// A clientId names an existing item, so one resolving to nothing is
			// refused, not rebuilt: the block it meant would be dropped. A new item
			// needs a label, or the link has no text. Collected, so every offending
			// item is named at once.
			const missing = ! existing && ( input.clientId || ! input.label );

			if ( missing ) {
				unresolved.push( String( input.clientId ?? input.id ?? input.url ) );
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

			// A page id re-links the item unless it already points there — then the
			// id only identified it. The type counts: a category can carry a page's
			// number. A new url with no id makes a custom link, as the editor's link
			// control does, so the old page stops following it.
			const sameEntity =
				String( input.id ) === String( existing?.attributes?.id ) &&
				( input.type ?? 'page' ) === ( existing?.attributes?.type ?? 'page' );

			if ( input.id && ! sameEntity && ! missing ) {
				// The block renders its href from `url`; a page link without one
				// would have no destination, or keep the previous page's.
				if ( ! input.url ) {
					throw new Error(
						`Navigation item for page ${ input.id } needs its url. Nothing was changed.`
					);
				}

				Object.assign( attributes, { type: 'page', kind: 'post-type' }, attributesFor( input ) );
			} else if ( input.url && ! sameUrl( input.url, existing?.attributes?.url ) ) {
				delete attributes.id;
				Object.assign( attributes, { type: 'custom', kind: 'custom' } );
			}

			return { ...block, name, attributes, innerBlocks };
		} );

	( [ 'known', 'own' ] as const ).forEach( ( source ) =>
		CLAIM_TIERS.forEach( ( tier ) => claim( items, source, tier ) )
	);

	const blocks = build( items );

	if ( unresolved.length ) {
		// Model-facing, so untranslated. The menu's labels are listed so the retry
		// needs no re-read: the page structure held for this turn is what named
		// the stale ids, and a re-read returns them again.
		const labels = labelsOf( current ).map( ( label ) => `"${ label }"` );

		throw new Error(
			`Navigation items not found: ${ [ ...new Set( unresolved ) ].join( ', ' ) }. ` +
				'Do not re-read the page structure; its ids are stale. Send each existing item by ' +
				`its label instead — this menu holds ${ labels.join( ', ' ) || 'no items' }. ` +
				'A new item needs a label. Nothing was changed.'
		);
	}

	return { ...rest, blocks, content: serialize( blocks ) };
}
