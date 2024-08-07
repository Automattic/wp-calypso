import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import UserContactSupportModalForm from '../user-contact-support-modal-form';

export const CONTACT_URL_HASH_FRAGMENT = '#contact-support';
export const CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT = '#contact-support-migration-offer';

export default function A4AContactSupportWidget() {
	const translate = useTranslate();

	const hashSupportFormHash =
		window.location.hash === CONTACT_URL_HASH_FRAGMENT ||
		window.location.hash === CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT;

	const [ showUserSupportForm, setShowUserSupportForm ] = useState( hashSupportFormHash );

	const onCloseUserSupportForm = useCallback( () => {
		// Remove any hash from the URL.
		history.pushState( null, '', window.location.pathname + window.location.search );
		setShowUserSupportForm( false );
	}, [] );

	// We need make sure to set this to true when we have the support form hash fragment.
	if ( hashSupportFormHash && ! showUserSupportForm ) {
		setShowUserSupportForm( true );
	}

	const migrationOfferDefaultMessage =
		translate( "I'd like to chat more about the migration offer." ) +
		'\n\n' +
		translate( '[your message here]' );

	return (
		<UserContactSupportModalForm
			show={ showUserSupportForm }
			onClose={ onCloseUserSupportForm }
			defaultMessage={
				window.location.hash === CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT
					? migrationOfferDefaultMessage
					: undefined
			}
		/>
	);
}
