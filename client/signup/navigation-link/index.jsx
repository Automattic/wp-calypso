/**
 * External dependencies
 */
import React from 'react';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import i18n from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Button from 'components/button';
import { submitSignupStep } from 'lib/signup/actions';
import signupUtils from 'signup/utils';
import { get } from 'lodash';

const NavigationLink = React.createClass( {
	propTypes: {
		goToNextStep: React.PropTypes.func,
		direction: React.PropTypes.string.isRequired,
		flowName: React.PropTypes.string.isRequired,
		positionInFlow: React.PropTypes.number,
		previousPath: React.PropTypes.string,
		signupProgress: React.PropTypes.array,
		stepName: React.PropTypes.string.isRequired
	},

	/**
	 * Returns the previous step name, skipping over steps with the
	 * `wasSkipped` property.
	 *
	 * @return {string|null} The previous step name
	 */
	getPreviousStepName() {
		const { stepName, signupProgress } = this.props;

		const currentStepIndex = findIndex( signupProgress, { stepName } );

		const previousStep = find( signupProgress.slice( 0, currentStepIndex ).reverse(), step => ! step.wasSkipped );

		return previousStep ? previousStep.stepName : null;
	},

	getBackUrl() {
		if ( this.props.direction !== 'back' ) {
			return;
		}

		if ( this.props.backUrl ) {
			return this.props.backUrl;
		}

		const previousStepName = this.getPreviousStepName();

		const stepSectionName = get( find( this.props.signupProgress, { stepName: previousStepName } ), 'stepSectionName', '' );

		return signupUtils.getStepUrl( this.props.flowName, previousStepName, stepSectionName, i18n.getLocaleSlug() );
	},

	handleClick() {
		if ( this.props.direction === 'forward' ) {
			submitSignupStep( { stepName: this.props.stepName }, [], this.props.defaultDependencies );

			this.props.goToNextStep();
		}

		this.recordClick();
	},

	recordClick() {
		const tracksProps = {
			flow: this.props.flowName,
			step: this.props.stepName
		};

		if ( this.props.direction === 'back' ) {
			analytics.tracks.recordEvent( 'calypso_signup_previous_step_button_click', tracksProps );
		}

		if ( this.props.direction === 'forward' ) {
			analytics.tracks.recordEvent( 'calypso_signup_skip_step', tracksProps );
		}
	},

	render() {
		if ( this.props.positionInFlow === 0 && this.props.direction === 'back' && ! this.props.stepSectionName ) {
			return null;
		}

		let backGridicon, forwardGridicon, text;

		if ( this.props.direction === 'back' ) {
			backGridicon = <Gridicon icon="arrow-left" size={ 18 } />;
			text = this.translate( 'Back' );
		}

		if ( this.props.direction === 'forward' ) {
			forwardGridicon = <Gridicon icon="arrow-right" size={ 18 } />;
			text = this.translate( 'Skip for now' );
		}

		return (
			<Button compact borderless className="navigation-link" href={ this.getBackUrl() } onClick={ this.handleClick }>
				{ backGridicon }
				{ text }
				{ forwardGridicon }
			</Button>
		);
	}
} );

export default NavigationLink;
