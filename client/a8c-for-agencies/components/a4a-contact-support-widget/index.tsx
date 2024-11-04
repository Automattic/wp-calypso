import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import MigrationContactSupportForm from '../a4a-migration-offer-v2/migration-contact-support-form';
import UserContactSupportModalForm from '../user-contact-support-modal-form';
import getDefaultProduct from './get-default-product';

export const CONTACT_URL_HASH_FRAGMENT = '#contact-support';
export const CONTACT_URL_HASH_FRAGMENT_WITH_PRODUCT = '#contact-support-a4a';
export const CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT = '#contact-support-migration-offer';

export default function A4AContactSupportWidget() {
	const translate = useTranslate();

	const supportFormHash =
		window.location.hash === CONTACT_URL_HASH_FRAGMENT ||
		window.location.hash === CONTACT_URL_HASH_FRAGMENT_WITH_PRODUCT ||
		window.location.hash === CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT;

	const [ showUserSupportForm, setShowUserSupportForm ] = useState( supportFormHash );

	const isNewHostingPage = isEnabled( 'a4a-hosting-page-redesign' );

	const onCloseUserSupportForm = useCallback( () => {
		// Remove any hash from the URL.
		history.pushState( null, '', window.location.pathname + window.location.search );
		setShowUserSupportForm( false );
	}, [] );

	// We need make sure to set this to true when we have the support form hash fragment.
	if ( supportFormHash && ! showUserSupportForm ) {
		setShowUserSupportForm( true );
	}

	// TODO: remove this when we remove the feature flag for the new hosting page.
	const migrationOfferDefaultMessage =
		translate( "I'd like to chat more about the migration offer." ) +
		'\n\n' +
		translate( '[your message here]' );

	const defaultProduct =
		window.location.hash === CONTACT_URL_HASH_FRAGMENT_WITH_PRODUCT ? getDefaultProduct() : '';

	return isNewHostingPage &&
		window.location.hash === CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT ? (
		<MigrationContactSupportForm show={ showUserSupportForm } onClose={ onCloseUserSupportForm } />
	) : (
		<UserContactSupportModalForm
			show={ showUserSupportForm }
			onClose={ onCloseUserSupportForm }
			defaultMessage={
				window.location.hash === CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT
					? migrationOfferDefaultMessage
					: undefined
			}
			defaultProduct={ defaultProduct }
		/>
	);
}
