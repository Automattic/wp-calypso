const SidebarFooter = ( { children } ) => {
	if ( ! children ) {
		return null;
	}
	return <div className="sidebar__footer">{ children }</div>;
};

export default SidebarFooter;
