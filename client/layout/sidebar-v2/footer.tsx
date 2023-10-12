type Props = {
	children: React.ReactNode;
};

const SidebarV2Footer = ( { children }: Props ) => {
	if ( ! children ) {
		return null;
	}
	return <div className="sidebar-v2__footer">{ children }</div>;
};

export default SidebarV2Footer;
