/**
 * External dependencies.
 */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useResizeObserver } from '@wordpress/compose';
import { useState, useMemo } from 'react';
/**
 * Internal dependencies.
 */
import { useGridMetrics, GridItemSizeProvider } from './contexts';
import ResizeHandle from './resize-handle';
/**
 * Types
 */
import type { GridLayoutItem } from './types';
import type { CSSProperties, ReactNode } from 'react';

type RenderArgs = {
	contentRef: ( el: HTMLDivElement | null ) => void;
	contentStyle: CSSProperties;
	resizeHandle: ReactNode;
};

export function GridItemBase( {
	item,
	maxColumns,
	disabled = false,
	children,
	onResize,
	onResizeEnd,
	renderContent,
}: {
	item: GridLayoutItem;
	maxColumns: number;
	disabled?: boolean;
	children: ReactNode;
	onResize: ( delta: { width: number; height: number } ) => void;
	onResizeEnd: () => void;
	renderContent?: ( args: RenderArgs ) => ReactNode;
} ) {
	const [ previewDelta, setPreviewDelta ] = useState< { width: number; height: number } | null >(
		null
	);

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable( {
		id: item.key,
		disabled,
	} );

	const dragCursor = isDragging ? 'grabbing' : 'grab';
	const style = {
		transform: CSS.Translate.toString( transform ),
		transition,
		gridColumnEnd: `span ${
			item.fullWidth ? maxColumns : Math.min( item.width ?? 1, maxColumns )
		}`,
		gridRowEnd: `span ${ item.height || 1 }`,
		cursor: disabled ? 'default' : dragCursor,
		position: 'relative' as const,
		zIndex: isDragging ? 2 : undefined,
	};

	const contentStyle: CSSProperties = {
		position: 'relative',
		transition: 'transform 200ms ease, box-shadow 200ms ease',
		transform: isDragging ? 'scale(1.05)' : undefined,
		boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : undefined,
		height: '100%',
	};

	const handleResize = ( delta: { width: number; height: number } ) => {
		setPreviewDelta( delta );
		onResize( delta );
	};

	const handleResizeEnd = () => {
		setPreviewDelta( null );
		onResizeEnd();
	};

	const resizeHandle = (
		<ResizeHandle
			disabled={ disabled }
			itemId={ item.key }
			onResize={ handleResize }
			onResizeEnd={ handleResizeEnd }
		/>
	);

	const previewOverlay = previewDelta ? (
		<div
			style={ {
				position: 'absolute',
				top: 0,
				left: 0,
				right: -previewDelta.width,
				bottom: -previewDelta.height,
				border: '2px dashed var(--wp-admin-theme-color, #0087be)',
				background: 'rgba(0, 135, 190, 0.1)',
				pointerEvents: 'none',
				zIndex: 1,
			} }
		/>
	) : null;

	const contentRefCb: ( el: HTMLDivElement | null ) => void = () => {};

	return (
		<div ref={ setNodeRef } style={ style } { ...attributes } { ...listeners }>
			{ renderContent ? (
				renderContent( { contentRef: ( el ) => contentRefCb( el ), contentStyle, resizeHandle } )
			) : (
				<div ref={ contentRefCb } style={ contentStyle }>
					{ children }
					{ resizeHandle }
				</div>
			) }
			{ previewOverlay }
		</div>
	);
}

export function GridItemBasic( props: {
	item: GridLayoutItem;
	maxColumns: number;
	disabled?: boolean;
	children: ReactNode;
	onResize: ( delta: { width: number; height: number } ) => void;
	onResizeEnd: () => void;
} ) {
	return (
		<GridItemBase
			{ ...props }
			renderContent={ ( { contentRef, contentStyle, resizeHandle } ) => (
				<div ref={ contentRef } style={ contentStyle }>
					{ props.children }
					{ resizeHandle }
				</div>
			) }
		/>
	);
}

export function GridItemMeasured( props: {
	item: GridLayoutItem;
	maxColumns: number;
	disabled?: boolean;
	children: ReactNode;
	onResize: ( delta: { width: number; height: number } ) => void;
	onResizeEnd: () => void;
} ) {
	const metrics = useGridMetrics();
	const cols = props.item.fullWidth
		? props.maxColumns
		: Math.min( props.item.width ?? 1, props.maxColumns );
	const rows = props.item.height ?? 1;

	const needMeasure = !! metrics && metrics.rowHeight === 'auto';
	const [ heightPxMeasured, setHeightPxMeasured ] = useState( 0 );
	const contentMeasureRef = useResizeObserver( ( [ { contentRect } ] ) => {
		if ( ! needMeasure ) {
			return;
		}
		setHeightPxMeasured( contentRect.height );
	} );

	const widthPx = metrics ? metrics.spanToPxX( cols ) : 0;
	const baseHeightPx = metrics ? metrics.spanToPxY( rows ) : 0;
	const heightPx = needMeasure ? heightPxMeasured : baseHeightPx;

	const size = useMemo(
		() => ( { widthPx, heightPx, cols, rows } ),
		[ widthPx, heightPx, cols, rows ]
	);

	return (
		<GridItemBase
			{ ...props }
			renderContent={ ( { contentRef, contentStyle, resizeHandle } ) => (
				<GridItemSizeProvider id={ props.item.key } size={ size }>
					<div
						ref={ ( el ) => {
							contentRef( el );
							contentMeasureRef( needMeasure ? el : null );
						} }
						style={ contentStyle }
					>
						{ props.children }
						{ resizeHandle }
					</div>
				</GridItemSizeProvider>
			) }
		/>
	);
}
