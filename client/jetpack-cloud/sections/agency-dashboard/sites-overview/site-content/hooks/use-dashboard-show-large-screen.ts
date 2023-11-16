import { useBreakpoint } from '@automattic/viewport-react';
import { useCallback, useState, useEffect, RefObject } from 'react';

const DESKTOP_BREAKPOINT = '>1280px';

const useDashboardShowLargeScreen = (
	siteTableRef: RefObject< HTMLTableElement >,
	containerRef: { current: { clientWidth: number } }
) => {
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );

	const [ overflowingBreakpoint, setOverflowingBreakpoint ] = useState( 0 );
	const [ isOverflowing, setIsOverflowing ] = useState( false );

	const checkIfOverflowing = useCallback( () => {
		const siteTableEle = siteTableRef ? siteTableRef.current : null;

		if ( siteTableEle ) {
			if ( siteTableEle.clientWidth > containerRef?.current?.clientWidth ) {
				// We will need to remember the breakpoint where we overflowed so that we can
				// check if we are still overflowing when the window is resized to bigger size
				setOverflowingBreakpoint( siteTableEle.clientWidth );
				setIsOverflowing( true );
			}
		} else if ( overflowingBreakpoint < containerRef?.current?.clientWidth ) {
			setIsOverflowing( false );
		}
	}, [ siteTableRef, overflowingBreakpoint, containerRef ] );

	useEffect( () => {
		window.addEventListener( 'resize', checkIfOverflowing );
		return () => {
			window.removeEventListener( 'resize', checkIfOverflowing );
		};
	}, [ checkIfOverflowing ] );

	useEffect( () => {
		checkIfOverflowing();
		// Do not add checkIfOverflowing to the dependency array as it will cause an infinite loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return isDesktop && ! isOverflowing;
};

export default useDashboardShowLargeScreen;
