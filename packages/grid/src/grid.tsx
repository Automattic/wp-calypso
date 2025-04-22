import { useMemo, Children, isValidElement } from 'react';
import type { GridProps, GridLayoutItem } from './types';
import type { ReactElement } from 'react';

export function Grid( {
	layout,
	columns = 1,
	children,
	className,
	spacing = 2,
	rowHeight = 'auto',
}: GridProps ) {
	// Create a map of layout items by key for quick lookup
	const layoutMap = useMemo( () => {
		const map = new Map< string, GridLayoutItem >();
		layout.forEach( ( item ) => {
			map.set( item.key, item );
		} );
		return map;
	}, [ layout ] );

	// Get the number of rows in the layout
	const rows = useMemo( () => {
		let maxRow = 0;
		layout.forEach( ( item ) => {
			const itemHeight = item.height || 1;
			maxRow = Math.max( maxRow, ( item.y ?? 0 ) + itemHeight );
		} );
		return maxRow;
	}, [ layout ] );

	const gridStyle = {
		display: 'grid',
		gridTemplateColumns: `repeat(${ columns }, 1fr)`,
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

		const item: Omit< GridLayoutItem, 'key' > = key ? layoutMap.get( key )! ?? {} : {};
		const itemHeight = item.height || 1;

		// Apply grid positioning
		const style = {
			...element.props.style,
			gridColumnStart: item.x !== undefined ? item.x + 1 : undefined,
			gridRowStart: item.y !== undefined ? item.y + 1 : undefined,
			gridColumnEnd: `span ${ item.width }`,
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
		<div className={ className } style={ gridStyle }>
			{ gridItems }
		</div>
	);
}
