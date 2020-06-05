/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';

/**
 * Style dependencies
 */
import './style.scss';

export default class P2StepWrapper extends Component {
	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				subHeaderText={ this.props.fallbackHeaderText }
				fallbackHeaderText={ this.props.fallbackHeaderText }
				stepContent={ this.props.children }
			/>
		);
	}
}
