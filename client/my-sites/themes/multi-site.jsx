/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import pickBy from 'lodash/pickBy';
import merge from 'lodash/merge';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { customize, purchase, activate } from 'state/themes/actions';
import ThemePreview from './theme-preview';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThemesSiteSelectorModal from './themes-site-selector-modal';
import ThemesSelection from './themes-selection';
import { getDetailsUrl, getSupportUrl, isPremium, addTracking } from './helpers';
import actionLabels from './action-labels';
import { getQueryParams, getThemesList } from 'state/themes/themes-list/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import config from 'config';

const ThemesMultiSite = React.createClass( {

	getInitialState() {
		return {
			selectedTheme: null,
			selectedAction: null,
		};
	},

	showSiteSelectorModal( action, theme ) {
		this.setState( { selectedTheme: theme, selectedAction: action } );
	},

	togglePreview( theme ) {
		this.setState( { showPreview: ! this.state.showPreview, previewingTheme: theme } );
	},

	hideSiteSelectorModal() {
		this.showSiteSelectorModal( null, null );
	},

	isThemeOrActionSet() {
		return this.state.selectedTheme || this.state.selectedAction;
	},

	getButtonOptions() {
		const buttonOptions = {
			preview: {
				action: theme => this.togglePreview( theme ),
				hideForTheme: theme => theme.active
			},
			purchase: config.isEnabled( 'upgrades/checkout' )
				? {
					action: theme => this.showSiteSelectorModal( 'purchase', theme ),
					hideForTheme: theme => theme.active || theme.purchased || ! theme.price
				}
				: {},
			activate: {
				action: theme => this.showSiteSelectorModal( 'activate', theme ),
				hideForTheme: theme => theme.active || ( theme.price && ! theme.purchased )
			},
			customize: {
				action: theme => this.showSiteSelectorModal( 'customize', theme ),
				hideForTheme: theme => ! theme.active
			},
			separator: {
				separator: true
			},
			details: {
				getUrl: theme => getDetailsUrl( theme ),
			},
			support: {
				getUrl: theme => getSupportUrl( theme ),
				// Free themes don't have support docs.
				hideForTheme: theme => ! isPremium( theme )
			},
		};
		return merge( {}, buttonOptions, actionLabels );
	},

	onPreviewButtonClick( theme ) {
		this.setState( { showPreview: false },
			() => {
				this.getButtonOptions().customize.action( theme );
			} );
	},

	render() {
		const buttonOptions = this.getButtonOptions();

		return (
			<Main className="themes">
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsPageTitle }/>
				<SidebarNavigation />
				{ this.state.showPreview &&
					<ThemePreview showPreview={ this.state.showPreview }
						theme={ this.state.previewingTheme }
						onClose={ this.togglePreview }
						buttonLabel={ this.translate( 'Try & Customize', {
							context: 'when previewing a theme demo, this button opens the Customizer with the previewed theme'
						} ) }
						onButtonClick={ this.onPreviewButtonClick } />
				}
				<ThemesSelection search={ this.props.search }
					selectedSite={ false }
					onScreenshotClick={ function( theme ) {
						buttonOptions.preview.action( theme );
					} }
					getActionLabel={ function() {
						return buttonOptions.preview.label;
					} }
					getOptions={ function( theme ) {
						return pickBy(
							addTracking( buttonOptions ),
							option => ! ( option.hideForTheme && option.hideForTheme( theme ) )
						); } }
					trackScrollPage={ this.props.trackScrollPage }
					tier={ this.props.tier }
					queryParams={ this.props.queryParams }
					themesList={ this.props.themesList } />
				{ this.isThemeOrActionSet() && <ThemesSiteSelectorModal
					name={ this.state.selectedAction /* TODO: Can we get rid of this prop? */ }
					label={ actionLabels[ this.state.selectedAction ].label }
					header={ actionLabels[ this.state.selectedAction ].header }
					selectedTheme={ this.state.selectedTheme }
					onHide={ this.hideSiteSelectorModal }
					action={ this.props[ this.state.selectedAction ] }
					sourcePath={ '/design' }
				/> }
			</Main>
		);
	}
} );

export default connect(
	state => ( {
		queryParams: getQueryParams( state ),
		themesList: getThemesList( state )
	} ),
	{
		activate,
		customize,
		purchase
	}
)( ThemesMultiSite );
