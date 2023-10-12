type Props = {
	children: React.ReactNode;
};

const SidebarV2Main = ( { children }: Props ) => {
	return <div className="sidebar-v2__main">{ children }</div>;
};

export default SidebarV2Main;
