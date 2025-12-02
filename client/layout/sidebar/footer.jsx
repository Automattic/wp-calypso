import { useBreakpoint } from '@automattic/viewport-react';

const SidebarFooter = ( { children } ) => {
	const isDesktop = useBreakpoint( '>=782px' );
	if ( ! children || ! isDesktop ) {
		return null;
	}
	return <div className="sidebar__footer">{ children }</div>;
};

export default SidebarFooter;
