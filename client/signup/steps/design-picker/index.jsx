/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import DesignPicker, { getAvailableDesigns } from '@automattic/design-picker';
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

class DesignPickerStep extends Component {
	static propTypes = {
		goToNextStep: PropTypes.func.isRequired,
		signupDependencies: PropTypes.object.isRequired,
		stepName: PropTypes.string.isRequired,
		locale: PropTypes.string.isRequired,
		translate: PropTypes.func,
	};

	static defaultProps = {
		useHeadstart: true,
	};

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
		const designs = getAvailableDesigns( {
			includeAlphaDesigns: false,
			useFseDesigns: config.isEnabled( 'signup/core-site-editor' ),
			randomize: false,
		} ).featured.filter(
			// By default, exclude anchorfm-specific designs
			( design ) => design.features.findIndex( ( f ) => f === 'anchorfm' ) < 0
		);

		// props.locale obtained via `localize` HoC
		return (
			<DesignPicker
				theme="dark"
				locale={ this.props.locale }
				onSelect={ this.pickDesign }
				designs={ designs }
			/>
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
		const headerText = this.headerText();
		const subHeaderText = this.subHeaderText();

		return (
			<StepWrapper
				fallbackHeaderText={ headerText }
				headerText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				subHeaderText={ subHeaderText }
				stepContent={ this.renderDesignPicker() }
				{ ...this.props }
			/>
		);
	}
}

export default connect( null, { submitSignupStep } )( localize( DesignPickerStep ) );
