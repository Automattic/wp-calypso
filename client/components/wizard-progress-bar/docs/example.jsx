/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import WizardProgressBar from '../index';

export default class WizardProgressBarExample extends Component {
	static displayName = 'WizardProgressBar';

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
			currentStep: Math.max( 1, this.state.currentStep - 1 ),
		} );
	};

	render() {
		return (
			<div>
				<WizardProgressBar
					currentStep={ this.state.currentStep }
					nextButtonClick={ this.handleNextButtonClick }
					numberOfSteps={ this.props.numberOfSteps }
					previousButtonClick={ this.handlePreviousButtonClick }
				/>
			</div>
		);
	}
}
