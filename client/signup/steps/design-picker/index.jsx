/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import DesignGrid from 'calypso/landing/gutenboarding/onboarding-block/design-selector/design-grid';

/**
 * Style dependencies
 */
import './style.scss';

class DesignPickerStep extends Component {
	static propTypes = {
		goToNextStep: PropTypes.func.isRequired,
		signupDependencies: PropTypes.object.isRequired,
		stepName: PropTypes.string.isRequired,
		translate: PropTypes.func,
	};

	static defaultProps = {
		useHeadstart: true,
		translate: identity,
	};

	pickDesign = ( selectedDesign ) => {
		recordTracksEvent( 'calypso_signup_select_design', {
			theme: `pub/${ selectedDesign?.theme }`,
			template: selectedDesign?.template,
		} );

		this.props.submitSignupStep(
			{
				stepName: this.props.stepName,
				selectedDesign,
			},
			{
				selectedDesign,
			}
		);

		this.props.goToNextStep();
	};

	renderDesignPicker() {
		return <DesignGrid locale="en" onSelect={ this.pickDesign } />;
	}

	headerText() {
		const { translate } = this.props;

		return translate( 'Choose a design' );
	}
	subHeaderText() {
		const { translate } = this.props;

		return translate( 'Pick your favorite homepage layout. You can customize or change it later.', {
			context: 'Design picker step subheader in Signup',
		} );
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
