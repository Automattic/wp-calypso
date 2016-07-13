/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import pickBy from 'lodash/pickBy';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import ThemePreview from './theme-preview';
import ThemesSelection from './themes-selection';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getQueryParams, getThemesList } from 'state/themes/themes-list/selectors';
import { addTracking } from './helpers';

const optionShape = PropTypes.shape( {
	label: PropTypes.string,
	header: PropTypes.string,
	getUrl: PropTypes.func,
	action: PropTypes.func
} );

const ThemeShowcase = React.createClass( {
	propTypes: {
		// Connected props
		options: PropTypes.objectOf( optionShape ),
		defaultOption: optionShape,
		getScreenshotOption: PropTypes.func
	},

	getDefaultProps() {
		return {
			selectedSite: false
		};
	},

	getInitialState() {
		return {
			showPreview: false,
			previewingTheme: null,
		};
	},

	togglePreview( theme ) {
		this.setState( { showPreview: ! this.state.showPreview, previewingTheme: theme } );
	},

	onPreviewButtonClick( theme ) {
		const { defaultOption } = this.props;
		this.setState( { showPreview: false }, () => {
			defaultOption.action( theme );
		} );
	},

	render() {
		const { options, defaultOption, getScreenshotOption } = this.props;

		// If a preview action is passed, use that. Otherwise, use our own.
		if ( options.preview && ! options.preview.action ) {
			options.preview.action = theme => this.togglePreview( theme );
		}

		return (
			<Main className="themes">
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsPageTitle }/>
				{ this.props.children }
				{ this.state.showPreview &&
					<ThemePreview showPreview={ this.state.showPreview }
						theme={ this.state.previewingTheme }
						onClose={ this.togglePreview }
						buttonLabel={ defaultOption.label }
						onButtonClick={ this.onPreviewButtonClick } />
				}
				<ThemesSelection search={ this.props.search }
					siteId={ this.props.siteId }
					selectedSite={ this.props.selectedSite }
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
					tier={ this.props.tier }
					queryParams={ this.props.queryParams }
					themesList={ this.props.themesList } />
			</Main>
		);
	}
} );

export default connect( state => ( {
	queryParams: getQueryParams( state ),
	themesList: getThemesList( state )
} )
)( localize( ThemeShowcase ) );
