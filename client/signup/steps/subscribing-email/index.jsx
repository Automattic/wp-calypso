import { useEffect } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import useCreateNewAccountMutation from 'calypso/signup/hooks/use-create-new-account';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import SubscribingEmailStepContent from './content';

function SubscribingEmailStep( props ) {
	const { flowName, goToNextStep, queryParams, stepName } = props;
	const {
		mutate: createNewAccount,
		isError,
		isSuccess,
		isPending,
		error,
	} = useCreateNewAccountMutation();

	useEffect( () => {
		if ( emailValidator.validate( queryParams.email ) ) {
			createNewAccount( {
				userData: { email: typeof queryParams.email === 'string' ? queryParams.email.trim() : '' },
				flowName,
				isPasswordless: true,
			} );
		}
	}, [] );

	if ( isSuccess ) {
		props.recordTracksEvent( 'calypso_signup_new_email_subscription_success', {
			mailing_list: queryParams.mailing_list,
		} );
		props.submitSignupStep(
			{ stepName: 'subscribing-email' },
			{ redirect: addQueryArgs( queryParams.redirect_to, { subscribed: true } ) }
		);
		goToNextStep();
	} else if ( isError ) {
		if ( [ 'already_taken', 'already_active', 'email_exists' ].includes( error.error ) ) {
			// TODO: Subscribe existing user to guides emails through API endpoint https://github.com/Automattic/martech/issues/3090

			props.recordTracksEvent( 'calypso_signup_existing_email_subscription_success', {
				mailing_list: queryParams.mailing_list,
			} );
			props.submitSignupStep(
				{ stepName: 'subscribing-email' },
				{ redirect: addQueryArgs( queryParams.redirect_to, { subscribed: true } ) }
			);
			goToNextStep();
		}
	}

	return (
		<div className="subscribing-email">
			<StepWrapper
				flowName={ flowName }
				hideFormattedHeader
				stepContent={ <SubscribingEmailStepContent { ...props } isPending={ isPending } /> }
				stepName={ stepName }
			/>
		</div>
	);
}

export default connect( null, { recordTracksEvent, submitSignupStep } )(
	localize( SubscribingEmailStep )
);
