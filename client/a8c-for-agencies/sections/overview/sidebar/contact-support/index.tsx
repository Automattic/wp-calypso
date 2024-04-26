import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import UserContactSupportModalForm from 'calypso/a8c-for-agencies/components/user-contact-support-modal-form';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export const CONTACT_URL_HASH_FRAGMENT = '#contact-support';

export default function OverviewSidebarContactSupport() {
	const translate = useTranslate();

	const [ showUserSupportForm, setShowUserSupportForm ] = useState(
		window.location.hash === CONTACT_URL_HASH_FRAGMENT
	);
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

	return (
		<>
			<Button className="overview__contact-support-button" onClick={ toggleContactForm }>
				{ translate( 'Contact Support' ) }
			</Button>
			<UserContactSupportModalForm
				show={ showUserSupportForm }
				onClose={ onCloseUserSupportForm }
			/>
		</>
	);
}
