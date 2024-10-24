import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect, useState } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import DOMPurify from 'dompurify';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { recordRegistration } from 'calypso/lib/analytics/signup';
import { isExistingAccountError } from 'calypso/lib/signup/is-existing-account-error';
import { isRedirectAllowed } from 'calypso/lib/url/is-redirect-allowed';
import wpcom from 'calypso/lib/wp';
import useCreateNewAccountMutation from 'calypso/signup/hooks/use-create-new-account';
import useSubscribeEmail from 'calypso/signup/hooks/use-subscribe-email';
import StepWrapper from 'calypso/signup/step-wrapper';
import { fetchCurrentUser, redirectToLogout } from 'calypso/state/current-user/actions';
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

function getRedirectUrl( redirect ) {
	const baseUrl = 'https://wordpress.com/';

	if ( typeof redirect !== 'string' ) {
		return baseUrl;
	}

	if ( redirect.startsWith( '/' ) ) {
		redirect = 'https://wordpress.com' + redirect;
	}

	if (
		! redirect.startsWith( 'https://' ) &&
		! redirect.startsWith( 'http://' ) &&
		! redirect.startsWith( '/' )
	) {
		redirect = 'https://' + redirect;
	}

	return isRedirectAllowed( redirect ) ? addQueryArgs( redirect, { subscribed: true } ) : baseUrl;
}

/**
 * When someone subscribes to an email campaign on a landing page like wordpress.com/learn, we'd like to
 * manage outbound communication with the Guides platform. Guides, however, requires a user_id and a WordPress
 * account. This flow streamlines the process by combining account creation and email subscription handling
 * into a single step. To use this step, simply render it and provide the necessary query arguments.
 *
 * - If *no* user is logged in, we create a new account and subscribe with the given query params
 * - If the user is logged in, we offer two choices:
 * 		1. They can subscribe using their account email
 *  	2. They can log out and continue subscribing with the given query params
 * - If the email is invalid, we show the passwordless signup form
 */
function SubscribeEmailStep( props ) {
	const { currentUser, flowName, goToNextStep, queryArguments, stepName, translate } = props;

	const { mailing_list, first_name, from, user_email, redirect_to } = queryArguments;
	const email = sanitizeEmail( user_email );
	const redirectUrl = getRedirectUrl( redirect_to );

	const redirectToAfterLoginUrl = currentUser
		? addQueryArgs( window.location.href, { user_email: currentUser?.email } )
		: '';

	const [ isLoading, setIsLoading ] = useState( true );

	const { mutate: subscribeEmail, isPending: isSubscribingEmail } = useSubscribeEmail();

	const subscribeEmailAndSubmitStep = ( { email_address } = { email_address: email } ) => {
		return subscribeEmail(
			{
				email_address,
				mailing_list_category: mailing_list,
				from,
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_signup_email_subscription_success', { mailing_list } );
					props.submitSignupStep( { stepName: 'subscribe' }, { redirect: redirectUrl } );
					goToNextStep();
				},
			}
		);
	};

	const recordPasswordlessRegistration = ( userData ) => {
		recordRegistration( {
			userData,
			flow: flowName,
			type: 'passwordless',
		} );
	};

	const { mutate: createNewAccount, isPending: isCreatingNewAccount } = useCreateNewAccountMutation(
		{
			onSuccess: async ( response ) => {
				const userData = {
					ID: response?.signup_sandbox_user_id || response?.user_id,
					username: response?.signup_sandbox_username || response?.username,
					email,
				};

				recordPasswordlessRegistration( userData );

				/**
				 * We want to log out new users after we subscribe their email. This will
				 * require an updated logout nonce. User data in the store, however, is stale
				 * because we just created a new account. We need to refresh the user data.
				 */
				wpcom.loadToken( response.bearer_token );
				await props.fetchCurrentUser();

				subscribeEmail(
					{
						email_address: email,
						mailing_list_category: mailing_list,
						from,
					},
					{
						onSuccess: () => {
							setIsLoading( true );
							/**
							 * Logged in users will see an "Is it you?" page. Logged out users will
							 * skip the page. To make email capture more seamless at conferences we
							 * keep new users logged out after account creation. This allows us to
							 * capture multiple signups on one device without showing the "Is it you?"
							 * page to each subsequent person.
							 */
							props.redirectToLogout( redirectUrl );
						},
					}
				);
			},
			onError: ( error ) => {
				if ( isExistingAccountError( error.error ) ) {
					subscribeEmailAndSubmitStep();
				}
			},
		}
	);

	// On page load, attempt to subscribe the submitted email to the mailing list
	useEffect( () => {
		if ( ! emailValidator.validate( email ) ) {
			setIsLoading( false );
			return;
		}

		if ( currentUser ) {
			if ( currentUser.email === email ) {
				subscribeEmailAndSubmitStep();
			}

			// Otherwise show the "Is this you?" page
			setIsLoading( false );
			return;
		}

		if ( ! currentUser ) {
			/**
			 * Last name is an optional field in the subscription form, and an empty value may be
			 * submitted. However the API will deem an empty last name invalid and return an error,
			 * so we only include it in the API request if it's a non-empty string.
			 */
			const includeLastName = queryArguments.last_name?.length > 0;

			createNewAccount( {
				userData: {
					email,
					extra: {
						first_name,
						...( includeLastName && { last_name: queryArguments.last_name } ),
					},
				},
				flowName,
				isPasswordless: true,
			} );
		}
	}, [ email ] );

	const isPending = isCreatingNewAccount || isSubscribingEmail || isLoading;

	return (
		<div className="subscribe-email">
			<StepWrapper
				flowName={ flowName }
				fallbackHeaderText={
					currentUser ? translate( 'Is this you?' ) : translate( 'Subscribe to our email list' )
				}
				hideFormattedHeader={ isPending }
				hideBack
				stepContent={
					<SubscribeEmailStepContent
						{ ...props }
						email={ email }
						isPending={ isPending }
						redirectToAfterLoginUrl={ redirectToAfterLoginUrl }
						redirectUrl={ redirectUrl }
						handleCreateAccountError={ ( error, submittedEmail ) => {
							if ( isExistingAccountError( error.error ) ) {
								subscribeEmailAndSubmitStep( { email_address: submittedEmail } );
							}
						} }
						handleCreateAccountSuccess={ ( userData ) => {
							recordPasswordlessRegistration( userData );
							subscribeEmailAndSubmitStep( { email_address: userData.email } );
						} }
						notYouText={ translate(
							'Not you?{{br/}}Log out and {{link}}subscribe with %(email)s{{/link}}',
							{
								components: {
									br: <br />,
									link: (
										<button
											type="button"
											id="subscribeDifferentEmail"
											className="continue-as-user__change-user-link"
											onClick={ () => {
												recordTracksEvent( 'calypso_signup_click_on_change_account' );
												props.redirectToLogout( window.location.href );
											} }
										/>
									),
								},
								args: { email },
								comment: 'Link to continue subscribe to email list as different user',
							}
						) }
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
	{ redirectToLogout, submitSignupStep, fetchCurrentUser }
)( localize( SubscribeEmailStep ) );
