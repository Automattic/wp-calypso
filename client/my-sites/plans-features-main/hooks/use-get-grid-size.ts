import { useBreakpoint } from '@automattic/viewport-react';
import { useSelector } from 'react-redux';
import { GridSize } from 'calypso/my-sites/plan-features-2023-grid/types';
import { getSidebarIsCollapsed } from 'calypso/state/ui/selectors';

const BREAKPOINTS = {
	MEDIUM: 780,
	LARGE: 1200,
};

const BREAKPOINTS_WITH_SIDEBAR = {
	MEDIUM: 780 + 272,
	LARGE: 1200 + 272,
};

/**
 * Returns the size of the grid to be rendered based on the effective viewport.
 * The effective viewport depends on the size of the screen, and whether the sidebar
 * is visible, if present.
 */
const useGetGridSize = ( { isInSignup }: { isInSignup: boolean } ): GridSize => {
	const isSidebarCollapsed = useSelector( getSidebarIsCollapsed );

	const breakpoints = isInSignup || isSidebarCollapsed ? BREAKPOINTS : BREAKPOINTS_WITH_SIDEBAR;

	const isLargeScreen = useBreakpoint( `>${ breakpoints.LARGE }px` );
	const isMediumScreen = useBreakpoint( `>${ breakpoints.MEDIUM }px` );

	if ( isLargeScreen ) {
		return 'large';
	}
	if ( isMediumScreen ) {
		return 'medium';
	}
	return 'small';
};

export { useGetGridSize };
