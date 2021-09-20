import DesignPicker from '@automattic/design-picker';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getRecommendedThemes } from 'calypso/state/themes/actions';
import {
	getRecommendedThemes as getRecommendedThemesSelector,
	areRecommendedThemesLoading,
} from 'calypso/state/themes/selectors';
import './style.scss';

class DesignPickerStep extends Component {
	static propTypes = {
		goToNextStep: PropTypes.func.isRequired,
		signupDependencies: PropTypes.object.isRequired,
		stepName: PropTypes.string.isRequired,
		locale: PropTypes.string.isRequired,
		translate: PropTypes.func,
		largeThumbnails: PropTypes.bool,
		showOnlyThemes: PropTypes.bool,
	};

	static defaultProps = {
		useHeadstart: true,
		largeThumbnails: false,
		showOnlyThemes: false,
	};

	componentDidMount() {
		this.fetchThemes();
	}

	fetchThemes() {
		this.props.getRecommendedThemes( 'auto-loading-homepage' );
	}

	pickDesign = ( selectedDesign ) => {
		recordTracksEvent( 'calypso_signup_select_design', {
			theme: `pub/${ selectedDesign?.theme }`,
			template: selectedDesign?.template,
		} );

		this.props.submitSignupStep(
			{
				stepName: this.props.stepName,
			},
			{
				selectedDesign,
			}
		);

		this.props.goToNextStep();
	};

	renderDesignPicker() {
		// Use <DesignPicker>'s preferred designs by default
		let designs = undefined;

		if ( this.props.showOnlyThemes ) {
			// Should probably be pulled out into a utility to format theme response as design picker design
			// taxonomies.theme_subject probably maps to category
			designs = this.props.customizedThemesList.map( ( { id, name, screenshot } ) => {
				return {
					categories: [],
					features: [],
					image: screenshot,
					is_premium: false,
					slug: id,
					template: id,
					theme: id,
					title: name,
				};
			} );
		}

		return (
			<div>
				<DesignPicker
					designs={ designs }
					theme={ this.props.isReskinned ? 'light' : 'dark' }
					locale={ this.props.locale } // props.locale obtained via `localize` HoC
					onSelect={ this.pickDesign }
					className={ classnames( {
						'design-picker-step__is-large-thumbnails': this.props.largeThumbnails,
					} ) }
				/>
			</div>
		);
	}

	headerText() {
		const { translate } = this.props;

		return translate( 'Choose a design' );
	}
	subHeaderText() {
		const { translate } = this.props;

		return translate( 'Pick your favorite homepage layout. You can customize or change it later.' );
	}

	render() {
		const { isReskinned } = this.props;
		const headerText = this.headerText();
		const subHeaderText = this.subHeaderText();

		return (
			<StepWrapper
				fallbackHeaderText={ headerText }
				headerText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				subHeaderText={ subHeaderText }
				stepContent={ this.renderDesignPicker() }
				align={ isReskinned ? 'left' : 'center' }
				skipButtonAlign={ isReskinned ? 'top' : 'bottom' }
				{ ...this.props }
			/>
		);
	}
}

export default connect(
	( state ) => {
		return {
			customizedThemesList: getRecommendedThemesSelector( state, 'auto-loading-homepage' ),
			isLoading: areRecommendedThemesLoading( state, 'auto-loading-homepage' ),
		};
	},
	{ getRecommendedThemes, submitSignupStep }
)( localize( DesignPickerStep ) );
