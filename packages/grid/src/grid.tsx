import { useResizeObserver } from '@wordpress/compose';
import clsx from 'clsx';
import { useMemo, Children, isValidElement, useState, CSSProperties } from 'react';
import { useDraggableGrid } from './use-draggable-grid';
import { normalizeLayout } from './utils';
import type { GridProps, GridLayoutItem } from './types';
import type { ReactElement, ReactNode } from 'react';

export function Grid( {
	layout,
	columns = 6,
	children,
	className,
	spacing = 2,
	rowHeight = 'auto',
	minColumnWidth,
	editMode = false,
	onChangeLayout,
}: GridProps ) {
	const [ containerWidth, setContainerWidth ] = useState( 0 );
	const resizeObserverRef = useResizeObserver( ( [ { contentRect } ] ) => {
		setContainerWidth( contentRect.width );
	} );
	const normalizedLayout = useMemo( () => {
		return normalizeLayout( layout );
	}, [ layout ] );

	const gapPx = spacing * 4;

	const effectiveColumns = useMemo( () => {
		if ( ! minColumnWidth ) {
			return columns;
		}

		const totalWidthPerColumn = minColumnWidth + gapPx;
		const maxColumns = Math.floor( ( containerWidth + gapPx ) / totalWidthPerColumn );
		return Math.max( 1, maxColumns );
	}, [ minColumnWidth, gapPx, containerWidth, columns ] );

	const {
		handleDragStart,
		handleDragOver,
		handleDragEnter,
		handleDragEnd,
		handleDrop,
		isDragging,
		tempLayout,
	} = useDraggableGrid( normalizedLayout, editMode, onChangeLayout );

	const activeLayout = tempLayout || normalizedLayout;

	// Map for quick layout item lookup
	const activeLayoutMap = useMemo( () => {
		const map = new Map< string, GridLayoutItem >();
		activeLayout.forEach( ( item ) => map.set( item.key, item ) );
		return map;
	}, [ activeLayout ] );

	// Sort children based on layout order
	const sortedChildren = useMemo( () => {
		// Group children by whether they have layout items
		const withLayout: ReactElement[] = [];
		const withoutLayout: ReactNode[] = [];

		Children.forEach( children, ( child ) => {
			if ( ! isValidElement( child ) ) {
				withoutLayout.push( child );
				return;
			}

			const key = child.key?.toString();
			if ( key && activeLayoutMap.has( key ) ) {
				withLayout.push( child );
			} else {
				withoutLayout.push( child );
			}
		} );

		// Sort by order property
		withLayout.sort( ( a, b ) => {
			const keyA = a.key?.toString() ?? '';
			const keyB = b.key?.toString() ?? '';
			const orderA = activeLayoutMap.get( keyA )?.order ?? 0;
			const orderB = activeLayoutMap.get( keyB )?.order ?? 0;
			return orderA - orderB;
		} );

		return [ ...withLayout, ...withoutLayout ];
	}, [ children, activeLayoutMap ] );

	const gridItems = Children.map( sortedChildren, ( child, index ) => {
		const element = child as ReactElement;
		const key = element.key?.toString();
		if ( ! key ) {
			return element;
		}

		const item: Omit< GridLayoutItem, 'key' > = activeLayoutMap.get( key ) ?? {};
		const style: CSSProperties = {
			...element.props.style,
			gridColumnEnd: `span ${
				item.fullWidth ? effectiveColumns : Math.min( item.width ?? 1, effectiveColumns )
			}`,
			gridRowEnd: `span ${ item.height || 1 }`,
		};

		if ( editMode ) {
			Object.assign( style, {
				cursor: 'grab',
				transition: 'all 0.2s ease',
				position: 'relative',
				userSelect: 'none',
				boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
			} );
		}

		return {
			...element,
			props: {
				...element.props,
				style,
				...( editMode && {
					draggable: true,
					onDragStart: ( e: React.DragEvent ) => handleDragStart( e, key, index ),
					onDragOver: handleDragOver,
					onDragEnter: ( e: React.DragEvent ) => handleDragEnter( e, key, index ),
					onDragEnd: handleDragEnd,
					onDrop: handleDrop,
				} ),
			},
		};
	} );

	return (
		<div
			ref={ resizeObserverRef }
			className={ clsx( className, {
				'grid-edit-mode': editMode,
				'grid-dragging': isDragging,
			} ) }
			style={ {
				display: 'grid',
				gridTemplateColumns: `repeat(${ effectiveColumns }, 1fr)`,
				gridAutoRows: rowHeight,
				gap: gapPx,
			} }
		>
			{ gridItems }
		</div>
	);
}
