import wpcomRequest from 'wpcom-proxy-request';

export function resendSubscriptionConfirmationEmail( emailAddress, postId, key ) {
	return wpcomRequest( {
		path: '/subscribers/emails/resend/subscription-confirmation',
		apiVersion: 'v2',
		apiNamespace: 'wpcom/v2',
		body: {
			email_address: emailAddress,
			post_id: postId,
			key,
		},
		method: 'POST',
	} );
}

export function resendSubscriptionManagementEmail( emailAddress, token ) {
	return wpcomRequest( {
		path: '/subscribers/emails/resend/subscription-management',
		apiVersion: 'v2',
		apiNamespace: 'wpcom/v2',
		body: {
			email_address: emailAddress,
			token,
		},
		method: 'POST',
	} );
}

export const getResendEmailErrorMessages = ( translate ) => {
	return {
		subscriber_not_found: translate( 'There is no subscriber with this email address.' ),
		subscription_not_found: translate( 'There is no subscription with this email address.' ),
		invalid_token: translate( 'The token is not valid for the provided email address.' ),
		rest_invalid_param: translate(
			'One of the parameters is not valid. Please check your inbox for a more recent email.'
		),
		rest_missing_callback_param: translate(
			'One of the parameters is missing. Please check your inbox for a more recent email.'
		),
	};
};
