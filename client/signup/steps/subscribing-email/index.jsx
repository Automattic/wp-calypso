import { useEffect } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { isExistingAccountError } from 'calypso/lib/signup/is-existing-account-error';
import useCreateNewAccountMutation from 'calypso/signup/hooks/use-create-new-account';
import useSubscribeToMailingList from 'calypso/signup/hooks/use-subscribe-to-mailing-list';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import SubscribingEmailStepContent from './content';

function isHttpsOrHttp( url ) {
	return ( !! url && url.startsWith( 'https://' ) ) || url.startsWith( 'http://' );
}

/**
 * When someone subscribes to an email campaign on a landing page like wordpress.com/learn, we'd like to
 * manage outbound communication with the Guides platform. Guides, however, requires a user_id and a WordPress
 * account. This flow streamlines the process by combining account creation and email subscription handling
 * into a single step.
 */
function SubscribingEmailStep( props ) {
	const { flowName, goToNextStep, queryParams, stepName } = props;
	const redirectUrl = isHttpsOrHttp( queryParams.redirect_to )
		? addQueryArgs( queryParams.redirect_to, { subscribed: true } )
		: addQueryArgs( 'https://' + queryParams.redirect_to, { subscribed: true } );

	const { mutate: subscribeToMailingList, isPending: isSubscribeToMailingListPending } =
		useSubscribeToMailingList( {
			onSuccess: () => {
				props.recordTracksEvent( 'calypso_signup_existing_email_subscription_success', {
					mailing_list: queryParams.mailing_list,
				} );
				props.submitSignupStep( { stepName: 'subscribing' }, { redirect: redirectUrl } );
				goToNextStep();
			},
		} );

	const { mutate: createNewAccount, isPending: isCreateNewAccountPending } =
		useCreateNewAccountMutation( {
			onSuccess: () =>
				subscribeToMailingList( {
					email_address: queryParams.user_email,
					mailing_list_category: queryParams.mailing_list,
				} ),
			onError: ( error ) => {
				if ( isExistingAccountError( error.error ) ) {
					subscribeToMailingList( {
						email_address: queryParams.user_email,
						mailing_list_category: queryParams.mailing_list,
					} );
				}
			},
		} );

	useEffect( () => {
		const email = typeof queryParams.user_email === 'string' ? queryParams.user_email.trim() : '';

		if ( emailValidator.validate( email ) ) {
			createNewAccount( {
				userData: {
					email,
				},
				flowName,
				isPasswordless: true,
			} );
		}
	}, [ createNewAccount, flowName, queryParams.user_email ] );

	return (
		<div className="subscribing-email">
			<StepWrapper
				flowName={ flowName }
				hideFormattedHeader
				stepContent={
					<SubscribingEmailStepContent
						{ ...props }
						isPending={ isCreateNewAccountPending || isSubscribeToMailingListPending }
						redirectUrl={ redirectUrl }
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
