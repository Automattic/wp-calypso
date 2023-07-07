import { useBreakpoint } from '@automattic/viewport-react';
import { useSelector } from 'react-redux';
import { getSidebarIsCollapsed } from 'calypso/state/ui/selectors';

/**
 * Returns whether the plans grid is rendered on a large screen.
 *
 * @returns boolean isLargeScreen
 */
const useIsLargeScreen = ( { isInSignup }: { isInSignup: boolean } ) => {
	const isSidebarCollapsed = useSelector( getSidebarIsCollapsed );
	const isLargeScreenWithoutSidebar = useBreakpoint( '>780px' );
	const isLargeScreenWithSidebar = useBreakpoint( '>1052px' ); //780 + 272

	if ( isInSignup ) {
		return isLargeScreenWithoutSidebar;
	}
	if ( isSidebarCollapsed ) {
		return isLargeScreenWithoutSidebar;
	}
	return isLargeScreenWithSidebar;
};

export { useIsLargeScreen };
