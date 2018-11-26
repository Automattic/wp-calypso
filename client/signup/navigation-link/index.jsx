/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize, getLocaleSlug } from 'i18n-calypso';
import { find, findIndex, get } from 'lodash';
import Gridicon from 'gridicons';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Button from 'components/button';
import SignupActions from 'lib/signup/actions';
import { getStepUrl } from 'signup/utils';

/**
 * Style dependencies
 */
import './style.scss';

const { submitSignupStep } = SignupActions;

export class NavigationLink extends Component {
	static propTypes = {
		goToNextStep: PropTypes.func,
		direction: PropTypes.oneOf( [ 'back', 'forward' ] ),
		flowName: PropTypes.string.isRequired,
		labelText: PropTypes.string,
		positionInFlow: PropTypes.number,
		previousPath: PropTypes.string,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string.isRequired,
		// Allows to force a back button in the first step for example.
		allowBackFirstStep: PropTypes.bool,
	};

	static defaultProps = {
		labelText: '',
		allowBackFirstStep: false,
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

		const previousStep = find(
			signupProgress.slice( 0, currentStepIndex ).reverse(),
			step => ! step.wasSkipped
		);

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

		const stepSectionName = get(
			find( this.props.signupProgress, { stepName: previousStepName } ),
			'stepSectionName',
			''
		);

		return getStepUrl( this.props.flowName, previousStepName, stepSectionName, getLocaleSlug() );
	}

	handleClick = () => {
		if ( this.props.direction === 'forward' ) {
			submitSignupStep( { stepName: this.props.stepName }, [], this.props.defaultDependencies );

			this.props.goToNextStep();
		}

		this.recordClick();
	};

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
		const { translate, labelText } = this.props;

		if (
			this.props.positionInFlow === 0 &&
			this.props.direction === 'back' &&
			! this.props.stepSectionName &&
			! this.props.allowBackFirstStep
		) {
			return null;
		}

		let backGridicon, forwardGridicon, text;

		if ( this.props.direction === 'back' ) {
			backGridicon = <Gridicon icon="arrow-left" size={ 18 } />;
			text = labelText ? labelText : translate( 'Back' );
		}

		if ( this.props.direction === 'forward' ) {
			forwardGridicon = <Gridicon icon="arrow-right" size={ 18 } />;
			text = labelText ? labelText : translate( 'Skip for now' );
		}

		const buttonClasses = classnames( 'navigation-link', this.props.direction );

		return (
			<Button
				borderless
				className={ buttonClasses }
				href={ this.getBackUrl() }
				onClick={ this.handleClick }
			>
				{ backGridicon }
				{ text }
				{ forwardGridicon }
			</Button>
		);
	}
}

export default localize( NavigationLink );
