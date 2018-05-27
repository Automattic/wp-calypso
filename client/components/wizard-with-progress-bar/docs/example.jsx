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

	handleNextButtonClick = () => {
		this.setState( {
			currentStep: Math.min( this.props.numberOfSteps, this.state.currentStep + 1 ),
		} );
	};

	handlePreviousButtonClick = () => {
		this.setState( {
			currentStep: Math.max( 0, this.state.currentStep - 1 ),
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
