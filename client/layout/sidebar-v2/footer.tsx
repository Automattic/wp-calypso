import classNames from 'classnames';

type Props = {
	className?: string;
	children: React.ReactNode;
};

export const SidebarV2Footer = ( { className, children }: Props ) => {
	return <div className={ classNames( 'sidebar-v2__footer', className ) }>{ children }</div>;
};
