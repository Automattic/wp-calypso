import clsx from 'clsx';

type Props = {
	children: React.ReactNode;
	className?: string;
};

export const SidebarV2Header = ( { children, className }: Props ) => {
	return <div className={ clsx( 'sidebar-v2__header', className ) }>{ children }</div>;
};
