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

const ThemesSelectionWithSiteSelector = React.createClass( {
	propTypes: {
		getScreenshotOption: PropTypes.func,
	},

	render() {
		const { getScreenshotOption, search, options } = this.props;

		return (
			<ThemesSiteSelectorModal { ...this.props } sourcePath="/design">
				<ThemesSelection
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
			</ThemesSiteSelectorModal>
		);
	}
} );

const ConnectedThemesSelection = connectOptions( ThemesSelectionWithSiteSelector );

export const MultiSiteThemeShowcase = ( props ) => (
	<div>
		<ThemeShowcase source="showcase">
			<SidebarNavigation />
		</ThemeShowcase>
		<ConnectedThemesSelection { ...props }
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
	</div>
);

/*const MultiSiteThemeShowcase = React.createClass( {
	propTypes: {
		getScreenshotOption: PropTypes.func,
	},

	render() {
		const { getScreenshotOption, search, options } = this.props;

		return (
			<div>
				<ThemeShowcase source="showcase">
					<SidebarNavigation />
				</ThemeShowcase>
				{ connectOptions( <ThemesSiteSelectorModal { ...this.props } sourcePath="/design">

				</ThemesSiteSelectorModal> ) }
			</div>
		);
	}
} );

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
);*/
