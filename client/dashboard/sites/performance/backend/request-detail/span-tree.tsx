import { Badge } from '@automattic/ui';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Text } from '../../../../components/text';
import { formatMs } from '../utils';
import type {
	ApmDetailPruned,
	ApmDetailSpan,
	ApmDetailSpanPrunedChildren,
} from '@automattic/api-core';

const INDENT_PX = 20;
// Where the horizontal connector lands within a row. Tuned to roughly hit the
// vertical midpoint of the category badge in the first line of the row.
const CONNECTOR_TOP_PX = 14;
const GUIDE_COLOR = 'var(--color-border)';

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

// What to draw in a single guide column of a row.
// - blank:    ancestor at this depth was a last child, nothing connects below
// - vertical: ancestor at this depth still has siblings below, draw a through line
// - T:        this column is the row's own connector and the row has siblings below
// - L:        this column is the row's own connector and the row is the last sibling
type GuideKind = 'blank' | 'vertical' | 'T' | 'L';
type ChildrenMap = Map< string | null, ApmDetailSpan[] >;

function buildChildrenMap( spans: ApmDetailSpan[] ): ChildrenMap {
	const map: ChildrenMap = new Map();
	const ids = new Set( spans.map( ( s ) => s.id ) );
	for ( const span of spans ) {
		// Treat unknown parents as roots so orphans don't get silently dropped.
		const key = span.parent_id && ids.has( span.parent_id ) ? span.parent_id : null;
		if ( ! map.has( key ) ) {
			map.set( key, [] );
		}
		map.get( key )!.push( span );
	}
	for ( const list of map.values() ) {
		list.sort( ( a, b ) => avgTotalMsPerTx( b ) - avgTotalMsPerTx( a ) );
	}
	return map;
}

function GuideCell( { kind }: { kind: GuideKind } ) {
	return (
		<div
			style={ {
				position: 'relative',
				width: INDENT_PX,
				flex: '0 0 auto',
				alignSelf: 'stretch',
			} }
		>
			{ ( kind === 'vertical' || kind === 'T' ) && (
				<div
					style={ {
						position: 'absolute',
						insetInlineStart: '50%',
						insetBlockStart: 0,
						insetBlockEnd: 0,
						borderInlineStart: `1px solid ${ GUIDE_COLOR }`,
					} }
				/>
			) }
			{ kind === 'L' && (
				<div
					style={ {
						position: 'absolute',
						insetInlineStart: '50%',
						insetBlockStart: 0,
						height: CONNECTOR_TOP_PX,
						borderInlineStart: `1px solid ${ GUIDE_COLOR }`,
					} }
				/>
			) }
			{ ( kind === 'T' || kind === 'L' ) && (
				<div
					style={ {
						position: 'absolute',
						insetInlineStart: '50%',
						insetInlineEnd: 0,
						insetBlockStart: CONNECTOR_TOP_PX,
						borderBlockStart: `1px solid ${ GUIDE_COLOR }`,
					} }
				/>
			) }
		</div>
	);
}

function Guides( { kinds }: { kinds: GuideKind[] } ) {
	if ( kinds.length === 0 ) {
		return null;
	}
	return (
		<div style={ { display: 'flex', flex: '0 0 auto', alignSelf: 'stretch' } }>
			{ kinds.map( ( kind, i ) => (
				<GuideCell key={ i } kind={ kind } />
			) ) }
		</div>
	);
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
				background: 'color-mix(in srgb, var(--wp-admin-theme-color, #3858e9) 8%, transparent)',
			} }
		>
			<div
				style={ {
					position: 'absolute',
					insetBlockStart: 0,
					insetBlockEnd: 0,
					insetInlineStart: 0,
					width: `${ widthPct }%`,
					background: 'color-mix(in srgb, var(--wp-admin-theme-color, #3858e9) 48%, transparent)',
				} }
			/>
		</div>
	);
}

function RowShell( { guides, children }: { guides: GuideKind[]; children: React.ReactNode } ) {
	// Padding lives on the inner content (not the outer flex container) so the
	// stretched guide column spans the row's full height and vertical lines
	// connect continuously from one row to the next.
	return (
		<div style={ { display: 'flex', alignItems: 'stretch' } }>
			<Guides kinds={ guides } />
			<div
				style={ {
					flex: 1,
					minWidth: 0,
					paddingBlock: 4,
					paddingInlineStart: guides.length > 0 ? 8 : 0,
				} }
			>
				{ children }
			</div>
		</div>
	);
}

// Per-transaction average wall-clock time spent in a span (summed across
// every occurrence in a transaction, then averaged over the transactions in
// the bucket). Sums sensibly across siblings unlike `total_ms.max`, which
// only describes a single occurrence and can't be combined.
function avgTotalMsPerTx( span: ApmDetailSpan ): number {
	return span.total_ms.sum / Math.max( 1, span.tx_count );
}

function avgSelfMsPerTx( span: ApmDetailSpan ): number {
	return span.self_ms.sum / Math.max( 1, span.tx_count );
}

function SpanRow( {
	span,
	guides,
	rootMaxMs,
}: {
	span: ApmDetailSpan;
	guides: GuideKind[];
	rootMaxMs: number;
} ) {
	const totalMs = avgTotalMsPerTx( span );
	const selfMs = avgSelfMsPerTx( span );
	const fraction = rootMaxMs > 0 ? totalMs / rootMaxMs : 0;
	const intent = CATEGORY_INTENT[ span.category ] ?? 'default';
	const subtitleParts: string[] = [];
	if ( span.plugin ) {
		subtitleParts.push( span.plugin );
	}
	if ( span.callback_source ) {
		subtitleParts.push( span.callback_source );
	}
	const showSelf = selfMs > 0 && selfMs < totalMs;
	// `count` is occurrences across all transactions in the bucket; show the
	// per-tx average so the label lines up with the per-tx totals shown above.
	const callsPerTx = span.count / Math.max( 1, span.tx_count );
	const showCalls = callsPerTx > 1;

	return (
		<RowShell guides={ guides }>
			<HStack spacing={ 3 } alignment="flex-start" justify="flex-start">
				<div style={ { flex: 1, minWidth: 0 } }>
					<VStack spacing={ 1 }>
						<HStack spacing={ 2 } justify="flex-start" alignment="center" wrap>
							<Badge intent={ intent }>{ span.category }</Badge>
							<Text
								weight={ 500 }
								style={ {
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								} }
							>
								{ span.name }
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
		</RowShell>
	);
}

function PrunedChildrenRow( {
	guides,
	pruned,
}: {
	guides: GuideKind[];
	pruned: ApmDetailSpanPrunedChildren;
} ) {
	return (
		<RowShell guides={ guides }>
			<Text variant="muted" size={ 12 }>
				{ sprintf(
					/* translators: 1: number of child spans hidden, 2: total time those spans took. */
					__( '+ %1$d more child spans (%2$s total)' ),
					pruned.count,
					formatMs( pruned.total_sum_ms )
				) }
			</Text>
		</RowShell>
	);
}

function guidesFor( ancestorIsLast: boolean[], selfIsLast: boolean ): GuideKind[] {
	const kinds: GuideKind[] = ancestorIsLast.map( ( isLast ) => ( isLast ? 'blank' : 'vertical' ) );
	kinds.push( selfIsLast ? 'L' : 'T' );
	return kinds;
}

function renderChildren(
	parentSpan: ApmDetailSpan,
	parentAncestorIsLast: boolean[],
	rootMaxMs: number,
	childrenMap: ChildrenMap
): JSX.Element[] {
	const children = childrenMap.get( parentSpan.id ) ?? [];
	const hasPruned = !! ( parentSpan.pruned_children && parentSpan.pruned_children.count > 0 );
	const out: JSX.Element[] = [];

	for ( let i = 0; i < children.length; i++ ) {
		const child = children[ i ];
		// A child is "last" only if no later real children come after it AND no
		// pruned-children row will be drawn under the parent.
		const isChildLast = i === children.length - 1 && ! hasPruned;
		out.push(
			...renderSubtree( child, parentAncestorIsLast, isChildLast, rootMaxMs, childrenMap )
		);
	}

	if ( hasPruned ) {
		out.push(
			<PrunedChildrenRow
				key={ `${ parentSpan.id }-pruned` }
				guides={ guidesFor( parentAncestorIsLast, true ) }
				pruned={ parentSpan.pruned_children! }
			/>
		);
	}

	return out;
}

// Render a non-root span. `ancestorIsLast` lists, for each ancestor strictly
// between the transaction root and this span (exclusive at both ends), whether
// that ancestor was the last child of its parent. The transaction root is not
// included because it has no guide column of its own.
function renderSubtree(
	span: ApmDetailSpan,
	ancestorIsLast: boolean[],
	selfIsLast: boolean,
	rootMaxMs: number,
	childrenMap: ChildrenMap
): JSX.Element[] {
	const guides = guidesFor( ancestorIsLast, selfIsLast );
	return [
		<SpanRow key={ span.id } span={ span } guides={ guides } rootMaxMs={ rootMaxMs } />,
		...renderChildren( span, [ ...ancestorIsLast, selfIsLast ], rootMaxMs, childrenMap ),
	];
}

// The transaction root is special: it has no guide column itself, but it
// anchors the tree, so its children start with an empty ancestor list.
function renderRoot(
	span: ApmDetailSpan,
	rootMaxMs: number,
	childrenMap: ChildrenMap
): JSX.Element[] {
	return [
		<SpanRow key={ span.id } span={ span } guides={ [] } rootMaxMs={ rootMaxMs } />,
		...renderChildren( span, [], rootMaxMs, childrenMap ),
	];
}

export default function SpanTree( {
	spans,
	pruned,
}: {
	spans: ApmDetailSpan[];
	pruned?: ApmDetailPruned;
} ) {
	if ( spans.length === 0 ) {
		return <Text variant="muted">{ __( 'No spans were captured for this minute.' ) }</Text>;
	}

	const childrenMap = buildChildrenMap( spans );
	const roots = childrenMap.get( null ) ?? [];
	const rootMaxMs = roots.reduce( ( max, s ) => Math.max( max, avgTotalMsPerTx( s ) ), 0 );

	const rows: JSX.Element[] = [];
	for ( const root of roots ) {
		rows.push( ...renderRoot( root, rootMaxMs, childrenMap ) );
	}

	return (
		<div>
			{ rows }
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
