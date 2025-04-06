/**
 * External dependencies
 */
import { __experimentalItemGroup as ItemGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { category, pages, tag } from '@wordpress/icons';
/**
 * Internal dependencies
 */
import { SidebarNavigationItem, SidebarNavigationScreen, useLocation } from '../../../';

const SidebarItems = () => {
	const { path } = useLocation();

	return (
		<ItemGroup>
			<SidebarNavigationItem
				icon={ pages }
				key="sidebar-item-pages"
				uid="pages"
				to="/pages"
				aria-current={ path === '/pages' }
				suffix="CHEVRON"
			>
				{ __( 'Pages', 'a8c-site-admin' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				icon={ category }
				key="sidebar-item-categories"
				uid="categories"
				to="/categories"
				aria-current={ path === '/categories' }
				suffix="CHEVRON"
			>
				{ __( 'Categories', 'a8c-site-admin' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				icon={ tag }
				key="sidebar-item-tags"
				uid="tags"
				to="/tags"
				aria-current={ path === '/tags' }
				suffix="CHEVRON"
			>
				{ __( 'Tags', 'a8c-site-admin' ) }
			</SidebarNavigationItem>
		</ItemGroup>
	);
};

export function SidebarHome() {
	return (
		<SidebarNavigationScreen
			isRoot
			title={ __( 'Admin', 'a8c-site-admin' ) }
			description={ __(
				'Customize the appearance of your website using the block editor.',
				'a8c-site-admin'
			) }
			content={ <SidebarItems /> }
			exitLink="/"
			exitLabel={ __( 'Back to the storybook', 'a8c-site-admin' ) }
		/>
	);
}
