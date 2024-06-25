import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { useEffect, useState } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
// import { isExternal } from 'calypso/lib/url';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import SubscribingEmailStepContent from './content';

const createNewAccount = async ( {
	queryParams,
	flowName,
	goToNextStep,
	// recordTracksEvent,
	setIsLoading,
	submitSignupStep,
} ) => {
	const { email, mailing_list, redirect_to } = queryParams;

	try {
		// eslint-disable-next-line no-undef
		await wpcom.req.post( '/users/new', {
			email: typeof email === 'string' ? email.trim() : '',
			is_passwordless: true,
			signup_flow_name: flowName,
			validate: false,
			locale: getLocaleSlug(),
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
			anon_id: getTracksAnonymousUserId(),
		} );

		// recordTracksEvent( 'calypso_signup_new_email_subscription_success', {
		// 	mailing_list,
		// } );

		submitSignupStep(
			{ stepName: 'subscribing-email' },
			{ redirectUrl: addQueryArgs( redirect_to, { subscribed: true } ) }
		);
		goToNextStep();
		return;
	} catch ( error ) {
		if ( [ 'already_taken', 'already_active', 'email_exists' ].includes( error.error ) ) {
			// TODO: Subscribe existing user to guides emails through API endpoint https://github.com/Automattic/martech/issues/3090

			recordTracksEvent( 'calypso_signup_existing_email_subscription_success', {
				mailing_list,
			} );

			submitSignupStep(
				{ stepName: 'subscribing-email' },
				{ redirectUrl: addQueryArgs( redirect_to, { subscribed: true } ) }
			);
			goToNextStep();
		}

		setIsLoading( false );
	}
};

function SubscribingEmailStep( props ) {
	const { flowName, queryParams, stepName } = props;

	const [ isLoading, setIsLoading ] = useState( true );
	const [ submitting, setSubmitting ] = useState( false );

	useEffect( () => {
		if ( emailValidator.validate( queryParams.email ) ) {
			createNewAccount( { ...props, setIsLoading } );
		} else {
			setIsLoading( false );
		}
	}, [] );

	return (
		<div className="subscribing-email">
			<StepWrapper
				flowName={ flowName }
				hideFormattedHeader
				stepContent={
					<SubscribingEmailStepContent
						{ ...props }
						handleSubmitSignup={ () => {
							// setSubmitting( true );
							// createNewAccount( { ...props, email: form.email }, setIsLoading, setSubmitting );
						} }
						isLoading={ isLoading }
						submitting={ submitting }
					/>
				}
				stepName={ stepName }
			/>
		</div>
	);
}

export default connect( null, { recordTracksEvent, submitSignupStep } )(
	localize( SubscribingEmailStep )
);
