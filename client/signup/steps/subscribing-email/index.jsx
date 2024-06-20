import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { useEffect, useState } from '@wordpress/element';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import SubscribingEmailStepContent from './content';

import './style.scss';

const createNewAccount = async ( props ) => {
	const email = props.queryParams.email;
	try {
		// eslint-disable-next-line no-undef
		await wpcom.req.post( '/users/new', {
			email: typeof email === 'string' ? email.trim() : '',
			is_passwordless: true,
			signup_flow_name: props.flowName,
			validate: false,
			locale: getLocaleSlug(),
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
			anon_id: getTracksAnonymousUserId(),
		} );
		// Do stuff with response and redirect
		props.recordTracksEvent( 'calypso_signup_reader_landing_cta' );
		props.submitSignupStep( { stepName: props.stepName } );
		props.goToNextStep();
	} catch ( error ) {
		if ( ! [ 'already_taken', 'already_active', 'email_exists' ].includes( error.error ) ) {
			// Subscribe existing user to guides emails through API endpoint
		}
	}
};

function SubscribingEmailStep( props ) {
	const handleButtonClick = async () => {};

	const { flowName, positionInFlow, queryParams, stepName } = props;
	const [ isAttemptingSubscription, setIsAttemptingSubscription ] = useState( true );

	useEffect( () => {
		const email = queryParams.email;

		if ( emailValidator.validate( email ) ) {
			// console.log( 'Creating account!' );
			createNewAccount( props );
			setIsAttemptingSubscription( false );
		}
	}, [] );

	return (
		<div className="subscribing-email">
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				stepContent={
					<SubscribingEmailStepContent
						{ ...props }
						handleButtonClick={ handleButtonClick }
						isAttemptingSubscription={ isAttemptingSubscription }
					/>
				}
			/>
		</div>
	);
}

export default connect( null, { recordTracksEvent, submitSignupStep } )(
	localize( SubscribingEmailStep )
);
