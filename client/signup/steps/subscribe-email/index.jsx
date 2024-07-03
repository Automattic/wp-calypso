import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useCallback, useEffect } from '@wordpress/element';
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

function getRedirectUrl( redirect ) {
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

	const redirectUrl = getRedirectUrl( queryArguments.redirect_to );

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

	const handleSubscribeToMailingList = useCallback(
		( { email_address } = { email_address: email } ) => {
			subscribeToMailingList( {
				email_address,
				mailing_list_category: queryArguments.mailing_list,
				from: queryArguments.from,
				first_name: queryArguments.first_name,
				last_name: queryArguments.last_name,
			} );
		},
		[
			email,
			queryArguments.first_name,
			queryArguments.from,
			queryArguments.last_name,
			queryArguments.mailing_list,
			subscribeToMailingList,
		]
	);

	const handlerecordRegistration = useCallback(
		( userData ) => {
			recordRegistration( {
				userData,
				flow: flowName,
				type: 'passwordless',
			} );
		},
		[ flowName ]
	);

	const { mutate: createNewAccount, isPending: isCreateNewAccountPending } =
		useCreateNewAccountMutation( {
			onSuccess: ( response ) => {
				const userData = {
					ID: ( response && response.signup_sandbox_user_id ) || ( response && response.user_id ),
					username:
						( response && response.signup_sandbox_username ) || ( response && response.username ),
					email,
				};

				handlerecordRegistration( userData );
				handleSubscribeToMailingList();
			},
			onError: ( error ) => {
				if ( isExistingAccountError( error.error ) ) {
					handleSubscribeToMailingList();
				}
			},
		} );

	useEffect( () => {
		// 1. User is not logged in and the email submitted to the flow is valid
		if ( ! currentUser && emailValidator.validate( email ) ) {
			createNewAccount( {
				userData: {
					email,
				},
				flowName,
				isPasswordless: true,
			} );
		}

		// 2. User is logged in and their email matches the email submitted to the flow
		if ( currentUser?.email === email ) {
			handleSubscribeToMailingList();
		}
	}, [ createNewAccount, currentUser, email, flowName, handleSubscribeToMailingList ] );

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
								handleSubscribeToMailingList( { email_address: submittedEmail } );
							}
						} }
						handleCreateAccountSuccess={ ( userData ) => {
							handlerecordRegistration( userData );
							handleSubscribeToMailingList( { email_address: userData.email } );
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
