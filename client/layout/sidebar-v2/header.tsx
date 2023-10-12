type Props = {
	children: React.ReactNode;
};

const SidebarV2Header = ( { children }: Props ) => {
	return <div className="sidebar-v2__header">{ children }</div>;
};

export default SidebarV2Header;
