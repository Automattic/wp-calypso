import clsx from 'clsx';

type Props = {
	className?: string;
	children: React.ReactNode;
};

export const SidebarV2Footer = ( { className, children }: Props ) => {
	return <div className={ clsx( 'sidebar-v2__footer', className ) }>{ children }</div>;
};
