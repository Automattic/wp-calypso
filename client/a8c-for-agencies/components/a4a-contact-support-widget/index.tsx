import { isEnabled } from '@automattic/calypso-config';
import { useCallback, useState } from 'react';
import MigrationContactSupportForm from '../a4a-migration-offer-v2/migration-contact-support-form';
import UserContactSupportModalForm from '../user-contact-support-modal-form';

export const CONTACT_URL_HASH_FRAGMENT = '#contact-support';
export const CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT = '#contact-support-migration-offer';

export default function A4AContactSupportWidget() {
	const hashSupportFormHash =
		window.location.hash === CONTACT_URL_HASH_FRAGMENT ||
		window.location.hash === CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT;

	const [ showUserSupportForm, setShowUserSupportForm ] = useState( hashSupportFormHash );

	const isNewHostingPage = isEnabled( 'a4a-hosting-page-redesign' );

	const onCloseUserSupportForm = useCallback( () => {
		// Remove any hash from the URL.
		history.pushState( null, '', window.location.pathname + window.location.search );
		setShowUserSupportForm( false );
	}, [] );

	// We need make sure to set this to true when we have the support form hash fragment.
	if ( hashSupportFormHash && ! showUserSupportForm ) {
		setShowUserSupportForm( true );
	}

	return isNewHostingPage &&
		window.location.hash === CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT ? (
		<MigrationContactSupportForm show={ showUserSupportForm } onClose={ onCloseUserSupportForm } />
	) : (
		<UserContactSupportModalForm show={ showUserSupportForm } onClose={ onCloseUserSupportForm } />
	);
}
