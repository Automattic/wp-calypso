import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import ResizeHandle from './resize-handle';
import type { GridLayoutItem } from './types';

export function GridItem( {
	item,
	maxColumns,
	disabled = false,
	children,
	onResize,
	onResizeEnd,
}: {
	item: GridLayoutItem;
	maxColumns: number;
	disabled?: boolean;
	children: React.ReactNode;
	onResize: ( delta: { width: number; height: number } ) => void;
	onResizeEnd: () => void;
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

	// Inner content style with scaling effect
	// The reason we need a separate "content" div is because the scaling animation
	// impacts the computation done by useSortable if they're applied to the same div.
	const contentStyle = {
		position: 'relative' as const,
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

	// Preview overlay element (rendered directly in the GridItem)
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

	return (
		<div ref={ setNodeRef } style={ style } { ...attributes } { ...listeners }>
			<div style={ contentStyle }>
				{ children }
				<ResizeHandle
					disabled={ disabled }
					itemId={ item.key }
					onResize={ handleResize }
					onResizeEnd={ handleResizeEnd }
				/>
			</div>
			{ previewOverlay }
		</div>
	);
}
