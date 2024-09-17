import clsx from 'clsx';
import { debounce } from 'lodash';
import { FC, PropsWithChildren, useRef, useLayoutEffect } from 'react';

import './style.scss';

const calculateMasonryGrid = ( wrapper: HTMLElement ) => {
	const wrapperStyle = getComputedStyle( wrapper );
	const columnCount = wrapperStyle.gridTemplateColumns.split( ' ' ).length;
	const rowGap = parseFloat( wrapperStyle.rowGap ) || 0;

	const items = Array.from( wrapper.children ) as HTMLElement[];

	if ( columnCount === 1 ) {
		items.forEach( ( item ) => {
			item.style.removeProperty( 'margin-top' );
		} );

		return;
	}

	// Always reset all items on the first row, since the number of grid columns is variable
	items.slice( 0, columnCount ).forEach( ( item ) => {
		item.style.removeProperty( 'margin-top' );
	} );

	// We calculate the difference between the top coordinates of each item with the bottom
	// coordinates of the first item in the same column. This value is then used to set a negative
	// `margin-top`, simulating a Masonry layout
	items.slice( columnCount ).forEach( ( item, i ) => {
		const aboveItemData = items[ i ].getBoundingClientRect();
		const currentItemData = item.getBoundingClientRect();

		const currentMarginTop = parseFloat( item.style.marginTop ) || 0;

		const marginTop = aboveItemData.bottom - currentItemData.top + rowGap + currentMarginTop;

		if ( marginTop <= -1 ) {
			item.style.marginTop = `${ marginTop }px`;
		} else {
			item.style.removeProperty( 'margin-top' );
		}
	} );
};

const debouncedCalculateMasonryGrid = debounce( calculateMasonryGrid, 100, { leading: true } );

type MasonryGridProps = PropsWithChildren< {
	className?: string;
} >;

export const MasonryGrid: FC< MasonryGridProps > = ( { children, className } ) => {
	const ref = useRef< HTMLDivElement >( null );

	useLayoutEffect( () => {
		if ( ! ref.current ) {
			return;
		}

		const element = ref.current;
		debouncedCalculateMasonryGrid( element );

		const resizeObserver = new ResizeObserver( () => debouncedCalculateMasonryGrid( element ) );
		// Is used in 3 cases:
		// 1) Resizing browser window
		// 2) When items are initially rendered as a skeleton and then appears actual data
		// 3) When items' content are changed dynamically (2-nd point is actually part of it, but decided to mention separately cases with loaders and dynamic changes after users' interaction)
		Array.from( ref.current.children ).forEach( ( el ) => resizeObserver.observe( el ) );

		return () => {
			resizeObserver.disconnect();
			debouncedCalculateMasonryGrid.cancel();
		};
	}, [ ref.current?.children.length ] );

	return (
		<div className={ clsx( 'masonry-grid__wrapper', className ) } ref={ ref }>
			{ children }
		</div>
	);
};
