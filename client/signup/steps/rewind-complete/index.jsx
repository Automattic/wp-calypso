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

class RewindCompleteStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	renderStepContent = () => {
		const { translate, wpAdminUrl } = this.props;

		return (
			<Card className="rewind-complete__card">
				<h3 className="rewind-complete__title">{ translate( 'Your site is backing up!' ) }</h3>
				<img className="rewind-complete__image" src="/calypso/images/upgrades/thank-you.svg" />
				<p className="rewind-complete__description">
					{ translate(
						"Your site is backing up now as part of your Jetpack Premium Plan. It's doing " +
							'backflips with excitement!'
					) }
				</p>
				<a className="rewind-complete__button" href={ wpAdminUrl }>
					{ translate( 'Return to site' ) }
				</a>
			</Card>
		);
	};

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderStepContent() }
				goToNextStep={ this.skipStep }
				hideFormattedHeader={ true }
				hideBack={ true }
				hideSkip={ true }
			/>
		);
	}
}

export default localize( RewindCompleteStep );
