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
import SignupActions from 'lib/signup/actions';
import Card from 'components/card';
import Button from 'components/button';

class RewindAddCreds extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	goToCredsForm = () => {
		SignupActions.submitSignupStep( {
			processingMessage: this.props.translate( 'Preparing credentials form' ),
			stepName: this.props.stepName,
		} );

		this.props.goToNextStep();
	};

	stepContent = () => {
		const { translate } = this.props;

		return (
			<Card className="rewind-add-creds__card rewind-switch__card rewind-switch__content">
				<h3 className="rewind-add-creds__title rewind-switch__heading">
					{ translate( 'Add your credentials' ) }
				</h3>
				<img src="/calypso/images/illustrations/security.svg" alt="" />
				<p className="rewind-add-creds__description rewind-switch__description">
					{ translate(
						'To switch you over to Jetpack backups and security we need you to add your site credentials. ' +
							'This gives WordPress.com access to your site to perform automatic actions on your server—like backups. ' +
							'It also allows us to restore your site and manually access it in case of an emergency.'
					) }
				</p>
				<Button primary onClick={ this.goToCredsForm }>
					{ translate( 'Add your credentials' ) }
				</Button>
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
				stepContent={ this.stepContent() }
				hideFormattedHeader={ true }
				hideSkip={ true }
				hideBack={ true }
			/>
		);
	}
}

export default localize( RewindAddCreds );
