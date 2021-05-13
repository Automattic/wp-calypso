/**
 * External dependencies
 */

import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import RedirectWhenLoggedIn from 'calypso/components/redirect-when-logged-in';
import {
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { withEnhancers } from 'calypso/state/utils';

/**
 * Image dependencies
 */
import checkEmailJetpackImage from 'calypso/assets/images/illustrations/check-email-jetpack.svg';

interface Props {
	emailAddress: string;
}

const EmailedLoginLinkSuccessfullyJetpackConnect: FC< Props > = ( { emailAddress } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		const enhancedRecordPageView = withEnhancers( recordPageView, [ enhanceWithSiteType ] );
		dispatch( enhancedRecordPageView( '/log-in/jetpack/link', 'Login > Link > Emailed' ) );
	}, [] );

	return (
		<div className="magic-login__successfully-jetpack">
			<RedirectWhenLoggedIn
				redirectTo="/help"
				replaceCurrentLocation={ true }
				waitForEmailAddress={ emailAddress }
			/>

			<h1 className="magic-login__form-header">{ translate( 'Check your email!' ) }</h1>

			<img
				alt=""
				src={ checkEmailJetpackImage }
				className="magic-login__check-email-image jetpack"
			/>

			<p>
				{ emailAddress
					? translate( 'We just emailed a link to {{strong}}%(emailAddress)s{{/strong}}.', {
							args: {
								emailAddress,
							},
							components: {
								strong: <strong />,
							},
					  } )
					: translate( 'We just emailed you a link.' ) }
			</p>
			<p>{ translate( 'Please check your inbox and click the link to log in.' ) }</p>
		</div>
	);
};

export default EmailedLoginLinkSuccessfullyJetpackConnect;
