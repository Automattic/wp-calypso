/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import Button from 'components/button';
import SignupActions from 'lib/signup/actions';
import HappychatButton from 'components/happychat/button';
import { recordTracksEvent } from 'state/analytics/actions';

class RewindConfirmStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	addCredentials = () => {
		SignupActions.submitSignupStep( {
			processingMessage: this.props.translate( 'Setting up your site' ),
			stepName: this.props.stepName,
		} );

		this.props.goToStep( 'rewind-form' );
	};

	skipStep = () => {
		SignupActions.submitSignupStep( {
			processingMessage: this.props.translate( 'Setting up your site' ),
			stepName: this.props.stepName,
		} );

		this.props.goToStep( 'rewind-declined' );
	};

	contactSupport = () => alert( 'Not yet implemented' );

	renderStepContent = () => {
		const { happychatEvent, translate } = this.props;

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
				<HappychatButton
					className="rewind-confirm__happychat-button"
					borderless={ false }
					onClick={ happychatEvent }
				>
					{ translate( 'Contact support' ) }
				</HappychatButton>
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

const mapDispatchToProps = () => ( {
	happychatEvent: () => recordTracksEvent( 'calypso_signup_rewindcreds_confirm_get_help' ),
} );

export default connect( null, mapDispatchToProps )( localize( RewindConfirmStep ) );
