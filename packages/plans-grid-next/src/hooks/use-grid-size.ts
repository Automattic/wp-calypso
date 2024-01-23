import { useLayoutEffect, useState } from '@wordpress/element';
import type { GridSize } from '../types';

const useGridSizex = ( {
	containerRef,
	leftOffset = 0,
	columnMinWidth = 222,
	columnsInRow = { medium: 3, large: 4 },
}: {
	containerRef: React.MutableRefObject< HTMLDivElement | null >;
	leftOffset?: number;
	columnMinWidth: number;
	columnsInRow: { medium: number; large: number };
} ) => {
	const breakpoints = {
		small: 780,
		large: 1600,
	};

	const largeFit = columnsInRow.large * columnMinWidth;
	const mediumFit = columnsInRow.medium * columnMinWidth;

	const [ gridSize, setGridSize ] = useState< GridSize >( 'large' );

	useLayoutEffect( () => {
		const handleResize = () => {
			const offsetWidth = containerRef.current?.offsetWidth;

			if ( offsetWidth ) {
				const width = offsetWidth + leftOffset;

				if ( width <= breakpoints.small ) {
					if ( gridSize !== 'small' ) {
						console.log( width, offsetWidth );
						setGridSize( 'small' );
					}
				} else if ( width >= breakpoints.large ) {
					if ( gridSize !== 'large' ) {
						console.log( width, offsetWidth );
						setGridSize( 'large' );
					}
				} else if ( gridSize !== 'medium' ) {
					console.log( width, offsetWidth );
					setGridSize( 'medium' );
				}
			}
		};

		window.addEventListener( 'resize', handleResize );
		handleResize();

		return () => {
			window.removeEventListener( 'resize', handleResize );
		};
	}, [ containerRef, gridSize, largeFit, leftOffset, mediumFit, setGridSize ] );

	return gridSize;
};

/**
 * Labelled breakpoints a la "container query".
 * These are currently observed manually (i.e. we do not use container queries),
 * but they could be used in the future in a containment context.
 */
const containerBreakpoints = new Map( [
	[ 'small', 0 ],
	[ 'medium', 725 ],
	[ 'large', 1320 ], // 1320 to fit enterpreneur plan, 1180 to work in admin
] );

const useGridSize = ( {
	containerRef,
	averageColumnMinWidth = 222,
	columnsInRow = { medium: 3, large: 4 },
}: {
	containerRef: React.MutableRefObject< HTMLDivElement | null >;
	averageColumnMinWidth: number;
	columnsInRow: { medium: number; large: number };
} ) => {
	const largeFit = columnsInRow.large * averageColumnMinWidth;
	const mediumFit = columnsInRow.medium * averageColumnMinWidth;

	const [ gridSize, setGridSize ] = useState< string | null >( null );

	useLayoutEffect( () => {
		const handleResize = () => {
			const offsetWidth = containerRef.current?.getBoundingClientRect().width;

			if ( offsetWidth ) {
				const width = offsetWidth;

				for ( const [ key, value ] of [ ...containerBreakpoints ].reverse() ) {
					console.log( key, value, width, offsetWidth );
					if ( width >= value ) {
						if ( gridSize !== key ) {
							console.log( key, width, offsetWidth );
							setGridSize( key );
						}
						break;
					}
				}

				// if ( width < containerBreakpoints.small ) {
				// 	if ( gridSize !== 'small' ) {
				// 		console.log( 'small', width, offsetWidth );
				// 		setGridSize( 'small' );
				// 	}
				// } else if ( width >= containerBreakpoints.small && width < containerBreakpoints.large ) {
				// 	// else if ( width >= largeFit ) {
				// 	if ( gridSize !== 'medium' ) {
				// 		console.log( 'medium', width, offsetWidth );
				// 		setGridSize( 'medium' );
				// 	}
				// } else if ( gridSize !== 'large' ) {
				// 	// else if ( width >= mediumFit ) {
				// 	console.log( 'large', width, offsetWidth );
				// 	setGridSize( 'large' );
				// }
			}
		};

		window.addEventListener( 'resize', handleResize );
		handleResize();

		return () => {
			window.removeEventListener( 'resize', handleResize );
		};
	}, [ containerRef, gridSize, largeFit, mediumFit, setGridSize ] );

	return gridSize;
};

export default useGridSize;
