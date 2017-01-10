/**
 * External dependencies
 */
import React, { Component } from 'react';
import noop from 'lodash/noop';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import getThemes from 'lib/signup/themes';
import ThemesList from 'components/themes-list';
import { abtest } from 'lib/abtest';

class SignupThemesList extends Component {

	static propTypes = {
		surveyQuestion: React.PropTypes.string,
		designType: React.PropTypes.string,
		handleScreenshotClick: React.PropTypes.func,
		handleThemeUpload: React.PropTypes.func,
		showThemeUpload: React.PropTypes.bool
	};

	static defaultProps = {
		surveyQuestion: null,
		designType: null,
		handleScreenshotClick: noop,
		handleThemeUpload: noop,
		showThemeUpload: 'showThemeUpload' === abtest( 'signupThemeUpload' )
	};

	shouldComponentUpdate( nextProps ) {
		return ( nextProps.surveyQuestion !== this.props.surveyQuestion || nextProps.designType !== this.props.designType );
	}

	getComputedThemes() {
		return getThemes( this.props.surveyQuestion, this.props.designType );
	}

	getScreenshotUrl( theme ) {
		return `https://i1.wp.com/s0.wp.com/wp-content/themes/${ theme.repo }/${ theme.slug }/screenshot.png?w=660`;
	}

	render() {
		const actionLabel = this.props.translate( 'Pick' );
		const getActionLabel = () => actionLabel;

		const themes = this.getComputedThemes().map( theme => {
			return {
				...theme,
				id: theme.slug,
				screenshot: this.getScreenshotUrl( theme ),
			};
		} );

		return (
			<ThemesList
				getButtonOptions= { noop }
				onScreenshotClick= { this.props.handleScreenshotClick }
				onMoreButtonClick= { noop }
				getActionLabel={ getActionLabel }
				themes= { themes }
				showThemeUpload= { this.props.showThemeUpload }
				onThemeUpload= { this.props.handleThemeUpload }
			/>
		);
	}
}

export default localize( SignupThemesList );

