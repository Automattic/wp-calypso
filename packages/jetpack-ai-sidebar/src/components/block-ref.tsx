/**
 * BlockRef — chip for a block referenced by 0-based index. Renders the block's
 * registered icon plus a short content snippet ("Revenue grew 23%…"); clicking
 * invokes `onFocus(index)` to anchor the editor to that block. A post-wide item
 * (null index) has no anchorable block, so it renders a plain "Post-wide" label.
 */

/**
 * External dependencies
 */
import * as blockEditor from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import type { ComponentType } from 'react';

// @wordpress/block-editor ships BlockIcon at runtime but omits it from its
// published type exports; alias it through a typed shim. Fall back to a no-op
// so a future block-editor bump that drops the export degrades to no icon
// instead of crashing every card header with "element type is invalid".
const BlockIcon =
	(
		blockEditor as unknown as {
			BlockIcon?: ComponentType< { icon?: unknown } >;
		}
	 ).BlockIcon ?? ( () => null );

export interface BlockSnapshot {
	clientId: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	name?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	attributes?: Record< string, any >;
	innerBlocks?: BlockSnapshot[];
}

interface BlockRefProps {
	/** 0-based block index from the review payload. Null = post-wide. */
	index: number | null;
	/** Flat pre-order block list from the review/editor block tree. */
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
 * Human name for a block type — its registered title when available, else a
 * prettified slug. Reads from the block registry so custom blocks work without
 * per-type hardcoding.
 * @param {string} name Block name, e.g. `core/image`.
 * @returns Display name.
 */
export function getBlockTypeName( name: string ): string {
	const title = name ? getBlockType( name )?.title : undefined;
	if ( title ) {
		return String( title );
	}
	if ( name.startsWith( 'core/' ) ) {
		const rest = name.slice( 5 );
		return rest.charAt( 0 ).toUpperCase() + rest.slice( 1 );
	}
	return name || __( 'Block', __i18n_text_domain__ );
}

/**
 * Content-only snippet for a block, or its type name when it has no previewable
 * text. The icon conveys the type, so the label stays compact.
 * @param {BlockSnapshot} block Block snapshot.
 * @returns Display snippet.
 */
function getBlockSnippet( block: BlockSnapshot ): string {
	const name = block.name ?? '';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const attrs: Record< string, any > = block.attributes ?? {};

	switch ( name ) {
		case 'core/paragraph':
		case 'core/heading':
		case 'core/list-item':
			return truncate( stripTags( String( attrs.content ?? '' ) ) ) || getBlockTypeName( name );
		case 'core/image':
			return (
				truncate( stripTags( String( attrs.alt ?? '' ) || String( attrs.caption ?? '' ) ) ) ||
				getBlockTypeName( name )
			);
		case 'core/quote':
		case 'core/pullquote':
			return (
				truncate( stripTags( String( attrs.value ?? attrs.content ?? '' ) ) ) ||
				getBlockTypeName( name )
			);
		default:
			return getBlockTypeName( name );
	}
}

/**
 * The icon + snippet content shared by the clickable and static chip variants.
 * @param           props       Props.
 * @param           props.block Block snapshot to describe.
 * @returns React fragment.
 */
function BlockChipContent( { block }: { block: BlockSnapshot } ) {
	const icon = block.name ? getBlockType( block.name )?.icon : undefined;
	return (
		<>
			<span className="jetpack-ai-block-ref__icon" aria-hidden="true">
				<BlockIcon icon={ icon } />
			</span>
			<span className="jetpack-ai-block-ref__label">{ getBlockSnippet( block ) }</span>
		</>
	);
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
				{ __( 'Post-wide', __i18n_text_domain__ ) }
			</span>
		);
	}

	if ( index < 0 || index >= blocks.length ) {
		return (
			<span className={ `jetpack-ai-block-ref is-stale ${ className }`.trim() }>
				{ __( 'Block no longer present', __i18n_text_domain__ ) }
			</span>
		);
	}

	const block = blocks[ index ];

	if ( ! onFocus ) {
		return (
			<span className={ `jetpack-ai-block-ref ${ className }`.trim() }>
				<BlockChipContent block={ block } />
			</span>
		);
	}

	return (
		<button
			type="button"
			className={ `jetpack-ai-block-ref is-clickable ${ className }`.trim() }
			onClick={ () => onFocus( index ) }
			title={ __( 'Scroll to block in editor', __i18n_text_domain__ ) }
		>
			<BlockChipContent block={ block } />
		</button>
	);
}
