import { useLayoutEffect, useState } from '@wordpress/element';

interface Props {
	containerRef: React.MutableRefObject< HTMLDivElement | null >;
	/**
	 * Labelled breakpoints a la "container query".
	 * These are currently observed manually (i.e. we do not use container queries),
	 * but they could be used in the future in a containment context.
	 * The keys are the labels, the values are the minimum widths.
	 */
	containerBreakpoints: Map< string, number >;
}

/**
 * useGridSize returns the current grid size based on the width of the container
 * and the breakpoints passed through as props.
 */
const useGridSize = ( { containerRef, containerBreakpoints }: Props ) => {
	const [ gridSize, setGridSize ] = useState< string | null >( null );

	useLayoutEffect( () => {
		const handleResize = () => {
			const offsetWidth = containerRef.current?.getBoundingClientRect().width;

			if ( offsetWidth ) {
				const width = offsetWidth;

				for ( const [ key, value ] of [ ...containerBreakpoints ].reverse() ) {
					if ( width >= value ) {
						if ( gridSize !== key ) {
							setGridSize( key );
						}
						break;
					}
				}
			}
		};

		window.addEventListener( 'resize', handleResize );
		handleResize();

		return () => {
			window.removeEventListener( 'resize', handleResize );
		};
	}, [ containerBreakpoints, containerRef, gridSize, setGridSize ] );

	return gridSize;
};

export default useGridSize;
