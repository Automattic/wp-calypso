import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import SubscribingEmailStepContent from './content';
import './style.scss';

class SubscribingEmailStep extends Component {
	handleButtonClick = async () => {
		const { flowName, goToNextStep, queryParams } = this.props;
		const email = queryParams.email;

		if ( emailValidator.validate( email ) ) {
			try {
				const response = await wpcom.req.post( '/users/new', {
					email: typeof email === 'string' ? email.trim() : '',
					is_passwordless: true,
					signup_flow_name: flowName,
					validate: false,
					locale: getLocaleSlug(),
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
					anon_id: getTracksAnonymousUserId(),
				} );

				// Do stuff with response and redirect
				goToNextStep();
			} catch ( error ) {
				if ( ! [ 'already_taken', 'already_active', 'email_exists' ].includes( error.error ) ) {
					// Handle invalid account creation error
				}
			}
		}

		// this.props.recordTracksEvent( 'calypso_signup_reader_landing_cta' );
		// this.props.submitSignupStep( { stepName: this.props.stepName } );
		this.props.goToNextStep();
	};

	render() {
		const { flowName, positionInFlow, stepName } = this.props;
		// const { flowName, positionInFlow, stepName, translate } = this.props;

		return (
			<div className="subscribing-email">
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					stepContent={ <SubscribingEmailStepContent onButtonClick={ this.handleButtonClick } /> }
				/>
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent, submitSignupStep } )(
	localize( SubscribingEmailStep )
);
