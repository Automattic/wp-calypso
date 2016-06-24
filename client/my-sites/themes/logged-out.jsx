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
import { signup } from 'state/themes/actions' ;
import ThemePreview from './theme-preview';
import ThemePickButton from 'my-sites/theme/theme-pick-button';
import ThemesSelection from './themes-selection';
import { getSignupUrl, getDetailsUrl, getSupportUrl, isPremium, addTracking } from './helpers';
import actionLabels from './action-labels';
import { getQueryParams, getThemesList } from 'state/themes/themes-list/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';

const ThemesLoggedOut = React.createClass( {

	getInitialState() {
		return {
			showPreview: false
		};
	},

	togglePreview( theme ) {
		this.setState( { showPreview: ! this.state.showPreview, previewingTheme: theme } );
	},

	getButtonOptions() {
		const buttonOptions = {
			signup: {
				getUrl: theme => getSignupUrl( theme ),
			},
			preview: {
				action: theme => this.togglePreview( theme ),
				hideForTheme: theme => theme.active
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

	onPreviewButtonClick() {
		this.setState( { showPreview: false } );
	},

	render() {
		const buttonOptions = this.getButtonOptions();

		return (
			<Main className="themes">
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsPageTitle }/>
				{ this.state.showPreview &&
					<ThemePreview showPreview={ this.state.showPreview }
						theme={ this.state.previewingTheme }
						onClose={ this.togglePreview }
					>
						<ThemePickButton theme={ this.state.previewingTheme } onClick={ this.onPreviewButtonClick } />
					</ThemePreview>
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
			</Main>
		);
	}
} );

export default connect(
	state => ( {
		queryParams: getQueryParams( state ),
		themesList: getThemesList( state )
	} ),
	{ signup }
)( ThemesLoggedOut );
