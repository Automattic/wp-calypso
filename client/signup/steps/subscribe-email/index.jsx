import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import DOMPurify from 'dompurify';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { recordRegistration } from 'calypso/lib/analytics/signup';
import { isExistingAccountError } from 'calypso/lib/signup/is-existing-account-error';
import { isRedirectAllowed } from 'calypso/lib/url/is-redirect-allowed';
import useCreateNewAccountMutation from 'calypso/signup/hooks/use-create-new-account';
import useSubscribeToMailingList from 'calypso/signup/hooks/use-subscribe-to-mailing-list';
import StepWrapper from 'calypso/signup/step-wrapper';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import SubscribeEmailStepContent from './content';

import './style.scss';

function sanitizeEmail( email ) {
	if ( typeof email !== 'string' ) {
		return '';
	}

	return DOMPurify.sanitize( email ).trim();
}

function sanitizeRedirectUrl( redirect ) {
	const isHttpOrHttps =
		!! redirect && ( redirect.startsWith( 'https://' ) || redirect.startsWith( 'http://' ) );
	const redirectUrl = isHttpOrHttps
		? addQueryArgs( redirect, { subscribed: true } )
		: addQueryArgs( 'https://' + redirect, { subscribed: true } );

	return isRedirectAllowed( redirectUrl ) ? redirectUrl : 'https://wordpress.com/';
}

/**
 * When someone subscribes to an email campaign on a landing page like wordpress.com/learn, we'd like to
 * manage outbound communication with the Guides platform. Guides, however, requires a user_id and a WordPress
 * account. This flow streamlines the process by combining account creation and email subscription handling
 * into a single step.
 */
function SubscribeEmailStep( props ) {
	const { currentUser, flowName, goToNextStep, queryArguments, stepName, translate } = props;

	const email = sanitizeEmail( queryArguments.user_email );

	const redirectUrl = sanitizeRedirectUrl( queryArguments.redirect_to );

	const redirectToAfterLoginUrl = currentUser
		? addQueryArgs( window.location.href, { user_email: currentUser?.email } )
		: '';
	const { mutate: subscribeToMailingList, isPending: isSubscribeToMailingListPending } =
		useSubscribeToMailingList( {
			onSuccess: () => {
				recordTracksEvent( 'calypso_signup_email_subscription_success', {
					mailing_list: queryArguments.mailing_list,
				} );
				props.submitSignupStep( { stepName: 'subscribe' }, { redirect: redirectUrl } );
				goToNextStep();
			},
		} );

	const { mutate: createNewAccount, isPending: isCreateNewAccountPending } =
		useCreateNewAccountMutation( {
			onSuccess: ( response ) => {
				const username =
					( response && response.signup_sandbox_username ) || ( response && response.username );

				const userId =
					( response && response.signup_sandbox_user_id ) || ( response && response.user_id );

				recordRegistration( {
					userData: {
						ID: userId,
						username: username,
						email: this.state.email,
					},
					flow: flowName,
					type: 'passwordless',
				} );

				subscribeToMailingList( {
					email_address: email,
					mailing_list_category: queryArguments.mailing_list,
					from: queryArguments.from,
				} );
			},
			onError: ( error ) => {
				if ( isExistingAccountError( error.error ) ) {
					subscribeToMailingList( {
						email_address: email,
						mailing_list_category: queryArguments.mailing_list,
						from: queryArguments.from,
					} );
				}
			},
		} );

	useEffect( () => {
		if ( emailValidator.validate( email ) && ! currentUser ) {
			createNewAccount( {
				userData: {
					email,
				},
				flowName,
				isPasswordless: true,
			} );
		}

		if ( currentUser?.email === email ) {
			subscribeToMailingList( {
				email_address: email,
				mailing_list_category: queryArguments.mailing_list,
				from: queryArguments.from,
			} );
		}
	}, [
		createNewAccount,
		currentUser,
		email,
		flowName,
		queryArguments.from,
		queryArguments.mailing_list,
		subscribeToMailingList,
	] );

	return (
		<div className="subscribe-email">
			<StepWrapper
				flowName={ flowName }
				fallbackHeaderText={
					currentUser ? translate( 'Is this you?' ) : translate( 'Subscribe to our email list' )
				}
				hideFormattedHeader={ isCreateNewAccountPending || isSubscribeToMailingListPending }
				hideBack
				stepContent={
					<SubscribeEmailStepContent
						{ ...props }
						email={ email }
						isPending={ isCreateNewAccountPending || isSubscribeToMailingListPending }
						redirectToAfterLoginUrl={ redirectToAfterLoginUrl }
						redirectUrl={ redirectUrl }
						subscribeToMailingList={ subscribeToMailingList }
						handleCreateAccountError={ ( error, submittedEmail ) => {
							if ( isExistingAccountError( error.error ) ) {
								subscribeToMailingList( {
									email_address: submittedEmail,
									mailing_list_category: queryArguments.mailing_list,
									from: queryArguments.from,
								} );
							}
						} }
						handleCreateAccountSuccess={ ( userData ) => {
							recordRegistration( {
								userData,
								flow: flowName,
								type: 'passwordless',
							} );

							subscribeToMailingList( {
								email_address: userData.email,
								mailing_list_category: queryArguments.mailing_list,
								from: queryArguments.from,
							} );
						} }
					/>
				}
				stepName={ stepName }
			/>
		</div>
	);
}

export default connect(
	( state ) => {
		const queryArguments = getCurrentQueryArguments( state );

		return {
			currentUser: getCurrentUser( state ),
			queryArguments: queryArguments,
		};
	},
	{ redirectToLogout, submitSignupStep }
)( localize( SubscribeEmailStep ) );
