/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import getThemes from 'lib/signup/themes';
import ThemesList from 'components/themes-list';
import config from 'config';

const themeDemosEnabled = config.isEnabled( 'signup/theme-demos' );

module.exports = React.createClass( {
	displayName: 'SignupThemesList',

	propTypes: {
		surveyQuestion: React.PropTypes.string,
		designType: React.PropTypes.string,
		handleScreenshotClick: React.PropTypes.func,
	},

	getDefaultProps() {
		return {
			surveyQuestion: null,
			designType: null,
			handleScreenshotClick: noop,
		};
	},

	shouldComponentUpdate( nextProps ) {
		return ( nextProps.surveyQuestion !== this.props.surveyQuestion || nextProps.designType !== this.props.designType );
	},

	getComputedThemes() {
		return getThemes( this.props.surveyQuestion, this.props.designType );
	},

	getScreenshotUrl( slug ) {
		return 'https://i1.wp.com/s0.wp.com/wp-content/themes/pub/' + slug + '/screenshot.png?w=660';
	},

	render() {
		const actionLabel = themeDemosEnabled ? this.translate( 'Preview' ) : this.translate( 'Pick' );
		const getActionLabel = () => actionLabel;
		const themes = this.getComputedThemes().map( theme => {
			return {
				id: theme.slug,
				name: theme.name,
				demo_uri: theme.demo_uri,
				screenshot: this.getScreenshotUrl( theme.slug ),
			};
		} );
		return (
			<ThemesList
				getButtonOptions= { noop }
				onScreenshotClick= { this.props.handleScreenshotClick }
				onMoreButtonClick= { noop }
				getActionLabel={ getActionLabel }
				themes= { themes } />
		);
	}
} );

