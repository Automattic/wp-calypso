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

class RewindConfirmStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	addCredentials = () => this.props.goToNextStep();

	contactSupport = () => alert( 'Not yet implemented' );

	skipStep = () => this.props.goToStep( 'rewind-complete' );

	renderStepContent = () => {
		const { translate } = this.props;

		return (
			<Card className="rewind-confirm__card">
				<h3 className="rewind-confirm__title">{ translate( 'Are you sure?' ) }</h3>
				<img className="rewind-confirm__image" src="/calypso/images/illustrations/security.svg" />
				<p className="rewind-confirm__description">
					{ translate(
						"If you don't share credentials with Jetpack, your site won't be backed up. Our " +
							'support staff is available to answer any questions you might have.'
					) }
				</p>
				<Button onClick={ this.contactSupport }>{ translate( 'Contact support' ) }</Button>
				<Button primary onClick={ this.addCredentials }>
					{ translate( 'Share credentials' ) }
				</Button>
			</Card>
		);
	};

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ false }
				signupProgress={ false }
				stepContent={ this.renderStepContent() }
				goToNextStep={ this.skipStep }
				hideFormattedHeader={ true }
				skipLabelText="Skip"
				hideBack={ true }
			/>
		);
	}
}

export default localize( RewindConfirmStep );
