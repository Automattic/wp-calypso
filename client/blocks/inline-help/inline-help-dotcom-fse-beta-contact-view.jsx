/**
 * External dependencies
 */
import config from '@automattic/calypso-config';
import { useI18n } from '@wordpress/react-i18n';
import React, { Fragment, useState } from 'react';
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

export default function InlineHelpDotcomFseBetaContactView() {
	const { __, _x } = useI18n();

	const selectedSite = useSelector( getSelectedSite );
	const currentUserLocale = useSelector( getCurrentUserLocale );
	const dispatch = useDispatch();

	const [ confirmation, setConfirmation ] = useState( null );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ message, setMessage ] = useState( '' );

	// @see client/me/help/help-contact/index.jsx
	const submitKayakoTicket = () => {
		setIsSubmitting( true );

		const kayakoMessage = `Site: ${ selectedSite ? selectedSite.URL : 'N/A' }\n\n${ message }`;

		wpcom
			.undocumented()
			.submitKayakoTicket(
				'[Dotcom FSE Beta]',
				kayakoMessage,
				currentUserLocale,
				config( 'client_slug' ),
				false,
				( error ) => {
					if ( error ) {
						dispatch( errorNotice( error.message ) );
						setIsSubmitting( false );
						return;
					}

					setIsSubmitting( false );
					setConfirmation( {
						title: __( 'Got it!' ),
						message: __(
							"We've received your feedback. Thank you for helping us making WordPress.com awesome!"
						),
					} );
				}
			);
	};

	if ( confirmation ) {
		return <HelpContactConfirmation { ...confirmation } />;
	}

	return (
		<Fragment>
			<FormLabel htmlFor="message">{ __( 'Leave feedback' ) }</FormLabel>
			<FormTextarea
				disabled={ isSubmitting }
				id="message"
				name="message"
				onChange={ ( event ) => setMessage( event.target.value ) }
				placeholder={ __( 'How can we improve the site editing experience?' ) }
				value={ message }
			/>
			<FormButton
				disabled={ isSubmitting || ! message }
				type="button"
				onClick={ submitKayakoTicket }
			>
				{ isSubmitting ? __( 'Sending…' ) : _x( 'Send', 'verb: imperative' ) }
			</FormButton>
		</Fragment>
	);
}
