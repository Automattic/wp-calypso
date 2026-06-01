import './span-tree.scss';

import { Badge } from '@automattic/ui';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { Text } from '../../../../components/text';
import { formatMs } from '../utils';
import type {
	ApmDetailPruned,
	ApmDetailSpan,
	ApmDetailSpanPrunedChildren,
} from '@automattic/api-core';

type BadgeIntent = 'success' | 'warning' | 'error' | 'info' | 'default';
const CATEGORY_INTENT: Record< string, BadgeIntent > = {
	plugins: 'error',
	db: 'warning',
	external: 'warning',
	cache: 'success',
	wp_core: 'default',
	template: 'info',
	transaction: 'info',
};

// Per-transaction average wall-clock time spent in a span (sum across every
// occurrence in a transaction, then averaged over the transactions in the
// bucket). Sums sensibly across siblings, unlike total_ms.max which only
// describes a single occurrence.
function avgTotalMsPerTx( span: ApmDetailSpan ): number {
	return span.total_ms.sum / Math.max( 1, span.tx_count );
}

function avgSelfMsPerTx( span: ApmDetailSpan ): number {
	return span.self_ms.sum / Math.max( 1, span.tx_count );
}

interface SpanNode extends ApmDetailSpan {
	children: SpanNode[];
}

function buildTree( spans: ApmDetailSpan[] ): SpanNode[] {
	const byId = new Map< string, SpanNode >();
	for ( const span of spans ) {
		byId.set( span.id, { ...span, children: [] } );
	}
	const roots: SpanNode[] = [];
	for ( const node of byId.values() ) {
		const parent = node.parent_id ? byId.get( node.parent_id ) : undefined;
		// Treat unknown parents as roots so orphans don't get silently dropped.
		if ( parent ) {
			parent.children.push( node );
		} else {
			roots.push( node );
		}
	}
	const sortDesc = ( a: SpanNode, b: SpanNode ) => avgTotalMsPerTx( b ) - avgTotalMsPerTx( a );
	const sortRecursive = ( node: SpanNode ) => {
		node.children.sort( sortDesc );
		node.children.forEach( sortRecursive );
	};
	roots.sort( sortDesc );
	roots.forEach( sortRecursive );
	return roots;
}

function SpanBar( { fraction }: { fraction: number } ) {
	const widthPct = Math.max( 0, Math.min( 100, fraction * 100 ) );
	return (
		<div
			style={ {
				position: 'relative',
				height: 6,
				borderRadius: 3,
				overflow: 'hidden',
				background: 'color-mix(in srgb, var(--wp-admin-theme-color) 8%, transparent)',
			} }
		>
			<div
				style={ {
					position: 'absolute',
					insetBlockStart: 0,
					insetBlockEnd: 0,
					insetInlineStart: 0,
					width: `${ widthPct }%`,
					background: 'color-mix(in srgb, var(--wp-admin-theme-color) 48%, transparent)',
				} }
			/>
		</div>
	);
}

function SpanRowContent( { node, rootMaxMs }: { node: SpanNode; rootMaxMs: number } ) {
	const totalMs = avgTotalMsPerTx( node );
	const selfMs = avgSelfMsPerTx( node );
	const fraction = rootMaxMs > 0 ? totalMs / rootMaxMs : 0;
	const intent = CATEGORY_INTENT[ node.category ] ?? 'default';
	const subtitleParts: string[] = [];
	if ( node.plugins?.plugin ) {
		subtitleParts.push( node.plugins.plugin );
	}
	if ( node.plugins?.callback_source ) {
		subtitleParts.push( node.plugins.callback_source );
	}
	const showSelf = selfMs > 0 && selfMs < totalMs;
	const callsPerTx = node.count / Math.max( 1, node.tx_count );
	const showCalls = callsPerTx > 1;

	return (
		<HStack spacing={ 3 } alignment="flex-start" justify="flex-start">
			<div style={ { flex: 1, minWidth: 0 } }>
				<VStack spacing={ 1 }>
					<HStack spacing={ 2 } justify="flex-start" alignment="center" wrap>
						<Badge intent={ intent }>{ node.category }</Badge>
						<Text
							weight={ 500 }
							style={ {
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							} }
						>
							{ node.name }
						</Text>
					</HStack>
					<SpanBar fraction={ fraction } />
					{ subtitleParts.length > 0 && (
						<Text variant="muted" size={ 12 }>
							{ subtitleParts.join( ' · ' ) }
						</Text>
					) }
				</VStack>
			</div>
			<VStack spacing={ 0 } alignment="flex-end" style={ { minWidth: 110 } }>
				<Text weight={ 500 }>{ formatMs( totalMs ) }</Text>
				{ showSelf && (
					<Text variant="muted" size={ 12 }>
						{ sprintf(
							/* translators: %s is a duration like "20 ms". */
							__( 'self %s' ),
							formatMs( selfMs )
						) }
					</Text>
				) }
				{ showCalls && (
					<Text variant="muted" size={ 12 }>
						{ sprintf(
							/* translators: %s is a count, possibly fractional (an average across transactions in the bucket). */
							__( '%s calls/tx' ),
							callsPerTx >= 10 ? callsPerTx.toFixed( 0 ) : callsPerTx.toFixed( 1 )
						) }
					</Text>
				) }
			</VStack>
		</HStack>
	);
}

function PrunedChildrenContent( { pruned }: { pruned: ApmDetailSpanPrunedChildren } ) {
	return (
		<Text variant="muted" size={ 12 }>
			{ sprintf(
				/* translators: 1: number of child spans hidden, 2: total time those spans took. */
				__( '+ %1$d more child spans (%2$s total)' ),
				pruned.count,
				formatMs( pruned.total_sum_ms )
			) }
		</Text>
	);
}

function SpanTreeNode( { node, rootMaxMs }: { node: SpanNode; rootMaxMs: number } ) {
	const hasPruned = !! ( node.pruned_children && node.pruned_children.count > 0 );
	const hasChildren = node.children.length > 0 || hasPruned;
	return (
		<li className="dashboard-apm-span-tree__item">
			<div className="dashboard-apm-span-tree__row">
				<SpanRowContent node={ node } rootMaxMs={ rootMaxMs } />
			</div>
			{ hasChildren && (
				<ul className="dashboard-apm-span-tree__list">
					{ node.children.map( ( child ) => (
						<SpanTreeNode key={ child.id } node={ child } rootMaxMs={ rootMaxMs } />
					) ) }
					{ hasPruned && (
						<li className="dashboard-apm-span-tree__item">
							<div className="dashboard-apm-span-tree__row">
								<PrunedChildrenContent pruned={ node.pruned_children! } />
							</div>
						</li>
					) }
				</ul>
			) }
		</li>
	);
}

export default function SpanTree( {
	spans,
	pruned,
}: {
	spans: ApmDetailSpan[];
	pruned?: ApmDetailPruned;
} ) {
	const tree = useMemo( () => buildTree( spans ), [ spans ] );
	const rootMaxMs = tree.reduce( ( max, n ) => Math.max( max, avgTotalMsPerTx( n ) ), 0 );

	if ( tree.length === 0 ) {
		return <Text variant="muted">{ __( 'No spans were captured for this minute.' ) }</Text>;
	}

	return (
		<div>
			<ul className="dashboard-apm-span-tree__list dashboard-apm-span-tree__list--root">
				{ tree.map( ( root ) => (
					<SpanTreeNode key={ root.id } node={ root } rootMaxMs={ rootMaxMs } />
				) ) }
			</ul>
			{ pruned && pruned.node_count > 0 && (
				<div style={ { paddingBlockStart: 12 } }>
					<Text variant="muted" size={ 12 }>
						{ sprintf(
							/* translators: 1: number of additional spans not shown, 2: total self time. */
							__( '+ %1$d additional spans pruned from the tree (%2$s self time)' ),
							pruned.node_count,
							formatMs( pruned.self_sum_ms )
						) }
					</Text>
				</div>
			) }
		</div>
	);
}
