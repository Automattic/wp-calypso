export * from './navigator-menu';
export * from './navigator-menu-item';

import { __experimentalNavigatorProvider as NavigatorProvider } from '@wordpress/components';

interface Props {
	initialPath: string;
	children: React.ReactNode;
}

export const SidebarNavigator = ( { initialPath, children }: Props ) => {
	return <NavigatorProvider initialPath={ initialPath }>{ children }</NavigatorProvider>;
};
