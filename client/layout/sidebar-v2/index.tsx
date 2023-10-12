import classNames from 'classnames';

import './style.scss';

type Props = {
	className?: string;
	children: React.ReactNode;
};

const SidebarV2 = ( { children, className = '' }: Props ) => {
	return <nav className={ classNames( 'sidebar-v2', className ) }>{ children }</nav>;
};

export default SidebarV2;
