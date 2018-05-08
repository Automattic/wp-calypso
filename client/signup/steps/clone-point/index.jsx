/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import Button from 'components/button';
import SignupActions from 'lib/signup/actions';

class ClonePointStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.object,
	};

	goToNextStep = () => {
		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {} );

		//this.props.goToNextStep();
	};

	renderStepContent = () => {
		const { translate } = this.props;

		return (
			<div className="clone-point__wrap">
				<div className="clone-point__column">
					<Card className="clone-point__image-card">
						<img
							alt="upgrade"
							className="clone-point__image"
							src="/calypso/images/upgrades/thank-you.svg"
						/>
					</Card>
					<Card className="clone-point__text-card">
						<Button className="clone-point__button">{ translate( 'Clone current state' ) }</Button>
						<p className="clone-point__description">
							{ translate( 'Create a clone of your site as it is right now.' ) }
						</p>
					</Card>
				</div>
				<div className="clone-point__column">
					<Card className="clone-point__image-card">
						<img
							alt="upgrade"
							className="clone-point__image"
							src="/calypso/images/upgrades/thank-you.svg"
						/>
					</Card>
					<Card className="clone-point__text-card">
						<Button className="clone-point__button">{ translate( 'Clone previous state' ) }</Button>
						<p className="clone-point__description">
							{ translate(
								'Browse your event history and choose an earlier state to clone from.'
							) }
						</p>
					</Card>
				</div>
			</div>
		);
	};

	render() {
		const {
			flowName,
			stepName,
			positionInFlow,
			signupProgress,
			originSiteName,
			translate,
		} = this.props;

		const headerText = translate( "Let's clone %(origin)s", { args: { origin: originSiteName } } );

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ '' }
				fallbackSubHeaderText={ '' }
				positionInFlow={ positionInFlow }
				signupProgress={ signupProgress }
				stepContent={ this.renderStepContent() }
			/>
		);
	}
}

export default localize( ClonePointStep );
