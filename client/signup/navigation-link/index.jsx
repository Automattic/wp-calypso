/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize, getLocaleSlug } from 'i18n-calypso';
import { find, findIndex, get } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import analytics from 'lib/analytics';
import { submitSignupStep } from 'lib/signup/actions';
import signupUtils from 'signup/utils';

export class NavigationLink extends Component {
	static propTypes = {
		goToNextStep: PropTypes.func,
		direction: PropTypes.oneOf( [ 'back', 'forward' ] ),
		flowName: PropTypes.string.isRequired,
		positionInFlow: PropTypes.number,
		previousPath: PropTypes.string,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string.isRequired,
	};

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
	}

	getBackUrl() {
		if ( this.props.direction !== 'back' ) {
			return;
		}

		if ( this.props.backUrl ) {
			return this.props.backUrl;
		}

		const previousStepName = this.getPreviousStepName();

		const stepSectionName = get( find( this.props.signupProgress, { stepName: previousStepName } ), 'stepSectionName', '' );

		return signupUtils.getStepUrl( this.props.flowName, previousStepName, stepSectionName, getLocaleSlug() );
	}

	handleClick = () => {
		if ( this.props.direction === 'forward' ) {
			submitSignupStep( { stepName: this.props.stepName }, [], this.props.defaultDependencies );

			this.props.goToNextStep();
		}

		this.recordClick();
	}

	recordClick() {
		const tracksProps = {
			flow: this.props.flowName,
			step: this.props.stepName,
		};

		if ( this.props.direction === 'back' ) {
			analytics.tracks.recordEvent( 'calypso_signup_previous_step_button_click', tracksProps );
		}

		if ( this.props.direction === 'forward' ) {
			analytics.tracks.recordEvent( 'calypso_signup_skip_step', tracksProps );
		}
	}

	render() {
		if ( this.props.positionInFlow === 0 && this.props.direction === 'back' && ! this.props.stepSectionName ) {
			return null;
		}

		let backGridicon, forwardGridicon, text;

		if ( this.props.direction === 'back' ) {
			backGridicon = <Gridicon icon="arrow-left" size={ 18 } />;
			text = this.props.translate( 'Back' );
		}

		if ( this.props.direction === 'forward' ) {
			forwardGridicon = <Gridicon icon="arrow-right" size={ 18 } />;
			text = this.props.translate( 'Skip for now' );
		}

		return (
			<Button compact borderless className="navigation-link" href={ this.getBackUrl() } onClick={ this.handleClick }>
				{ backGridicon }
				{ text }
				{ forwardGridicon }
			</Button>
		);
	}
}

export default localize( NavigationLink );
