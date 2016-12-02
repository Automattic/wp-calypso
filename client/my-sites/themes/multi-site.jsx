/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import pickBy from 'lodash/pickBy';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThemesSiteSelectorModal from './themes-site-selector-modal';
import { connectOptions } from './theme-options';
import { addTracking } from './helpers';
import ThemeShowcase from './theme-showcase';
import ThemesSelection from './themes-selection';

const MultiSiteThemeShowcase = connectOptions( React.createClass( {
	propTypes: {
		getScreenshotOption: PropTypes.func,
	},

	render() {
		const { getScreenshotOption, search, options } = this.props;

		return (
			<div>
				<ThemesSiteSelectorModal { ...this.props } sourcePath="/design">
					<ThemeShowcase source="showcase">
						<SidebarNavigation />
					</ThemeShowcase>
				</ThemesSiteSelectorModal>
				<ThemesSelection
					siteId={ this.props.siteId }
					selectedSite={ false }
					getScreenshotUrl={ function( theme ) {
						if ( ! getScreenshotOption( theme ).getUrl ) {
							return null;
						}
						return getScreenshotOption( theme ).getUrl( theme );
					} }
					onScreenshotClick={ function( theme ) {
						if ( ! getScreenshotOption( theme ).action ) {
							return;
						}
						getScreenshotOption( theme ).action( theme );
					} }
					getActionLabel={ function( theme ) {
						return getScreenshotOption( theme ).label;
					} }
					getOptions={ function( theme ) {
						return pickBy(
							addTracking( options ),
							option => ! ( option.hideForTheme && option.hideForTheme( theme ) )
						); } }
					trackScrollPage={ this.props.trackScrollPage }
					search={ search }
					tier={ this.props.tier }
					filter={ this.props.filter }
					vertical={ this.props.vertical }
					queryParams={ this.props.queryParams }
					themesList={ this.props.themesList } />
			</div>
		);
	}
} ) );

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
