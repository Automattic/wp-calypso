import classNames from 'classnames';

type Props = {
	children: React.ReactNode;
	className?: string;
};

const SidebarV2Header = ( { children, className }: Props ) => {
	return <div className={ classNames( 'sidebar-v2__header', className ) }>{ children }</div>;
};

export default SidebarV2Header;
