/**
 * External dependencies
 */
import { __experimentalItemGroup as ItemGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { archive, navigation, settings } from '@wordpress/icons';
/**
 * Internal dependencies
 */
import { SidebarContent, SidebarNavigationItem, SidebarNavigationScreen, SiteHub } from '../../';
import { useLocation, RouterProvider } from '../../../router';
/**
 * Types
 */
import type { SidebarContentProps } from '..';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * Storybook metadata
 */
const meta: Meta< typeof SidebarContent > = {
	title: 'Components/SidebarContent',
	component: SidebarContent,
};

export default meta;

const SidebarItems = () => {
	const { path } = useLocation();

	return (
		<ItemGroup>
			<SidebarNavigationItem
				icon={ navigation }
				key="sidebar-item-reports"
				to="/reports"
				uid="reports"
				suffix="CHEVRON"
				aria-current={ path === '/reports' }
			>
				{ __( 'Reports', 'a8c-site-admin' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				icon={ settings }
				key="sidebar-item-settings"
				to="/settings"
				uid="settings"
				aria-current={ path === '/settings' }
			>
				{ __( 'Settings', 'a8c-site-admin' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				icon={ archive }
				key="sidebar-item-archive"
				to="/archive"
				uid="archive"
				aria-current={ path === '/archive' }
			>
				{ __( 'Archive', 'a8c-site-admin' ) }
			</SidebarNavigationItem>
		</ItemGroup>
	);
};

type Story = StoryObj< typeof SidebarContent >;

export const Default: Story = {
	render: function Template( args: SidebarContentProps ) {
		return (
			<RouterProvider routes={ [] } pathArg="page">
				<SiteHub
					isTransparent
					exitLabel={ __( 'Go to the Dashboard', 'a8c-site-admin' ) }
					exitLink="/"
				/>
				<SidebarContent { ...args }>
					<SidebarNavigationScreen
						isRoot
						title={ __( 'Analytics', 'a8c-site-admin' ) }
						content={ <SidebarItems /> }
					/>
				</SidebarContent>
			</RouterProvider>
		);
	},
};
