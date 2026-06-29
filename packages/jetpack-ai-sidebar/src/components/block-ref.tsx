/**
 * BlockRef — clickable label for a block referenced by 0-based index.
 * Renders the block type + a short content preview ("Paragraph — \"Revenue
 * grew 23% YoY…\""); click invokes `onFocus(index)`.
 */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

export interface BlockSnapshot {
	clientId: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	name?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attributes?: Record< string, any >;
	innerBlocks?: BlockSnapshot[];
}

interface BlockRefProps {
	/** 0-based block index from the mediation payload. Null = post-wide. */
	index: number | null;
	/** Flat pre-order block list from the mediator/editor block tree. */
	blocks: BlockSnapshot[];
	/** Called on click for in-bounds refs; a no-op when out of bounds. */
	onFocus?: ( index: number ) => void;
	/** Optional extra className applied to the rendered span/button. */
	className?: string;
}

const SNIPPET_LIMIT = 40;

function stripTags( html: string ): string {
	if ( ! html ) {
		return '';
	}
	// Collapse tags + whitespace. Avoid bringing in DOMParser for such a
	// small budget; this is a label, not sanitised output.
	return html
		.replace( /<[^>]+>/g, ' ' )
		.replace( /\s+/g, ' ' )
		.trim();
}

function truncate( text: string, limit: number = SNIPPET_LIMIT ): string {
	if ( text.length <= limit ) {
		return text;
	}
	return text.slice( 0, limit ).trimEnd() + '…';
}

/**
 * Derive a human label for a block, honouring the user's "don't assume —
 * be as true as possible" direction: heading level only when explicitly
 * set on the block attributes.
 * @param block Block snapshot.
 * @returns Display label, e.g. `Paragraph — "Revenue grew…"`.
 */
function getBlockLabel( block: BlockSnapshot ): string {
	const name = block.name ?? '';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const attrs: Record< string, any > = block.attributes ?? {};

	switch ( name ) {
		case 'core/paragraph': {
			const snippet = truncate( stripTags( String( attrs.content ?? '' ) ) );
			return snippet
				? `${ __( 'Paragraph', 'jetpack' ) } — “${ snippet }”`
				: __( 'Paragraph', 'jetpack' );
		}
		case 'core/heading': {
			const snippet = truncate( stripTags( String( attrs.content ?? '' ) ) );
			const hasLevel = Number.isInteger( attrs.level );
			const base = hasLevel
				? `${ __( 'Heading', 'jetpack' ) } (H${ attrs.level })`
				: __( 'Heading', 'jetpack' );
			return snippet ? `${ base } — “${ snippet }”` : base;
		}
		case 'core/image': {
			const alt = stripTags( String( attrs.alt ?? '' ) );
			const caption = stripTags( String( attrs.caption ?? '' ) );
			const snippet = truncate( alt || caption );
			return snippet ? `${ __( 'Image', 'jetpack' ) } — “${ snippet }”` : __( 'Image', 'jetpack' );
		}
		case 'core/list': {
			// `core/list` nests `core/list-item`s in innerBlocks; their text
			// is not on the list block's own attributes. Skip snippet.
			return __( 'List', 'jetpack' );
		}
		case 'core/list-item': {
			const snippet = truncate( stripTags( String( attrs.content ?? '' ) ) );
			return snippet
				? `${ __( 'List item', 'jetpack' ) } — “${ snippet }”`
				: __( 'List item', 'jetpack' );
		}
		case 'core/quote':
		case 'core/pullquote': {
			const snippet = truncate( stripTags( String( attrs.value ?? attrs.content ?? '' ) ) );
			return snippet ? `${ __( 'Quote', 'jetpack' ) } — “${ snippet }”` : __( 'Quote', 'jetpack' );
		}
		default: {
			// `core/cover` → `Cover`; unknown custom blocks fall back to
			// the raw slug so the reviewer still sees something useful.
			if ( name.startsWith( 'core/' ) ) {
				const rest = name.slice( 5 );
				return rest.charAt( 0 ).toUpperCase() + rest.slice( 1 );
			}
			return name || __( 'Block', 'jetpack' );
		}
	}
}

/**
 * Render a block reference.
 * @param           props             BlockRefProps.
 * @param {number}  props.index       0-based block index, or null for post-wide.
 * @param           props.blocks      Flat pre-order block snapshot list.
 * @param           props.onFocus     Optional click handler; when omitted the ref renders as a plain span.
 * @param {string}  props.className   Optional extra class name.
 * @returns React element.
 */
export default function BlockRef( { index, blocks, onFocus, className = '' }: BlockRefProps ) {
	if ( index === null || index === undefined ) {
		return (
			<span className={ `jetpack-ai-block-ref is-post-wide ${ className }`.trim() }>
				{ __( 'Post-wide', 'jetpack' ) }
			</span>
		);
	}

	if ( index < 0 || index >= blocks.length ) {
		return (
			<span className={ `jetpack-ai-block-ref is-stale ${ className }`.trim() }>
				{ __( 'Block no longer present', 'jetpack' ) }
			</span>
		);
	}

	const block = blocks[ index ];
	const label = getBlockLabel( block );

	if ( ! onFocus ) {
		return <span className={ `jetpack-ai-block-ref ${ className }`.trim() }>{ label }</span>;
	}

	return (
		<button
			type="button"
			className={ `jetpack-ai-block-ref is-clickable ${ className }`.trim() }
			onClick={ () => onFocus( index ) }
			title={ __( 'Scroll to block in editor', 'jetpack' ) }
		>
			{ label }
		</button>
	);
}
