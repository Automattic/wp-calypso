/**
 * External dependencies
 */
import { __experimentalItemGroup as ItemGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { archive, Icon, navigation, settings } from '@wordpress/icons';
/**
 * Internal dependencies
 */
import { SidebarContent, SidebarNavigationItem, SidebarNavigationScreen } from '../../';
import { RouterProvider } from '../../../router';
import { useLocation } from '../../../router/hooks';
/**
 * Types
 */
import type { SidebarContentProps } from '..';
import type { Meta, StoryFn } from '@storybook/react';

import './style.stories.scss';

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
				icon={ <Icon icon={ navigation } /> }
				key="sidebar-item-reports"
				to="/reports"
				uid="reports"
				withChevron={ false }
				aria-current={ path === '/reports' }
			>
				{ __( 'Reports' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				icon={ <Icon icon={ settings } /> }
				key="sidebar-item-settings"
				to="/settings"
				uid="settings"
				withChevron={ false }
				aria-current={ path === '/settings' }
			>
				{ __( 'Settings' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				icon={ <Icon icon={ archive } /> }
				key="sidebar-item-archive"
				to="/archive"
				uid="archive"
				withChevron={ false }
				aria-current={ path === '/archive' }
			>
				{ __( 'Archive' ) }
			</SidebarNavigationItem>
		</ItemGroup>
	);
};

const Template: StoryFn< typeof SidebarContent > = ( args: SidebarContentProps ) => (
	<SidebarContent { ...args }>
		<RouterProvider routes={ [] } pathArg="page">
			<SidebarNavigationScreen isRoot title={ __( 'Analytics' ) } content={ <SidebarItems /> } />
		</RouterProvider>
	</SidebarContent>
);

export const Default = Template.bind( {} );

Default.storyName = 'SidebarContent';
Default.args = {};
