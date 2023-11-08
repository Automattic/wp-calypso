import { useBreakpoint } from '@automattic/viewport-react';
import { useCallback, useState, useEffect, RefObject } from 'react';

const DESKTOP_BREAKPOINT = '>1280px';

const useDashboardShowLargeScreen = (
	siteTableRef: RefObject< HTMLTableElement >,
	containerRef: { current: { clientWidth: number } }
) => {
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );

	const [ isOverflowing, setIsOverflowing ] = useState( false );
	const [ tableWidth, setTableWidth ] = useState( 0 );

	const checkIfOverflowing = useCallback( () => {
		setIsOverflowing( tableWidth > containerRef?.current?.clientWidth );
	}, [ containerRef, tableWidth ] );

	// We will need to remember the table width once to properly check if it is overflowing
	useEffect( () => {
		const siteTableEle = siteTableRef ? siteTableRef.current : null;

		if ( ! tableWidth && siteTableEle ) {
			setTableWidth( siteTableEle.clientWidth );
		}
	}, [ siteTableRef, tableWidth ] );

	useEffect(
		() => {
			checkIfOverflowing();

			window.addEventListener( 'resize', checkIfOverflowing );
			return () => {
				window.removeEventListener( 'resize', checkIfOverflowing );
			};
		},
		// Do not add checkIfOverflowing to the dependency array as it will cause an infinite loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	return isDesktop && ! isOverflowing;
};

export default useDashboardShowLargeScreen;
