/**
 * External dependencies
 */
import config from '@automattic/calypso-config';
import { __ } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import FormButton from 'calypso/components/forms/form-button';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextarea from 'calypso/components/forms/form-textarea';
import wpcom from 'calypso/lib/wp';
import HelpContactConfirmation from 'calypso/me/help/help-contact-confirmation';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export const sendSiteEditorBetaFeedback = ( message ) => {
	// setIsSubmitting( true );

	// const kayakoMessage = `Site: ${ selectedSite ? selectedSite.URL : 'N/A' }\n\n${ message }`;

	const kayakoMessage = `Site: N/A\n\n${ message }`;

	wpcom
		.undocumented()
		.submitKayakoTicket(
			'[Dotcom FSE Beta]',
			kayakoMessage,
			'N/A',
			config( 'client_slug' ),
			false,
			( error ) => {
				if ( error ) {
					// dispatch( errorNotice( error.message ) );
					// setIsSubmitting( false );
					return;
				}

				// setIsSubmitting( false );
				// setConfirmation( {
				// 	title: __( 'Got it!' ),
				// 	message: __(
				// 		"We've received your feedback. Thank you for helping us making WordPress.com awesome!"
				// 	),
				// } );
			}
		);
};
