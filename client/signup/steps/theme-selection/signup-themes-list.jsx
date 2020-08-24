/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { identity, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import getThemes from 'lib/signup/themes';
import ThemesList from 'components/themes-list';

/**
 * Style dependencies
 */
import './style.scss';

class SignupThemesList extends Component {
	static propTypes = {
		surveyQuestion: PropTypes.string,
		designType: PropTypes.string,
		quantity: PropTypes.number,
		handleScreenshotClick: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		surveyQuestion: null,
		designType: null,
		quantity: 3,
		handleScreenshotClick: noop,
		translate: identity,
	};

	shouldComponentUpdate( nextProps ) {
		return (
			nextProps.surveyQuestion !== this.props.surveyQuestion ||
			nextProps.designType !== this.props.designType
		);
	}

	getComputedThemes() {
		return getThemes( this.props.surveyQuestion, this.props.designType, this.props.quantity );
	}

	getScreenshotUrl( theme ) {
		return `https://i1.wp.com/s0.wp.com/wp-content/themes/${ theme.repo }/${ theme.slug }/screenshot.png?w=660`;
	}

	render() {
		const actionLabel = this.props.translate( 'Pick' );
		const getActionLabel = () => actionLabel;

		const themes = this.getComputedThemes().map( ( theme ) => {
			return {
				...theme,
				id: theme.slug,
				screenshot: this.getScreenshotUrl( theme ),
			};
		} );

		return (
			<div className="signup-themes-list">
				<ThemesList
					getButtonOptions={ noop }
					onScreenshotClick={ this.props.handleScreenshotClick }
					onMoreButtonClick={ noop }
					getActionLabel={ getActionLabel }
					themes={ themes }
				/>
			</div>
		);
	}
}

export default localize( SignupThemesList );
