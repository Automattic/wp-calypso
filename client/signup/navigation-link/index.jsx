/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize, getLocaleSlug } from 'i18n-calypso';
import { get, findLast, findIndex } from 'lodash';
import Gridicon from 'components/gridicon';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getStepUrl } from 'signup/utils';
import { recordTracksEvent } from 'state/analytics/actions';
import { submitSignupStep } from 'state/signup/progress/actions';
import { getSignupProgress } from 'state/signup/progress/selectors';
import { getFilteredSteps } from '../utils';

/**
 * Style dependencies
 */
import './style.scss';

export class NavigationLink extends Component {
	static propTypes = {
		goToNextStep: PropTypes.func,
		direction: PropTypes.oneOf( [ 'back', 'forward' ] ),
		flowName: PropTypes.string.isRequired,
		labelText: PropTypes.string,
		cssClass: PropTypes.string,
		positionInFlow: PropTypes.number,
		previousPath: PropTypes.string,
		signupProgress: PropTypes.object,
		stepName: PropTypes.string.isRequired,
		// Allows to force a back button in the first step for example.
		allowBackFirstStep: PropTypes.bool,
	};

	static defaultProps = {
		labelText: '',
		allowBackFirstStep: false,
	};

	/**
	 * Returns the previous step , skipping over steps with the
	 * `wasSkipped` property.
	 *
	 * @returns {object} The previous step object
	 */
	getPreviousStep() {
		const { flowName, signupProgress, stepName } = this.props;

		let steps = getFilteredSteps( flowName, signupProgress );
		steps = steps.slice(
			0,
			findIndex( steps, ( step ) => step.stepName === stepName )
		);
		const previousStep = findLast( steps, ( step ) => ! step.wasSkipped );

		return previousStep || { stepName: null };
	}

	getBackUrl() {
		if ( this.props.direction !== 'back' ) {
			return;
		}

		if ( this.props.backUrl ) {
			return this.props.backUrl;
		}

		const previousStep = this.getPreviousStep();

		const stepSectionName = get(
			this.props.signupProgress,
			[ previousStep.stepName, 'stepSectionName' ],
			''
		);

		return getStepUrl(
			previousStep.lastKnownFlow || this.props.flowName,
			previousStep.stepName,
			stepSectionName,
			getLocaleSlug()
		);
	}

	handleClick = () => {
		if ( this.props.direction === 'forward' ) {
			this.props.submitSignupStep(
				{ stepName: this.props.stepName },
				this.props.defaultDependencies
			);

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
			this.props.recordTracksEvent( 'calypso_signup_previous_step_button_click', tracksProps );
		}

		if ( this.props.direction === 'forward' ) {
			this.props.recordTracksEvent( 'calypso_signup_skip_step', tracksProps );
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

		const buttonClasses = classnames(
			'navigation-link',
			this.props.direction,
			this.props.cssClass
		);

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

export default connect(
	( state ) => ( {
		signupProgress: getSignupProgress( state ),
	} ),
	{ recordTracksEvent, submitSignupStep }
)( localize( NavigationLink ) );
