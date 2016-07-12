/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { wrapThemeOptionsWithSiteSelector } from './themes-site-selector-modal';
import {
	preview,
	purchase,
	activate,
	tryandcustomize,
	separator,
	info,
	support,
	help,
	bindOptionsToDispatch
} from './theme-options';
import ThemeShowcase from './theme-showcase';

const ThemesMultiSite = wrapThemeOptionsWithSiteSelector( '/design' )( props => (
	<ThemeShowcase { ...props }>
		<SidebarNavigation />
	</ThemeShowcase>
) );

const mergeProps = ( stateProps, dispatchProps, ownProps ) => Object.assign(
	{},
	ownProps,
	stateProps,
	{
		options: dispatchProps,
		defaultOption: dispatchProps.tryandcustomize,
		getScreenshotOption: () => dispatchProps.info
	}
);

export default connect(
	null,
	bindOptionsToDispatch( {
		preview,
		purchase,
		activate,
		tryandcustomize,
		separator,
		info,
		support,
		help,
	}, 'showcase' ),
	mergeProps
)( ThemesMultiSite );
