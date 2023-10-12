type Props = {
	children: React.ReactNode;
};

const SidebarV2Footer = ( { children }: Props ) => {
	return <div className="sidebar-v2__footer">{ children }</div>;
};

export default SidebarV2Footer;
