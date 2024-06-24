import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useEffect, useState } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import emailValidator from 'email-validator';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { isExternal } from 'calypso/lib/url';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import SubscribingEmailStepContent from './content';

const createNewAccount = async ( {
	email,
	redirectUrl,
	flowName,
	// recordTracksEvent,
	setIsLoading,
} ) => {
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

		// TODO: Add slug for email campaign
		// recordTracksEvent( 'calypso_signup_new_email_subscription_success', {} );

		return isExternal( redirectUrl )
			? window.location.assign( addQueryArgs( redirectUrl, { subscribed: true } ) )
			: page.redirect( redirectUrl );
	} catch ( error ) {
		if ( [ 'already_taken', 'already_active', 'email_exists' ].includes( error.error ) ) {
			// 1. Subscribe existing user to guides emails through API endpoint https://github.com/Automattic/martech/issues/3090
			// 2. Submit tracks event
			// 3. Redirect to next step

			// recordTracksEvent( 'calypso_signup_existing_email_subscription_success', {} );
			return isExternal( redirectUrl )
				? window.location.assign( addQueryArgs( redirectUrl, { subscribed: true } ) )
				: page.redirect( redirectUrl );
		}

		setIsLoading( false );
		// setSubmitting && setSubmitting( false );
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
						handleSubmitSignup={ ( form ) => {
							setSubmitting( true );
							createNewAccount( { ...props, email: form.email }, setIsLoading, setSubmitting );
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
