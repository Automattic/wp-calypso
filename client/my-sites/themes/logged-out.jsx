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
import ThemesSelection from './themes-selection';
import { getSignupUrl, getDetailsUrl, getSupportUrl, isPremium, addTracking } from './helpers';
import actionLabels from './action-labels';
import { getQueryParams, getThemesList } from 'state/themes/themes-list/selectors';

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

	onPreviewButtonClick( theme ) {
		this.setState( { showPreview: false },
			() => {
				this.props.dispatch( signup( theme ) );
			} );
	},

	render() {
		const buttonOptions = this.getButtonOptions();

		return (
			<Main className="themes">
				{ this.state.showPreview &&
					<ThemePreview showPreview={ this.state.showPreview }
						theme={ this.state.previewingTheme }
						onClose={ this.togglePreview }
						buttonLabel={ this.translate( 'Choose this design', {
							comment: 'when signing up for a WordPress.com account with a selected theme'
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
			</Main>
		);
	}
} );

export default connect(
	state => ( {
		queryParams: getQueryParams( state ),
		themesList: getThemesList( state )
	} )
)( ThemesLoggedOut );
