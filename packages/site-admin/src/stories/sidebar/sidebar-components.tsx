/**
 * External dependencies
 */
import { __experimentalItemGroup as ItemGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { SidebarNavigationItem, SidebarNavigationScreen } from '../../components';
import { useLocation } from '../../router';

const SidebarComponentsItems = () => {
	const { path } = useLocation();

	return (
		<ItemGroup>
			<SidebarNavigationItem
				key="sidebar-components-sidebar-button"
				uid="components-sidebar-button"
				to="/components/sidebar-button"
				aria-current={ path === '/components/sidebar-button' }
			>
				{ __( 'SidebarButton', 'a8c-site-admin' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				key="sidebar-components-sidebar"
				to="/components/sidebar"
				uid="components-sidebar"
				aria-current={ path === '/components/sidebar' }
			>
				{ __( 'SidebarContent', 'a8c-site-admin' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				key="sidebar-components-sidebar-navigation-item"
				uid="components-sidebar-navigation-item"
				to="/components/sidebar-navigation-item"
				aria-current={ path === '/components/sidebar-navigation-item' }
			>
				{ __( 'SidebarNavigationItem', 'a8c-site-admin' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				key="sidebar-components-sidebar-navigation-screen"
				uid="components-sidebar-navigation-screen"
				to="/components/sidebar-navigation-screen"
				aria-current={ path === '/components/sidebar-navigation-screen' }
			>
				{ __( 'SidebarNavigationScreen', 'a8c-site-admin' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				key="sidebar-components-site-hub"
				uid="components-site-hub"
				to="/components/site-hub"
				aria-current={ path === '/components/site-hub' }
			>
				{ __( 'SiteHub', 'a8c-site-admin' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				key="sidebar-components-site-icon"
				uid="components-site-icon"
				to="/components/site-icon"
				aria-current={ path === '/components/site-icon' }
			>
				{ __( 'SiteIcon', 'a8c-site-admin' ) }
			</SidebarNavigationItem>
		</ItemGroup>
	);
};

export function SidebarComponents() {
	return (
		<SidebarNavigationScreen
			isRoot={ false }
			backPath="/"
			title={ __( 'Components', 'a8c-site-admin' ) }
			content={ <SidebarComponentsItems /> }
			exitLink="/"
			exitLabel={ __( 'Back to the storybook', 'a8c-site-admin' ) }
		/>
	);
}
