import { useResizeObserver } from '@wordpress/compose';
import { useMemo, Children, isValidElement, useState } from 'react';
import type { GridProps, GridLayoutItem } from './types';
import type { ReactElement } from 'react';

export function Grid( {
	layout,
	columns = 1,
	children,
	className,
	spacing = 2,
	rowHeight = 'auto',
	minColumnWidth,
}: GridProps ) {
	const [ containerWidth, setContainerWidth ] = useState( 0 );
	const responsiveColumns = Math.max( 1, Math.floor( containerWidth / ( minColumnWidth || 1 ) ) );
	const effectiveColumns = minColumnWidth ? responsiveColumns : columns;
	const resizeObserverRef = useResizeObserver( ( [ { contentRect } ] ) => {
		setContainerWidth( contentRect.width );
	} );

	// In responsive mode, sort items by order property (or use original order if not specified)
	const responsiveLayout = useMemo( () => {
		if ( ! minColumnWidth ) {
			return null;
		}

		return [ ...layout ].sort( ( a, b ) => {
			if ( a.order !== undefined && b.order !== undefined ) {
				return a.order - b.order;
			}
			if ( a.order !== undefined ) {
				return -1;
			}
			if ( b.order !== undefined ) {
				return 1;
			}
			return 0;
		} );
	}, [ layout, minColumnWidth ] );

	// Get the number of rows in the layout
	const rows = useMemo( () => {
		const activeLayout = responsiveLayout || layout;
		let maxRow = 0;
		activeLayout.forEach( ( item ) => {
			const itemHeight = item.height || 1;
			maxRow = Math.max( maxRow, ( item.y ?? 0 ) + itemHeight );
		} );
		return maxRow;
	}, [ layout, responsiveLayout ] );

	// Create a map of layout items for quick access
	const activeLayoutMap = useMemo( () => {
		const activeLayout = responsiveLayout || layout;
		const map = new Map< string, GridLayoutItem >();
		activeLayout.forEach( ( item ) => {
			map.set( item.key, item );
		} );
		return map;
	}, [ layout, responsiveLayout ] );

	const gridStyle = {
		display: 'grid',
		gridTemplateColumns: `repeat(${ effectiveColumns }, 1fr)`,
		gridTemplateRows: `repeat(${ rows }, ${ rowHeight })`,
		gap: spacing * 4,
	};

	// Process children and apply grid positioning based on layout
	const gridItems = Children.map( children, ( child ) => {
		// Skip invalid children
		if ( ! isValidElement( child ) ) {
			return null;
		}

		const element = child as ReactElement;
		const key = element.key?.toString();

		const item: Omit< GridLayoutItem, 'key' > = key ? activeLayoutMap.get( key )! ?? {} : {};
		const itemHeight = item.height || 1;

		// Apply grid positioning
		const style = {
			...element.props.style,
			gridColumnStart: item.x !== undefined ? item.x + 1 : undefined,
			gridRowStart: item.y !== undefined ? item.y + 1 : undefined,
			gridColumnEnd: `span ${
				item.fullWidth ? effectiveColumns : Math.min( item.width ?? 1, effectiveColumns )
			}`,
			gridRowEnd: `span ${ itemHeight }`,
		};

		// Clone the element with the updated style
		return {
			...element,
			props: {
				...element.props,
				style,
			},
		};
	} );

	return (
		<div ref={ resizeObserverRef } className={ className } style={ gridStyle }>
			{ gridItems }
		</div>
	);
}
