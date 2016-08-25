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
import verticals from '../survey/verticals';
import { abtest } from 'lib/abtest';

module.exports = React.createClass( {
	displayName: 'SignupThemesList',

	propTypes: {
		surveyQuestion: React.PropTypes.string,
		designType: React.PropTypes.string,
		handleScreenshotClick: React.PropTypes.func,
		showThemeUpload: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			surveyQuestion: null,
			designType: null,
			handleScreenshotClick: noop,
			showThemeUpload: 'showThemeUpload' === abtest( 'signupThemeUpload' )
		};
	},

	getInitialState() {
		return {
			verticalList: verticals.get()
		};
	},

	shouldComponentUpdate( nextProps ) {
		return ( nextProps.surveyQuestion !== this.props.surveyQuestion || nextProps.designType !== this.props.designType );
	},

	getComputedThemes() {
		return getThemes( this.props.surveyQuestion, this.props.designType );
	},

	getVerticalIdsForCategory( topLevelCategory ) {
		return this.state.verticalList.reduce( ( match, category_id ) => {
			if ( category_id.value === topLevelCategory ) {
				return category_id.stepTwo.map( c => c.value );
			}
			return match;
		}, [] );
	},

	getScreenshotUrl( theme ) {
		const artsCategories = this.getVerticalIdsForCategory( 'a8c.1' );
		if ( -1 !== artsCategories.indexOf( this.props.surveyQuestion ) && 'showVerticalScreenshots' === abtest( 'verticalScreenshots' ) ) {
			return `https://headstartdata.files.wordpress.com/2016/09/${ theme.slug }.png?w=660`;
		}

		return `https://i1.wp.com/s0.wp.com/wp-content/themes/${ theme.repo }/${ theme.slug }/screenshot.png?w=660`;
	},

	render() {
		const actionLabel = this.translate( 'Pick' );
		const getActionLabel = () => actionLabel;
		const themes = this.getComputedThemes().map( theme => {
			return Object.assign( theme, {
				id: theme.slug,
				screenshot: this.getScreenshotUrl( theme )
			} );
		} );
		return (
			<ThemesList
				getButtonOptions= { noop }
				onScreenshotClick= { this.props.handleScreenshotClick }
				onMoreButtonClick= { noop }
				getActionLabel={ getActionLabel }
				themes= { themes }
				showThemeUpload= { this.props.showThemeUpload }
			/>
		);
	}
} );

