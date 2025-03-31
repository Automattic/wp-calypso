/**
 * External dependencies
 */
import { __experimentalItemGroup as ItemGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { category, home, navigation } from '@wordpress/icons';
/**
 * Internal dependencies
 */
import { SidebarNavigationItem, SidebarNavigationScreen } from '../../components';
import { useLocation } from '../../router';

const SidebarItems = () => {
	const { path } = useLocation();

	return (
		<ItemGroup>
			<SidebarNavigationItem
				icon={ home }
				key="sidebar-item-introduction"
				to="/"
				uid="introduction"
				aria-current={ path === '/' }
			>
				{ __( 'Introduction', 'a8c-site-admin' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				icon={ category }
				key="sidebar-item-docs-components"
				uid="docs-components"
				to="/components"
				aria-current={ path === '/components' }
				suffix="CHEVRON"
			>
				{ __( 'Components', 'a8c-site-admin' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				icon={ navigation }
				key="sidebar-item-docs-routing-system"
				uid="docs-routing-system"
				to="/routing-system"
				aria-current={ path === '/routing-system' }
			>
				{ __( 'Routing system', 'a8c-site-admin' ) }
			</SidebarNavigationItem>
		</ItemGroup>
	);
};

export function SidebarHome() {
	return (
		<SidebarNavigationScreen
			isRoot
			title={ __( 'Docs', 'a8c-site-admin' ) }
			content={ <SidebarItems /> }
			exitLink="/"
			exitLabel={ __( 'Back to the storybook', 'a8c-site-admin' ) }
		/>
	);
}
