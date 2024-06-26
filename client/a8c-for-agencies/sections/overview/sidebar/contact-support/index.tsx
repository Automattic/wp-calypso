import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import UserContactSupportModalForm from 'calypso/a8c-for-agencies/components/user-contact-support-modal-form';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export const CONTACT_URL_HASH_FRAGMENT = '#contact-support';
export const CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT = '#contact-support-migration-offer';

export default function OverviewSidebarContactSupport() {
	const translate = useTranslate();

	const hashSupportFormHash =
		window.location.hash === CONTACT_URL_HASH_FRAGMENT ||
		window.location.hash === CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT;

	const [ showUserSupportForm, setShowUserSupportForm ] = useState( hashSupportFormHash );
	const dispatch = useDispatch();

	const toggleContactForm = () => {
		setShowUserSupportForm( ( prevState ) => {
			const nextState = ! prevState;

			const hashFragment = nextState ? CONTACT_URL_HASH_FRAGMENT : '';

			window.history.replaceState(
				null,
				'',
				window.location.pathname + window.location.search + hashFragment
			);
			dispatch( recordTracksEvent( 'calypso_a4a_overview_contact_support_click' ) );
			return nextState;
		} );
	};

	const onCloseUserSupportForm = useCallback( () => {
		// Remove any hash from the URL.
		history.pushState( null, '', window.location.pathname + window.location.search );
		setShowUserSupportForm( false );
	}, [] );

	// We need make sure to set this to true when we have the support form hash fragment.
	if ( hashSupportFormHash && ! showUserSupportForm ) {
		setShowUserSupportForm( true );
	}

	return (
		<>
			<Button className="overview__contact-support-button" onClick={ toggleContactForm }>
				{ translate( 'Contact sales & support' ) }
			</Button>
			<UserContactSupportModalForm
				show={ showUserSupportForm }
				onClose={ onCloseUserSupportForm }
				defaultMessage={
					window.location.hash === CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT
						? translate( "I'd like to chat more about the migration offer." )
						: undefined
				}
			/>
		</>
	);
}
