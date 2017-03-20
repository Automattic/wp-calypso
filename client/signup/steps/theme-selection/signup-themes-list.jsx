/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import noop from 'lodash/noop';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import getThemes from 'lib/signup/themes';
import ThemesList from 'components/themes-list';

class SignupThemesList extends Component {

	static propTypes = {
		surveyQuestion: PropTypes.string,
		designType: PropTypes.string,
		handleScreenshotClick: PropTypes.func,
		translate: PropTypes.func
	};

	static defaultProps = {
		surveyQuestion: null,
		designType: null,
		handleScreenshotClick: noop,
		translate: identity
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
			/>
		);
	}
}

export default localize( SignupThemesList );
