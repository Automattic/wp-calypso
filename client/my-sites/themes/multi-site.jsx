/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThemesSiteSelectorModal from './themes-site-selector-modal';
import { connectOptions } from './theme-options';
import QueryUserPurchases from 'components/data/query-user-purchases';
import ThemeShowcase from './theme-showcase';
import userFactory from 'lib/user';

const user = userFactory();

const MultiSiteThemeShowcase = connectOptions(
	( props ) => (
		<ThemesSiteSelectorModal { ...props } sourcePath="/design">
			<ThemeShowcase source="showcase">
				{ <QueryUserPurchases userId={ user.get().ID } /> }
				<SidebarNavigation />
			</ThemeShowcase>
		</ThemesSiteSelectorModal>
	)
);

export default ( props ) => (
	<MultiSiteThemeShowcase { ...props }
		options={ [
			'preview',
			'purchase',
			'activate',
			'tryandcustomize',
			'separator',
			'info',
			'support',
			'help',
		] }
		defaultOption="activate"
		secondaryOption="tryandcustomize"
		getScreenshotOption={ function() {
			return 'info';
		} } />
);
