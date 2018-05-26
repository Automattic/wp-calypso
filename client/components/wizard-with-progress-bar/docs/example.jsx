/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import WizardWithProgressBar from '../index';

export default class WizardWithProgressBarExample extends Component {
	static displayName = 'WizardWithProgressBar';

	static defaultProps = {
		numberOfSteps: 5,
	};

	state = {
		currentStep: 1,
	};

	getNextStep( currentStep, numberOfSteps ) {
		if ( currentStep >= numberOfSteps ) {
			return numberOfSteps;
		}

		return currentStep + 1;
	}

	getPreviousStep( currentStep ) {
		if ( currentStep <= 1 ) {
			return 1;
		}

		return currentStep - 1;
	}

	handleNextButtonClick = () => {
		this.setState( {
			currentStep: this.getNextStep( this.state.currentStep, this.props.numberOfSteps ),
		} );
	};

	handlePreviousButtonClick = () => {
		this.setState( {
			currentStep: this.getPreviousStep( this.state.currentStep ),
		} );
	};

	render() {
		return (
			<div>
				<WizardWithProgressBar
					currentStep={ this.state.currentStep }
					nextButtonClick={ this.handleNextButtonClick }
					numberOfSteps={ this.props.numberOfSteps }
					previousButtonClick={ this.handlePreviousButtonClick }
				/>
			</div>
		);
	}
}

