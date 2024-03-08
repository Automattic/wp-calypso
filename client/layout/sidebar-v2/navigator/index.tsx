export * from './navigator-menu';
export * from './navigator-menu-item';

import { __experimentalNavigatorProvider as NavigatorProvider } from '@wordpress/components';

import './style.scss';

interface Props {
	initialPath: string;
	children: React.ReactNode;
}

export const SidebarNavigator = ( { initialPath, children }: Props ) => {
	return (
		<NavigatorProvider className="sidebar-v2__navigator" initialPath={ initialPath }>
			{ children }
		</NavigatorProvider>
	);
};
